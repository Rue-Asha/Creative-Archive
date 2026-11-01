import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, expect, test } from 'vitest';

const entry = resolve('build');
let dir: string;
let child: ChildProcess | undefined;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), 'archive-server-'));
});

afterEach(() => {
	child?.kill();
	child = undefined;
	rmSync(dir, { recursive: true, force: true });
});

function freePort(): Promise<number> {
	return new Promise((done) => {
		const s = createServer().listen(0, () => {
			const { port } = s.address() as { port: number };
			s.close(() => done(port));
		});
	});
}

function start(db: string, port: number): { proc: ChildProcess; stderr: () => string } {
	const proc = spawn('node', [entry], {
		cwd: dir,
		env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', DATABASE_PATH: db }
	});
	let err = '';
	proc.stderr.on('data', (c) => (err += c));
	child = proc;
	return { proc, stderr: () => err };
}

async function healthz(port: number, proc: ChildProcess): Promise<number> {
	for (let i = 0; i < 100; i++) {
		if (proc.exitCode !== null) throw new Error(`server exited with ${proc.exitCode}`);
		try {
			return (await fetch(`http://127.0.0.1:${port}/healthz`)).status;
		} catch {
			await new Promise((r) => setTimeout(r, 100));
		}
	}
	throw new Error('server did not answer');
}

test('Scenario: Server starts from any working directory', async () => {
	const db = join(dir, 'cwd.db');
	const port = await freePort();
	const { proc } = start(db, port);

	expect(await healthz(port, proc)).toBe(200);

	const check = new DatabaseSync(db, { readOnly: true });
	const names = check.prepare('SELECT name FROM schema_migrations').all().map((r) => r.name);
	check.close();
	expect(names).toContain('0001_images.sql');
}, 20_000);

test('Scenario: Failing migration stops the server', async () => {
	const db = join(dir, 'broken.db');
	const pre = new DatabaseSync(db);
	pre.exec('CREATE TABLE images (id INTEGER PRIMARY KEY)');
	pre.close();
	const { proc, stderr } = start(db, await freePort());

	const code = await new Promise<number | null>((done) => proc.on('exit', done));

	expect(code).not.toBe(0);
	expect(stderr()).toContain('0001_images.sql');
	const check = new DatabaseSync(db, { readOnly: true });
	const names = check.prepare('SELECT name FROM schema_migrations').all().map((r) => r.name);
	check.close();
	expect(names).not.toContain('0001_images.sql');
}, 20_000);
