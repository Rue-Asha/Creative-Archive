import { afterEach, describe, expect, it, vi } from 'vitest';
import { reveal } from '#lib/motion.ts';
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
	closest = (_selector: string): FakeEl | null => null;
	querySelector = (_selector: string): FakeEl | null => null;
	querySelectorAll = (_selector: string): FakeEl[] => [];
	getAttribute = (_name: string): string | null => null;
	attrs = new Set<string>();
	setAttribute = (k: string) => this.attrs.add(k);
	removeAttribute = (k: string) => this.attrs.delete(k);
	hasAttribute = (k: string) => this.attrs.has(k);
	style = {
		names: new Map<string, string>(),
		setProperty: (k: string, v: string) => this.style.names.set(k, v),
		removeProperty: (k: string) => this.style.names.delete(k),
		getPropertyValue: (k: string) => this.style.names.get(k) ?? ''
	};
}

function setup({ reduced = false, supported = true } = {}) {
	const old = new FakeEl();
	const fresh = new FakeEl();
	const calls = { start: 0, namesAtStart: undefined as string | undefined };
	let finish: () => void = () => {};
	const root = {
		attrs: new Map<string, string>(),
		setAttribute: (k: string, v: string) => root.attrs.set(k, v),
		removeAttribute: (k: string) => root.attrs.delete(k)
	};
	const doc = {
		startViewTransition: undefined as undefined | ((cb: () => Promise<void>) => { finished: Promise<void> }),
		documentElement: root,
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
	vi.stubGlobal('requestAnimationFrame', () => 0);
	vi.stubGlobal('matchMedia', (q: string) => ({ matches: reduced && q === '(prefers-reduced-motion: reduce)' }));
	return { old, fresh, root, doc, calls, finish: () => finish() };
}

const nav = (from: string, to: string, type: 'link' | 'popstate' = 'link') => ({
	from: { url: new URL(from, 'http://x') },
	to: { url: new URL(to, 'http://x') },
	type,
	complete: Promise.resolve()
});

const flush = async () => {
	for (let i = 0; i < 5; i++) await Promise.resolve();
};

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
		expect(s.old.style.names.get('view-transition-class')).toBe('cover');
		expect(s.fresh.style.names.get('view-transition-class')).toBe('cover');
		expect(s.root.attrs.has('data-morph')).toBe(false);
		s.finish();
		await Promise.resolve();
		await Promise.resolve();
		expect(s.old.style.names.size).toBe(0);
		expect(s.fresh.style.names.size).toBe(0);
	});

	it('snapshots the clicked card at rest and gives its hover back afterwards', async () => {
		const s = setup();
		const card = new FakeEl();
		const img = new FakeEl();
		card.style.setProperty('transform', 'perspective(800px) translateY(-4px)');
		s.old.closest = (selector) => (selector === '[data-card]' ? card : null);
		s.old.querySelector = (selector) => (selector === 'img' ? img : null);
		s.doc.querySelectorAll.mockReturnValue([s.old] as never);
		s.doc.querySelector.mockReturnValue(s.fresh);
		let atStart: (string | undefined)[] = [];
		const start = s.doc.startViewTransition!;
		s.doc.startViewTransition = (cb) => {
			atStart = [card.style.names.get('transform'), img.style.names.get('transform')];
			return start(cb);
		};
		await pageTransition(nav('/music/albums', '/entries/7'));
		await flush();

		expect(atStart).toEqual(['none', 'none']);
		s.finish();
		await flush();
		expect(card.style.names.get('transform')).toBe('perspective(800px) translateY(-4px)');
		expect(img.style.names.has('transform')).toBe(false);
	});

	it('Scenario: Forward morph without View Transitions navigates plainly', () => {
		const s = setup({ supported: false });
		s.doc.querySelectorAll.mockReturnValue([s.old] as never);
		s.doc.querySelector.mockReturnValue(s.fresh);

		expect(pageTransition(nav('/music/albums', '/entries/7'))).toBeUndefined();
		expect(s.calls.start).toBe(0);
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

	it('Scenario: Back to an off-screen card crossfades', async () => {
		for (const gone of [false, true]) {
			const s = setup();
			const shelf = new FakeEl();
			const card = new FakeEl();
			const cover = new FakeEl();
			shelf.getAttribute = (attr) => (attr === 'data-shelf' ? 'progress' : null);
			shelf.querySelectorAll = (selector) => (selector === '[data-card]' ? [card] : []);
			card.querySelector = (selector) => (selector === '[data-cover-id="7"]' ? cover : null);
			cover.closest = (selector) => (selector === '[data-card]' ? card : selector === '[data-shelf]' ? shelf : null);
			s.doc.querySelectorAll.mockImplementation(((selector: string) => (selector === '[data-cover-id="7"]' ? [cover] : [])) as never);
			s.doc.querySelector.mockImplementation(((selector: string) => (selector === '[data-cover-id="7"]' ? s.fresh : null)) as never);
			await pageTransition(nav('/animanga', '/entries/7'));
			await flush();
			s.finish();
			await flush();

			// back: the remembered card now lies below the fold, or its shelf has gone
			cover.getBoundingClientRect = () => ({ top: 1200, bottom: 1400, left: 0, right: 10 });
			s.doc.querySelector.mockImplementation(((selector: string) =>
				selector === '[data-cover-id="7"]' ? s.fresh : selector === '[data-shelf="progress"]' && !gone ? shelf : null) as never);
			await pageTransition(nav('/entries/7', '/animanga', 'popstate'));
			await flush();

			const label = gone ? 'gone' : 'off-screen';
			expect(s.calls.start, label).toBe(2);
			expect(cover.style.names.size, label).toBe(0);
			// the detail cover was named before the list existed: it is told to fade out with the page
			expect(s.root.attrs.get('data-morph'), label).toBe('fade');
			s.finish();
			await flush();
			expect(s.fresh.style.names.size, label).toBe(0);
			expect(s.root.attrs.has('data-morph'), label).toBe(false);
			vi.unstubAllGlobals();
		}
	});

	it('Scenario: History back reveals at once without View Transitions', async () => {
		// a back without View Transitions, and a back that only changes the query string
		for (const [supported, from, to] of [
			[false, '/entries/7', '/music/albums'],
			[true, '/music/albums?view=shelves', '/music/albums']
		] as const) {
			const s = setup({ supported });
			const observed: FakeEl[] = [];
			vi.stubGlobal(
				'IntersectionObserver',
				class {
					observe = (el: FakeEl) => observed.push(el);
					disconnect = () => {};
				}
			);
			let complete: () => void = () => {};
			const result = pageTransition({ ...nav(from, to, 'popstate'), complete: new Promise<void>((r) => (complete = r)) });
			const shown = new FakeEl();
			const below = new FakeEl();
			below.getBoundingClientRect = () => ({ top: 1400, bottom: 1600, left: 0, right: 10 });
			reveal(shown as unknown as Element);
			reveal(below as unknown as Element);

			expect(result, from).toBeUndefined();
			expect(s.calls.start, from).toBe(0);
			expect(observed, from).toEqual([]);
			complete();
			await flush();
			expect(shown.hasAttribute('data-revealed'), from).toBe(true);
			expect(below.hasAttribute('data-revealed'), from).toBe(false);
			expect(observed, from).toEqual([below]);
			vi.unstubAllGlobals();
		}
	});
});
