import { describe, expect, it } from 'vitest';
import { fold } from './text.ts';

describe('fold', () => {
	it('folds Ästhetik and ästhetik to the same key', () => {
		expect(fold('Ästhetik')).toBe('ästhetik');
		expect(fold('ÄSTHETIK')).toBe(fold('ästhetik'));
	});

	it('trims and collapses runs of whitespace', () => {
		expect(fold('  City \t Pop\n ')).toBe('city pop');
	});

	it('normalises decomposed characters to NFC', () => {
		const decomposed = 'Ästhetik';

		expect(fold(decomposed)).toBe('ästhetik');
	});

	it('keeps scripts without case as they are', () => {
		expect(fold(' 村上春樹 ')).toBe('村上春樹');
	});

	it('returns an empty string for blank input', () => {
		expect(fold('   ')).toBe('');
	});
});
