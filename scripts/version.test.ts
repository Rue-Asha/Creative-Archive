import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

test('Scenario: Package and lockfile carry 0.3.0', () => {
	const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
	const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
	expect([pkg.version, lock.version, lock.packages[''].version]).toEqual(['0.3.0', '0.3.0', '0.3.0']);
});
