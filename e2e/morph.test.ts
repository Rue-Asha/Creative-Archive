import { expect, test, type Page } from '@playwright/test';
import { calm, cardOf, cards, open, reset, seed, shelf } from './helpers.ts';

interface Named {
	name: string;
	card: boolean;
}

interface Rest {
	card: string;
	image: string;
}

interface Halfway {
	radius: string;
	overflow: string;
	shadow: string;
	groupHeight: string;
	oldFit: string;
	oldHeight: string;
	newFit: string;
	newHeight: string;
}

declare global {
	interface Window {
		__morphLog: { calls: number; finished: number; old: Named[]; during: Named[]; rest: Rest[]; halfway: Halfway[] };
	}
}

// Wraps startViewTransition: records which elements carry a cover- name when it is called (the old page) and once
// the new page has been swapped in, before the transition runs. The old card's transforms are read at the call; once
// the transition is ready its animations are paused halfway to read the cover's pseudo-elements, then resumed.
async function watchMorph(page: Page) {
	await page.addInitScript(() => {
		window.__morphLog = { calls: 0, finished: 0, old: [], during: [], rest: [], halfway: [] };
		const start = document.startViewTransition?.bind(document);
		if (!start) return;
		const covers = () => [...document.querySelectorAll('*')].filter((el) => getComputedStyle(el).viewTransitionName.startsWith('cover-'));
		const named = (): Named[] =>
			covers().map((el) => ({
				name: getComputedStyle(el).viewTransitionName,
				card: el.closest('article') !== null
			}));
		const halfway = (name: string): Halfway => {
			const pseudo = (part: string) => getComputedStyle(document.documentElement, `::view-transition-${part}(${name})`);
			const [group, before, after] = [pseudo('group'), pseudo('old'), pseudo('new')];
			return {
				radius: group.borderRadius,
				overflow: group.overflow,
				shadow: group.boxShadow,
				groupHeight: group.height,
				oldFit: before.objectFit,
				oldHeight: before.height,
				newFit: after.objectFit,
				newHeight: after.height
			};
		};
		document.startViewTransition = (callback?: ViewTransitionUpdateCallback) => {
			window.__morphLog.calls++;
			window.__morphLog.old = named();
			for (const el of covers()) {
				const card = el.closest('article');
				const img = el.querySelector('img');
				if (card && img) window.__morphLog.rest.push({ card: getComputedStyle(card).transform, image: getComputedStyle(img).transform });
			}
			let name = '';
			const transition = start(async () => {
				await callback?.();
				window.__morphLog.during = named();
				name = window.__morphLog.during[0]?.name ?? '';
			});
			void transition.ready.then(() => {
				if (!name) return;
				const animations = document.getAnimations().filter((a) => (a.effect as KeyframeEffect | null)?.pseudoElement?.startsWith('::view-transition'));
				for (const a of animations) {
					a.pause();
					a.currentTime = Number(a.effect!.getComputedTiming().duration) / 2;
				}
				window.__morphLog.halfway.push(halfway(name));
				for (const a of animations) a.play();
			});
			void transition.finished.then(() => window.__morphLog.finished++);
			return transition;
		};
	});
}

const log = (page: Page) => page.evaluate(() => window.__morphLog);

async function seeded(request: Parameters<typeof reset>[0]) {
	await reset(request);
	const {
		entries: [id]
	} = await seed(request, {
		entries: [
			{ type: 'album', title: 'Blonde', image: true },
			{ type: 'album', title: 'Channel Orange', image: true }
		]
	});
	return id;
}

test('Scenario: Card to detail morphs the cover', async ({ page, request }) => {
	const id = await seeded(request);
	await watchMorph(page);
	await open(page, '/music/albums');
	await cardOf(page, 'Blonde').getByRole('link', { name: 'Blonde' }).click();

	await expect(page).toHaveURL(`/entries/${id}`);
	await expect(page.getByRole('heading', { level: 1, name: 'Blonde' })).toBeVisible();
	const seen = await log(page);
	expect(seen.calls).toBe(1);
	expect(seen.old).toEqual([{ name: `cover-${id}`, card: true }]);
	expect(seen.during).toEqual([{ name: `cover-${id}`, card: false }]);
});

test('Scenario: Back from detail reverses the morph', async ({ page, request }) => {
	const id = await seeded(request);
	await watchMorph(page);
	await open(page, '/music/albums');
	await cardOf(page, 'Blonde').getByRole('link', { name: 'Blonde' }).click();
	await expect(page.getByRole('heading', { level: 1, name: 'Blonde' })).toBeVisible();
	await page.evaluate(() => (window.__morphLog = { calls: 0, finished: 0, old: [], during: [], rest: [], halfway: [] }));
	await page.goBack();

	await expect(page).toHaveURL('/music/albums');
	await expect(cards(page)).toHaveCount(2);
	const seen = await log(page);
	expect(seen.calls).toBe(1);
	expect(seen.old).toEqual([{ name: `cover-${id}`, card: false }]);
	expect(seen.during).toEqual([{ name: `cover-${id}`, card: true }]);
});

test('Scenario: Reduced motion skips the morph', async ({ page, request }) => {
	await calm(page);
	await seeded(request);
	await watchMorph(page);
	await open(page, '/music/albums');
	await cardOf(page, 'Blonde').getByRole('link', { name: 'Blonde' }).click();

	await expect(page.getByRole('heading', { level: 1, name: 'Blonde' })).toBeVisible();
	expect((await log(page)).calls).toBe(0);
	const carrying = await page.evaluate(
		() => [...document.querySelectorAll('*')].filter((el) => getComputedStyle(el).viewTransitionName.startsWith('cover-')).length
	);
	expect(carrying).toBe(0);
});

test('Scenario: Morphing cover keeps its rounded corners', async ({ page, request }) => {
	const id = await seeded(request);
	await watchMorph(page);
	await open(page, '/music/albums');
	await cardOf(page, 'Blonde').getByRole('link', { name: 'Blonde' }).click();
	await expect(page.getByRole('heading', { level: 1, name: 'Blonde' })).toBeVisible();
	await expect.poll(async () => (await log(page)).finished).toBe(1);
	await page.goBack();
	await expect(page).toHaveURL('/music/albums');
	await expect.poll(async () => (await log(page)).halfway.length).toBe(2);

	const { halfway, during } = await log(page);
	expect(during).toEqual([{ name: `cover-${id}`, card: true }]);
	for (const h of halfway) {
		expect(h.radius).toBe('24px');
		expect(['hidden', 'clip']).toContain(h.overflow);
	}
});

test('Scenario: Morph carries the detail cover\'s shadow', async ({ page, request }) => {
	await seeded(request);
	await watchMorph(page);
	await open(page, '/music/albums');
	await cardOf(page, 'Blonde').getByRole('link', { name: 'Blonde' }).click();
	await expect(page.getByRole('heading', { level: 1, name: 'Blonde' })).toBeVisible();
	await expect.poll(async () => (await log(page)).halfway.length).toBe(1);

	expect((await log(page)).halfway[0].shadow).not.toBe('none');
});

test('Scenario: Forward morph starts from the card at rest', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'hover is desktop-only');
	await seeded(request);
	await watchMorph(page);
	await open(page, '/music/albums');
	const card = cardOf(page, 'Blonde');
	const box = (await card.boundingBox())!;
	await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
	await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.2, { steps: 4 });
	await expect.poll(() => card.evaluate((el) => getComputedStyle(el).transform)).toContain('matrix3d');
	await expect.poll(() => card.getByRole('presentation').evaluate((el) => getComputedStyle(el).transform)).not.toBe('none');
	await card.getByRole('link', { name: 'Blonde' }).click();

	await expect(page.getByRole('heading', { level: 1, name: 'Blonde' })).toBeVisible();
	expect((await log(page)).rest).toEqual([{ card: 'none', image: 'none' }]);
});

test('Scenario: Morph does not stretch between shapes', async ({ page, request }) => {
	await reset(request);
	const {
		entries: [, id]
	} = await seed(request, {
		entries: [
			{ type: 'anime', title: 'Frieren', status: 'progress', image: true, progress: { episodes: { current: 3, total: 28 } } },
			{ type: 'manga', title: 'Vagabond', status: 'progress', image: true, progress: { chapters: { current: 12, total: null } } }
		]
	});
	await watchMorph(page);
	await open(page, '/');
	await cardOf(shelf(page, 'In progress'), 'Vagabond').getByRole('link', { name: 'Vagabond' }).click();
	await expect(page).toHaveURL(`/entries/${id}`);
	await expect.poll(async () => (await log(page)).halfway.length).toBe(1);

	const [h] = (await log(page)).halfway;
	expect(h.oldFit).toBe('cover');
	expect(h.newFit).toBe('cover');
	expect(h.oldHeight).toBe(h.groupHeight);
	expect(h.newHeight).toBe(h.groupHeight);
});
