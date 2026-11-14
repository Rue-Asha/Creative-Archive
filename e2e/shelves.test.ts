import { expect, test, type Page } from '@playwright/test';
import { calm, cardTitles, cards, open, reset, seed, shelf } from './helpers.ts';
const toggle = (page: Page, name: 'Grid' | 'Shelves') =>
	page.getByRole('toolbar', { name: 'Filters' }).getByRole('button', { name, exact: true });

async function shelfWithManyCards(request: Parameters<typeof reset>[0]) {
	await reset(request);
	await seed(request, {
		entries: Array.from({ length: 20 }, (_, i) => ({ type: 'manga' as const, title: `Volume ${i + 1}`, status: 'want' as const }))
	});
}

test('Scenario: Shelves view groups media by status', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await seed(request, {
		entries: [
			{ type: 'manga', title: 'Planned', status: 'want' },
			{ type: 'manga', title: 'Ongoing', status: 'progress', progress: { chapters: { current: 3, total: null } } },
			{ type: 'manga', title: 'Finished', status: 'done' }
		]
	});
	await open(page, '/animanga/manga');
	await toggle(page, 'Shelves').click();

	await expect(page).toHaveURL(/view=shelves/);
	const headings = page.getByRole('heading', { level: 2 });
	await expect(headings).toHaveText(['Reading', 'Want to read', 'Read']);
	await expect(cardTitles(shelf(page, 'Reading'))).toHaveText(['Ongoing']);
	await expect(cardTitles(shelf(page, 'Want to read'))).toHaveText(['Planned']);
	await expect(cardTitles(shelf(page, 'Read'))).toHaveText(['Finished']);
	await expect(shelf(page, 'Dropped')).toHaveCount(0);

	await toggle(page, 'Grid').click();
	await expect(page).not.toHaveURL(/view=/);
	await expect(page.getByRole('heading', { level: 2 })).toHaveCount(0);
	await expect(cards(page)).toHaveCount(3);
});

test('Scenario: Shelf headers stick on desktop', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'sticky headers are a desktop layout');
	await calm(page);
	await reset(request);
	await seed(request, { entries: [{ type: 'manga', title: 'Planned', status: 'want' }, { type: 'manga', title: 'Ongoing', status: 'progress' }] });
	await open(page, '/animanga/manga?view=shelves');

	const positions = await page.getByRole('heading', { level: 2 }).evaluateAll((els) =>
		els.map((el) => {
			for (let node: Element | null = el; node; node = node.parentElement) if (getComputedStyle(node).position === 'sticky') return 'sticky';
			return getComputedStyle(el).position;
		})
	);
	expect(positions).toEqual(['sticky', 'sticky']);
});

test('Scenario: Shelf headers do not stick on phone', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'phone layout');
	await calm(page);
	await reset(request);
	await seed(request, { entries: [{ type: 'manga', title: 'Planned', status: 'want' }, { type: 'manga', title: 'Ongoing', status: 'progress' }] });
	await open(page, '/animanga/manga?view=shelves');

	const positions = await page.getByRole('heading', { level: 2 }).evaluateAll((els) =>
		els.map((el) => {
			for (let node: Element | null = el; node; node = node.parentElement) if (getComputedStyle(node).position === 'sticky') return 'sticky';
			return getComputedStyle(el).position;
		})
	);
	expect(positions).toHaveLength(2);
	for (const position of positions) expect(position).not.toBe('sticky');
});

const DRAG = 400;
const STEPS = 8;

// Inertia only counts moves from the last 100ms, and page.mouse sends each step as its own round trip, which a busy
// runner spaces further apart than that. Stamped events keep the gesture a quick flick however slow the round trips are.
async function drag(page: Page, row: ReturnType<Page['locator']>) {
	const box = (await row.boundingBox())!;
	const x = box.x + box.width - 60;
	const y = box.y + box.height / 2;
	const start = await row.evaluate((el) => el.scrollLeft);
	const cdp = await page.context().newCDPSession(page);
	const t0 = Date.now() / 1000;
	const send = (type: 'mouseMoved' | 'mousePressed' | 'mouseReleased', step: number, buttons: number) =>
		cdp.send('Input.dispatchMouseEvent', {
			type,
			x: x - (DRAG * step) / STEPS,
			y,
			button: 'left',
			buttons,
			clickCount: type === 'mouseMoved' ? 0 : 1,
			timestamp: t0 + step * 0.016
		});
	await send('mouseMoved', 0, 0);
	await send('mousePressed', 0, 1);
	for (let step = 1; step <= STEPS; step++) await send('mouseMoved', step, 1);
	await send('mouseReleased', STEPS, 0);
	return start + DRAG;
}

test('Scenario: Shelf rows drag-scroll with inertia on desktop', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'drag-scroll is mouse-only');
	await shelfWithManyCards(request);
	await open(page, '/animanga/manga?view=shelves');
	const row = shelf(page, 'Want to read').getByRole('list');
	await expect(cards(row)).toHaveCount(20);

	const before = await drag(page, row);
	await expect.poll(() => row.evaluate((el) => el.scrollLeft)).toBeGreaterThan(before);
	await expect(page).toHaveURL(/view=shelves/);
});

test('Scenario: Reduced motion drag-scroll stops on release', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'drag-scroll is mouse-only');
	await calm(page);
	await shelfWithManyCards(request);
	await open(page, '/animanga/manga?view=shelves');
	const row = shelf(page, 'Want to read').getByRole('list');

	const before = await drag(page, row);
	await page.waitForTimeout(400);
	expect(await row.evaluate((el) => el.scrollLeft)).toBe(before);
});
