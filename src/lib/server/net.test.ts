import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FetchError } from '#lib/errors.ts';
import { DEFAULT_TIMEOUT_MS, isBlockedAddress, safeFetch } from './net.ts';
import { createRemote } from './remote.ts';

const ALLOW = ['127.0.0.2'];
const servers: Server[] = [];

async function serve(handler: (req: IncomingMessage, res: ServerResponse) => void, host = '127.0.0.2'): Promise<string> {
	const server = createServer(handler);
	servers.push(server);
	await new Promise<void>((resolve) => server.listen(0, host, resolve));
	return `http://${host}:${(server.address() as AddressInfo).port}`;
}

afterEach(async () => {
	await Promise.all(
		servers.splice(0).map(
			(s) =>
				new Promise<void>((resolve) => {
					s.close(() => resolve());
					s.closeAllConnections();
				})
		)
	);
});

async function code(p: Promise<unknown>): Promise<string> {
	const err = await p.then(
		() => null,
		(e) => e
	);
	expect(err).toBeInstanceOf(FetchError);
	return (err as FetchError).code;
}

const opts = { maxBytes: 1024 * 1024, allowAddresses: ALLOW };

describe('safeFetch', () => {
	it('Scenario: Only http and https URLs are fetched', async () => {
		let lookups = 0;
		const lookup = async () => {
			lookups++;
			return [{ address: '93.184.216.34', family: 4 as const }];
		};
		const cases: [string, string][] = [
			['ftp://example.com/', 'scheme'],
			['file:///etc/passwd', 'scheme'],
			['javascript:alert(1)', 'scheme'],
			['not a url', 'invalid-url']
		];

		for (const [url, expected] of cases) {
			expect(await code(safeFetch(url, { ...opts, lookup })), url).toBe(expected);
		}
		expect(lookups).toBe(0);
	});

	it('Scenario: Loopback and private addresses are refused', async () => {
		let lookups = 0;
		const lookup = async () => {
			lookups++;
			return [{ address: '93.184.216.34', family: 4 as const }];
		};
		const urls = [
			'http://127.0.0.1/',
			'http://localhost/',
			'http://[::1]/',
			'http://10.0.0.5/',
			'http://172.16.0.1/',
			'http://192.168.1.10/',
			'http://169.254.169.254/',
			'http://100.64.0.1/',
			'http://0.0.0.0/',
			'http://[fd00::1]/',
			'http://[fe80::1]/',
			'http://[::ffff:127.0.0.1]/'
		];

		// a connection attempt to port 80 would fail as 'network', so the code also shows nothing was dialled
		for (const url of urls) {
			expect(await code(safeFetch(url, { maxBytes: 1024, lookup })), url).toBe('private-address');
		}
		expect(lookups).toBe(0);
	});

	it('Scenario: Hostname resolving to a private address is refused', async () => {
		const lookup = async () => [{ address: '10.1.2.3', family: 4 as const }];

		expect(await code(safeFetch('http://intranet.example/', { maxBytes: 1024, lookup }))).toBe('private-address');
	});

	it('refuses a hostname when any of its addresses is private', async () => {
		const lookup = async () => [
			{ address: '93.184.216.34', family: 4 as const },
			{ address: '::1', family: 6 as const }
		];

		expect(await code(safeFetch('http://mixed.example/', { maxBytes: 1024, lookup }))).toBe('private-address');
	});

	it('fetches a hostname through the checked address only', async () => {
		const base = await serve((_req, res) => {
			res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
			res.end('<title>hi</title>');
		});
		const port = new URL(base).port;
		const lookup = async () => [{ address: '127.0.0.2', family: 4 as const }];

		const res = await safeFetch(`http://pinned.example:${port}/page`, { ...opts, lookup });

		expect(res.status).toBe(200);
		expect(res.contentType).toBe('text/html; charset=utf-8');
		expect(res.url).toBe(`http://pinned.example:${port}/page`);
		expect(new TextDecoder().decode(res.body)).toBe('<title>hi</title>');
	});

	it('Scenario: Redirect to a private address is refused', async () => {
		const hits: string[] = [];
		const target = await serve((req, res) => {
			hits.push(req.url ?? '');
			res.end('secret');
		}, '127.0.0.1');
		const base = await serve((_req, res) => {
			res.writeHead(302, { location: `${target}/admin` });
			res.end();
		});

		expect(await code(safeFetch(`${base}/start`, opts))).toBe('private-address');
		expect(hits).toEqual([]);
	});

	it('follows a redirect and re-checks it', async () => {
		const base = await serve((req, res) => {
			if (req.url === '/a') {
				res.writeHead(301, { location: '/b' });
				res.end();
			} else res.end('landed');
		});

		const res = await safeFetch(`${base}/a`, opts);

		expect(res.url).toBe(`${base}/b`);
		expect(new TextDecoder().decode(res.body)).toBe('landed');
	});

	it('Scenario: Too many redirects fail', async () => {
		let n = 0;
		const base = await serve((_req, res) => {
			n++;
			res.writeHead(302, { location: `/r${n}` });
			res.end();
		});

		expect(await code(safeFetch(`${base}/`, opts))).toBe('redirects');
		expect(n).toBe(4);
	});

	it('Scenario: Slow page times out after 5 seconds', async () => {
		let stalled!: () => void;
		const arrived = new Promise<void>((resolve) => (stalled = resolve));
		const base = await serve((_req, res) => {
			res.writeHead(200, { 'content-type': 'text/html' });
			res.flushHeaders();
			stalled();
		});

		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
		try {
			const outcome = code(safeFetch(`${base}/`, opts));
			await arrived;
			const state = () => Promise.race([outcome, Promise.resolve('pending')]);
			expect(DEFAULT_TIMEOUT_MS).toBe(5000);
			await vi.advanceTimersByTimeAsync(4999);
			expect(await state()).toBe('pending');
			await vi.advanceTimersByTimeAsync(1);
			expect(await outcome).toBe('timeout');
		} finally {
			vi.useRealTimers();
		}
	});

	it('a shorter timeoutMs times out sooner', async () => {
		const base = await serve((_req, res) => {
			res.writeHead(200, { 'content-type': 'text/html' });
			res.flushHeaders();
		});

		const started = Date.now();
		expect(await code(safeFetch(`${base}/`, { ...opts, timeoutMs: 300 }))).toBe('timeout');
		expect(Date.now() - started).toBeLessThan(2000);
	});

	it('times out a hostname lookup that never answers', async () => {
		const lookup = () => new Promise<never>(() => {});

		expect(await code(safeFetch('http://hang.example/', { maxBytes: 1024, lookup, timeoutMs: 100 }))).toBe('timeout');
	});

	it('Scenario: Oversized page is cut at 1 MB', async () => {
		let finished = false;
		const base = await serve((_req, res) => {
			res.writeHead(200, { 'content-type': 'text/html' });
			res.write('<meta property="og:title" content="Kept">');
			const chunk = Buffer.alloc(64 * 1024, 'a');
			let sent = 0;
			const pump = () => {
				while (sent < 3 * 1024 * 1024) {
					sent += chunk.length;
					if (!res.write(chunk)) return void res.once('drain', pump);
				}
				finished = true;
				res.end();
			};
			pump();
		});

		const res = await safeFetch(`${base}/`, { ...opts, maxBytes: 1024 * 1024, truncate: true });

		expect(res.body.length).toBe(1024 * 1024);
		expect(new TextDecoder().decode(res.body.subarray(0, 40))).toContain('og:title');
		await new Promise((r) => setTimeout(r, 50));
		expect(finished).toBe(false);
	});

	it('Scenario: Oversized image fails', async () => {
		const base = await serve((_req, res) => {
			res.writeHead(200, { 'content-type': 'image/png' });
			const chunk = Buffer.alloc(256 * 1024, 1);
			let sent = 0;
			const pump = () => {
				while (sent < 17 * 1024 * 1024) {
					sent += chunk.length;
					if (!res.write(chunk)) return void res.once('drain', pump);
				}
				res.end();
			};
			pump();
		});

		expect(await code(safeFetch(`${base}/`, { ...opts, maxBytes: 16 * 1024 * 1024 }))).toBe('too-large');
	});

	it('fails at once when the declared length exceeds the cap', async () => {
		const base = await serve((_req, res) => {
			res.writeHead(200, { 'content-length': String(5 * 1024 * 1024) });
			res.flushHeaders();
		});

		expect(await code(safeFetch(`${base}/`, { ...opts, maxBytes: 1024 }))).toBe('too-large');
	});

	it('returns non-2xx responses with their status', async () => {
		const base = await serve((_req, res) => {
			res.writeHead(404);
			res.end('nope');
		});

		const res = await safeFetch(`${base}/`, opts);

		expect(res.status).toBe(404);
	});

	it('sends method, headers and body', async () => {
		let seen = '';
		const base = await serve((req, res) => {
			let body = '';
			req.on('data', (d) => (body += d));
			req.on('end', () => {
				seen = `${req.method} ${req.headers['x-test']} ${body}`;
				res.end('ok');
			});
		});

		await safeFetch(`${base}/`, { ...opts, method: 'POST', headers: { 'x-test': 'yes' }, body: '{"q":1}' });

		expect(seen).toBe('POST yes {"q":1}');
	});

	it('reports a refused connection as network', async () => {
		const base = await serve((_req, res) => res.end());
		const dead = base.replace(/:\d+$/, ':1');

		expect(await code(safeFetch(`${dead}/`, opts))).toBe('network');
	});
});

describe('isBlockedAddress', () => {
	it.each([
		'0.0.0.0',
		'0.1.2.3',
		'10.0.0.1',
		'100.64.0.1',
		'100.127.255.255',
		'127.0.0.1',
		'169.254.1.1',
		'172.16.0.1',
		'172.31.255.255',
		'192.168.0.1',
		'224.0.0.1',
		'239.255.255.255',
		'255.255.255.255',
		'::',
		'::1',
		'fc00::1',
		'fdff::1',
		'fe80::1',
		'febf::1',
		'ff02::1',
		'::ffff:127.0.0.1',
		'::ffff:7f00:1',
		'::ffff:10.0.0.1',
		'::ffff:a00:1',
		'64:ff9b::7f00:1',
		'2002:7f00:1::',
		'not an address'
	])('blocks %s', (address) => {
		expect(isBlockedAddress(address)).toBe(true);
	});

	it.each([
		'8.8.8.8',
		'93.184.216.34',
		'100.63.255.255',
		'100.128.0.1',
		'172.15.255.255',
		'172.32.0.1',
		'192.167.255.255',
		'223.255.255.255',
		'2606:4700:4700::1111',
		'2001:4860:4860::8888',
		'::ffff:8.8.8.8',
		'::ffff:808:808'
	])('allows %s', (address) => {
		expect(isBlockedAddress(address)).toBe(false);
	});
});

describe('safeRemote', () => {
	const remote = createRemote({ allowAddresses: ALLOW });

	it('fetches a page as text and truncates it at 1 MB', async () => {
		const base = await serve((_req, res) => {
			res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
			res.end('<title>Ä</title>' + 'a'.repeat(2 * 1024 * 1024));
		});

		const page = await remote.fetchPage(`${base}/p`);

		expect(page.url).toBe(`${base}/p`);
		expect(page.html.startsWith('<title>Ä</title>')).toBe(true);
		expect(Buffer.byteLength(page.html)).toBe(1024 * 1024);
	});

	it('sends the Creative-Archive user agent', async () => {
		let agent = '';
		const base = await serve((req, res) => {
			agent = String(req.headers['user-agent']);
			res.writeHead(200, { 'content-type': 'text/html' });
			res.end('<title>x</title>');
		});

		await remote.fetchPage(`${base}/`);

		expect(agent).toMatch(/^Creative-Archive\/\d+\.\d+\.\d+ \(private archive\)$/);
	});

	it('refuses a page that is not text/html', async () => {
		const base = await serve((_req, res) => {
			res.writeHead(200, { 'content-type': 'application/json' });
			res.end('{}');
		});

		expect(await code(remote.fetchPage(`${base}/`))).toBe('status');
	});

	it('refuses a page with an error status', async () => {
		const base = await serve((_req, res) => {
			res.writeHead(403, { 'content-type': 'text/html' });
			res.end('<title>no</title>');
		});

		expect(await code(remote.fetchPage(`${base}/`))).toBe('status');
	});

	it('fetches an image and refuses other content types', async () => {
		const base = await serve((req, res) => {
			res.writeHead(200, { 'content-type': req.url === '/a.png' ? 'image/png' : 'text/html' });
			res.end(Buffer.from([1, 2, 3]));
		});

		expect([...(await remote.fetchImage(`${base}/a.png`))]).toEqual([1, 2, 3]);
		const err = await remote.fetchImage(`${base}/page`).then(
			() => null,
			(e) => e
		);
		expect(err.code).toBe('not-image');
	});

	it('fails an image over 16 MB as too-large', async () => {
		const base = await serve((_req, res) => {
			res.writeHead(200, { 'content-type': 'image/png' });
			res.end(Buffer.alloc(16 * 1024 * 1024 + 1));
		});

		expect(await code(remote.fetchImage(`${base}/big.png`))).toBe('too-large');
	});

	it('refuses private addresses with the real remote', async () => {
		expect(await code(createRemote().fetchPage('http://127.0.0.1/'))).toBe('private-address');
	});
});
