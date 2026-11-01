import { describe, expect, it } from 'vitest';
import { activeSection } from './nav.ts';

describe('activeSection', () => {
	it('Scenario: Active section follows the path', () => {
		expect(activeSection('/', 'home')).toBe('home');
		expect(activeSection('/books/books', 'books')).toBe('books');
		expect(activeSection('/entries/3', 'animanga')).toBe('animanga');
		expect(activeSection('/add/piece', 'fashion')).toBe('fashion');
		expect(activeSection('/collections/2', 'home')).toBe('collections');
		expect(activeSection('/settings', 'home')).toBe('settings');
	});

	it('does not mistake a path that merely starts with the same letters', () => {
		expect(activeSection('/collectionsx', 'home')).toBe('home');
		expect(activeSection('/settings-old', 'home')).toBe('home');
	});

	it('marks the collections index', () => {
		expect(activeSection('/collections', 'home')).toBe('collections');
	});
});
