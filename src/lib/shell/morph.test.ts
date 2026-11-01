import { afterEach, describe, expect, it, vi } from 'vitest';
import { morphTarget, pageTransition } from './morph.ts';

describe('morphTarget', () => {
	it('Scenario: Morph targets follow the URLs', () => {
		expect(morphTarget('/music/albums', '/entries/7')).toEqual({ id: 7, direction: 'forward' });
		expect(morphTarget('/entries/7', '/music/albums')).toEqual({ id: 7, direction: 'back' });
		expect(morphTarget('/', '/books')).toBeNull();
	});

	it('only the detail page itself morphs, not its edit page or lookalikes', () => {
		expect(morphTarget('/music/albums', '/entries/7/edit')).toBeNull();
		expect(morphTarget('/entries/7/edit', '/music/albums')).toBeNull();
		expect(morphTarget('/entries/7/edit', '/entries/7')).toBeNull();
		expect(morphTarget('/music', '/entries/abc')).toBeNull();
		expect(morphTarget('/music', '/entries/7x')).toBeNull();
	});

	it('moving from one detail page to another morphs into the new one', () => {
		expect(morphTarget('/entries/5', '/entries/7')).toEqual({ id: 7, direction: 'forward' });
	});

	it('tolerates a trailing slash', () => {
		expect(morphTarget('/music/albums', '/entries/7/')).toEqual({ id: 7, direction: 'forward' });
	});
});

class FakeEl {
	getBoundingClientRect = () => ({ top: 0, bottom: 10, left: 0, right: 10 });
	style = {
		names: new Map<string, string>(),
		setProperty: (k: string, v: string) => this.style.names.set(k, v),
		removeProperty: (k: string) => this.style.names.delete(k)
	};
}

function setup({ reduced = false, supported = true } = {}) {
	const old = new FakeEl();
	const fresh = new FakeEl();
	const calls = { start: 0, namesAtStart: undefined as string | undefined };
	let finish: () => void = () => {};
	const doc = {
		startViewTransition: undefined as undefined | ((cb: () => Promise<void>) => { finished: Promise<void> }),
		querySelector: vi.fn(),
		querySelectorAll: vi.fn(() => [])
	};
	if (supported)
		doc.startViewTransition = (cb) => {
			calls.start++;
			calls.namesAtStart = old.style.names.get('view-transition-name');
			const finished = new Promise<void>((resolve) => (finish = resolve));
			void cb();
			return { finished };
		};
	vi.stubGlobal('document', doc);
	vi.stubGlobal('innerHeight', 800);
	vi.stubGlobal('innerWidth', 1280);
	vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduced && q === '(prefers-reduced-motion: reduce)' }));
	return { old, fresh, doc, calls, finish: () => finish() };
}

const nav = (from: string, to: string) => ({
	from: { url: new URL(from, 'http://x') },
	to: { url: new URL(to, 'http://x') },
	complete: Promise.resolve()
});

describe('pageTransition', () => {
	afterEach(() => vi.unstubAllGlobals());

	it('crossfades an ordinary navigation without naming anything', async () => {
		const s = setup();
		await pageTransition(nav('/', '/music'));

		expect(s.calls.start).toBe(1);
		expect(s.old.style.names.size).toBe(0);
	});

	it('names the old cover before the transition starts and clears it afterwards', async () => {
		const s = setup();
		s.doc.querySelectorAll.mockReturnValue([s.old] as never);
		s.doc.querySelector.mockReturnValue(s.fresh);
		const done = pageTransition(nav('/music/albums', '/entries/7'));
		await done;
		await Promise.resolve();
		await Promise.resolve();

		expect(s.calls.namesAtStart).toBe('cover-7');
		expect(s.fresh.style.names.get('view-transition-name')).toBe('cover-7');
		s.finish();
		await Promise.resolve();
		await Promise.resolve();
		expect(s.old.style.names.size).toBe(0);
		expect(s.fresh.style.names.size).toBe(0);
	});

	it('falls back to a crossfade when the old page has no cover to morph from', async () => {
		const s = setup();
		await pageTransition(nav('/add/album', '/entries/7'));

		expect(s.calls.start).toBe(1);
		expect(s.fresh.style.names.size).toBe(0);
		expect(s.doc.querySelector).not.toHaveBeenCalled();
	});

	it('starts nothing under reduced motion', () => {
		const s = setup({ reduced: true });
		pageTransition(nav('/', '/music'));

		expect(s.calls.start).toBe(0);
	});

	it('navigates plainly without View Transitions', () => {
		const s = setup({ supported: false });

		expect(pageTransition(nav('/', '/music'))).toBeUndefined();
		expect(s.calls.start).toBe(0);
	});

	it('leaves a change of query string on the same page alone', () => {
		const s = setup();
		pageTransition(nav('/music/albums', '/music/albums?status=done'));

		expect(s.calls.start).toBe(0);
	});
});
