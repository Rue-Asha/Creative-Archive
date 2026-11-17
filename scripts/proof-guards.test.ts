import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('Scenario: Proof runs the fingerprint guards', () => {
	const { scripts } = JSON.parse(readFileSync('package.json', 'utf8'));
	const proof: string = scripts.proof;
	const slop = proof.indexOf('node scripts/fingerprint/check-slop.mjs');
	const drift = proof.indexOf('node scripts/fingerprint/check-drift.mjs');
	const check = proof.indexOf('npm run check');
	expect(slop).toBeGreaterThanOrEqual(0);
	expect(drift).toBeGreaterThan(slop);
	expect(check).toBeGreaterThan(drift);
});

it('Scenario: Vendored files match the lock', () => {
	const run = spawnSync('node', ['scripts/fingerprint/check-drift.mjs'], { encoding: 'utf8' });
	expect(run.status, run.stdout + run.stderr).toBe(0);
	expect(JSON.parse(readFileSync('fingerprint.lock', 'utf8')).version).toBe('2.1.0');
});
