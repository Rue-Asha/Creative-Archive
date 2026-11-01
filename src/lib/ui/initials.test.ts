import { describe, expect, it } from 'vitest';
import { initials } from './initials.ts';

describe('initials', () => {
	it('Scenario: Placeholder shows a tint and initials', () => {
		expect(initials("Frieren Beyond Journey's End")).toBe('FB');
		expect(initials('ästhetik archive')).toBe('ÄA');
		expect(initials('村上春樹')).toBe('村上');
	});

	it('skips punctuation and keeps whole graphemes', () => {
		expect(initials('  (the) "Blonde"  ')).toBe('TB');
		expect(initials('Blonde')).toBe('BL');
		expect(initials('🌸 Sakura')).toBe('🌸S');
		expect(initials('')).toBe('');
	});
});
