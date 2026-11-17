import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { themeColors } from './theme.ts';

// vitest stubs CSS imports, `?raw` included, so the tokens are read from disk here
const tokens = readFileSync('src/lib/styles/fingerprint/tokens.css', 'utf8');

describe('theme colours', () => {
	it('Scenario: The status bar colours come from the fingerprint tokens', () => {
		expect(themeColors(tokens)).toEqual({ home: '#E7E2DC', music: '#2A191C', animanga: '#11142B', books: '#16252A', fashion: '#29211D' });
	});

	it('a missing token fails loudly', () => {
		expect(() => themeColors(':root { --surface-page: #E7E2DC; }')).toThrow(/--world-night/);
	});
});
