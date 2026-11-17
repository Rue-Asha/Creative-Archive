import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('Scenario: Old style files are gone', () => {
	const gone = [
		'src/lib/styles/tokens.css',
		'src/lib/styles/tokens.ts',
		'src/lib/styles/worlds.ts',
		'src/lib/styles/global.css',
		'static/fonts/bricolage-grotesque-latin-opsz-normal.woff2',
		'src/routes/__mockups/components',
		'src/routes/__mockups/[world]'
	];
	expect(gone.filter((path) => existsSync(path))).toEqual([]);
});

it('Scenario: Proof runs check-slop without a baseline', () => {
	const { scripts } = JSON.parse(readFileSync('package.json', 'utf8'));
	expect(scripts.proof).toMatch(/^node scripts\/fingerprint\/check-slop\.mjs && node scripts\/fingerprint\/check-drift\.mjs && /);
	expect(scripts.proof).not.toContain('baseline');
	expect(readdirSync('scripts').filter((name) => name.startsWith('slop-baseline'))).toEqual([]);
});
