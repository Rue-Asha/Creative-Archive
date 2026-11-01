import { lookup as dnsLookup } from 'node:dns/promises';
import http, { type IncomingMessage } from 'node:http';
import https from 'node:https';
import { isIP } from 'node:net';
import { FetchError } from '#lib/errors.ts';

export interface SafeFetchOptions {
	maxBytes: number;
	timeoutMs?: number;
	// stop at maxBytes instead of throwing
	truncate?: boolean;
	method?: 'GET' | 'POST';
	headers?: Record<string, string>;
	body?: string;
	lookup?: (host: string) => Promise<{ address: string; family: 4 | 6 }[]>;
	// tests only: exempt exact addresses, e.g. a node:http server bound to 127.0.0.2
	allowAddresses?: string[];
}

export interface SafeResponse {
	url: string;
	status: number;
	contentType: string | null;
	body: Uint8Array;
}

export const DEFAULT_TIMEOUT_MS = 5000;
const MAX_REDIRECTS = 3;
const REDIRECTS = new Set([301, 302, 303, 307, 308]);

type Target = { address: string; family: 4 | 6 };

function ipv4Blocked([a, b, c]: number[]): boolean {
	return (
		a === 0 ||
		a === 10 ||
		(a === 100 && b >= 64 && b <= 127) ||
		a === 127 ||
		(a === 169 && b === 254) ||
		(a === 172 && b >= 16 && b <= 31) ||
		(a === 192 && b === 0 && c === 0) ||
		(a === 192 && b === 168) ||
		a >= 224
	);
}

function parseIPv4(s: string): number[] | null {
	const parts = s.split('.');
	if (parts.length !== 4) return null;
	const nums = parts.map((p) => (/^\d{1,3}$/.test(p) ? Number(p) : NaN));
	return nums.every((n) => n <= 255) ? nums : null;
}

function parseIPv6(s: string): number[] | null {
	let text = s.split('%')[0];
	const dotted = text.match(/(\d+\.\d+\.\d+\.\d+)$/);
	if (dotted) {
		const v4 = parseIPv4(dotted[1]);
		if (!v4) return null;
		text = text.slice(0, -dotted[1].length) + ((v4[0] << 8) | v4[1]).toString(16) + ':' + ((v4[2] << 8) | v4[3]).toString(16);
	}
	const halves = text.split('::');
	if (halves.length > 2) return null;
	const head = halves[0] ? halves[0].split(':') : [];
	const tail = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
	const fill = 8 - head.length - tail.length;
	if (halves.length === 2 ? fill < 1 : fill !== 0) return null;
	const groups = [...head, ...Array(halves.length === 2 ? fill : 0).fill('0'), ...tail];
	const nums = groups.map((g) => (/^[0-9a-f]{1,4}$/i.test(g) ? parseInt(g, 16) : NaN));
	return nums.length === 8 && nums.every((n) => !Number.isNaN(n)) ? nums : null;
}

const quad = (hi: number, lo: number) => [hi >> 8, hi & 255, lo >> 8, lo & 255];

export function isBlockedAddress(address: string): boolean {
	const v4 = parseIPv4(address);
	if (v4) return ipv4Blocked(v4);
	const g = parseIPv6(address);
	if (!g) return true;
	// the first 96 bits all zero covers :: and ::1
	if (g.slice(0, 6).every((n) => n === 0)) return true;
	if (g.slice(0, 5).every((n) => n === 0) && g[5] === 0xffff) return ipv4Blocked(quad(g[6], g[7]));
	if (g[0] === 0x64 && g[1] === 0xff9b && g.slice(2, 6).every((n) => n === 0)) return ipv4Blocked(quad(g[6], g[7]));
	if (g[0] === 0x2002) return ipv4Blocked(quad(g[1], g[2]));
	return (g[0] & 0xfe00) === 0xfc00 || (g[0] & 0xffc0) === 0xfe80 || (g[0] & 0xffc0) === 0xfec0 || (g[0] & 0xff00) === 0xff00;
}

function within<T>(p: Promise<T>, signal: AbortSignal): Promise<T> {
	return new Promise((resolve, reject) => {
		const abort = () => reject(new FetchError('timeout'));
		if (signal.aborted) return abort();
		signal.addEventListener('abort', abort, { once: true });
		p.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
	});
}

async function resolveTarget(url: URL, opts: SafeFetchOptions, signal: AbortSignal): Promise<Target> {
	if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new FetchError('scheme');
	const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
	if (host === 'localhost' || host.endsWith('.localhost')) throw new FetchError('private-address');
	const family = isIP(host);
	let addresses: Target[];
	if (family) addresses = [{ address: host, family: family as 4 | 6 }];
	else {
		const lookup = opts.lookup ?? ((h: string) => dnsLookup(h, { all: true }) as Promise<Target[]>);
		addresses = await within(lookup(host), signal).catch((e) => {
			throw e instanceof FetchError ? e : new FetchError('network');
		});
	}
	if (addresses.length === 0) throw new FetchError('network');
	const allowed = opts.allowAddresses ?? [];
	if (addresses.some((a) => isBlockedAddress(a.address) && !allowed.includes(a.address))) {
		throw new FetchError('private-address');
	}
	return addresses[0];
}

function send(
	url: URL,
	target: Target,
	method: string,
	headers: Record<string, string>,
	body: string | undefined,
	signal: AbortSignal
): Promise<IncomingMessage> {
	return new Promise((resolve, reject) => {
		const lib = url.protocol === 'https:' ? https : http;
		const req = lib.request(
			url,
			{
				method,
				headers,
				signal,
				// the connection only ever uses the address that was checked above
				lookup: ((_host: string, options: { all?: boolean }, cb: (...args: unknown[]) => void) =>
					options.all ? cb(null, [target]) : cb(null, target.address, target.family)) as never
			},
			resolve
		);
		req.on('error', reject);
		req.end(body);
	});
}

async function readBody(res: IncomingMessage, opts: SafeFetchOptions): Promise<Uint8Array> {
	if (!opts.truncate && Number(res.headers['content-length']) > opts.maxBytes) {
		res.destroy();
		throw new FetchError('too-large');
	}
	const chunks: Buffer[] = [];
	let total = 0;
	for await (const chunk of res as AsyncIterable<Buffer>) {
		total += chunk.length;
		if (total > opts.maxBytes) {
			if (!opts.truncate) throw new FetchError('too-large');
			chunks.push(chunk.subarray(0, chunk.length - (total - opts.maxBytes)));
			res.destroy();
			return Buffer.concat(chunks);
		}
		chunks.push(chunk);
	}
	return Buffer.concat(chunks);
}

export async function safeFetch(url: string, opts: SafeFetchOptions): Promise<SafeResponse> {
	let current: URL;
	try {
		current = new URL(url);
	} catch {
		throw new FetchError('invalid-url');
	}
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
	let method: string = opts.method ?? 'GET';
	let body = opts.body;
	try {
		for (let redirects = 0; ; redirects++) {
			const target = await resolveTarget(current, opts, ctrl.signal);
			const headers = { ...opts.headers, ...(body === undefined ? {} : { 'content-length': String(Buffer.byteLength(body)) }) };
			const res = await send(current, target, method, headers, body, ctrl.signal);
			const status = res.statusCode ?? 0;
			const location = res.headers.location;
			if (REDIRECTS.has(status) && location) {
				res.destroy();
				if (redirects === MAX_REDIRECTS) throw new FetchError('redirects');
				try {
					current = new URL(location, current);
				} catch {
					throw new FetchError('invalid-url');
				}
				if (status === 303 || ((status === 301 || status === 302) && method === 'POST')) {
					method = 'GET';
					body = undefined;
				}
				continue;
			}
			return {
				url: current.href,
				status,
				contentType: res.headers['content-type'] ?? null,
				body: await readBody(res, opts)
			};
		}
	} catch (e) {
		if (e instanceof FetchError) throw e;
		throw new FetchError(ctrl.signal.aborted ? 'timeout' : 'network');
	} finally {
		clearTimeout(timer);
	}
}
