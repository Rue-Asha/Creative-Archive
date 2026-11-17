import { expect, test, type Locator, type Page } from '@playwright/test';
import { calm, expectCurrent, open, reset, seed } from './helpers.ts';

const nav = (page: Page) => page.getByRole('navigation', { name: 'Main' });
const bar = (page: Page) => page.locator('.app-bar');
const dock = (page: Page) => page.locator('.dock');
const ITEMS = ['Home', 'Music', 'Animanga', 'Books', 'Fashion', 'Collections'];

const albums = (n: number) =>
	Array.from({ length: n }, (_, i) => ({ type: 'album' as const, title: `Album ${String(i + 1).padStart(2, '0')}` }));

const rect = async (el: Locator) => (await el.boundingBox())!;

test.beforeEach(({ page }) => calm(page));

test('Scenario: One Main navigation at every width', async ({ page }) => {
	for (const [width, height] of [[320, 640], [390, 844], [768, 1024], [844, 390], [1024, 768], [1280, 800]]) {
		await page.setViewportSize({ width, height });
		await open(page, '/music/albums');
		const label = `${width}×${height}`;

		await expect(nav(page), label).toHaveCount(1);
		await expect(nav(page).getByRole('link', { name: 'Music' }), label).toHaveAttribute('aria-current', 'page');
		await expectCurrent(nav(page), 'Music', label);
		const shown = [await bar(page).locator('.app-nav').isVisible(), await dock(page).isVisible()];
		expect(shown.filter(Boolean), label).toHaveLength(1);
	}
});

test('Scenario: Tablets get the phone layout', async ({ page }) => {
	for (const [width, height, dockShown] of [[768, 1024, true], [1023, 768, true], [1024, 768, false]] as const) {
		await page.setViewportSize({ width, height });
		await open(page, '/music/albums');

		await expect(dock(page), `${width}`).toBeVisible({ visible: dockShown });
		await expect(bar(page).locator('.app-nav'), `${width}`).toBeVisible({ visible: !dockShown });
	}
});

test('Scenario: Top bar shows brand, six sections and Settings', async ({ page }, info) => {
	test.skip(info.project.name !== 'desktop', 'the top bar is for desktop');
	await open(page, '/books');
	const header = page.getByRole('banner');

	await expect(header.getByRole('link', { name: 'Creative Archive' })).toHaveAttribute('href', '/');
	await expect(nav(page).getByRole('link')).toHaveText(ITEMS);
	await expect(header.getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '/settings');
	await expect(dock(page)).toBeHidden();
});

test('Scenario: Nav marks the current section', async ({ page }, info) => {
	test.skip(info.project.name !== 'desktop', 'six sections are in the top bar');
	const current = { '/': 'Home', '/music': 'Music', '/fashion/pieces': 'Fashion', '/collections': 'Collections' };
	for (const [path, label] of Object.entries(current)) {
		await open(page, path);

		await expectCurrent(nav(page), label, path);
	}
	await open(page, '/settings');

	await expectCurrent(nav(page), null);
	await expect(page.getByRole('banner').getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page');
});

test('Scenario: Entry pages mark their domain', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'six sections are in the top bar');
	await reset(request);
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'manga', title: 'Vagabond' }] });
	const marked = { [`/entries/${id}`]: 'Animanga', [`/entries/${id}/edit`]: 'Animanga', '/add/magazine': 'Fashion' };
	for (const [path, label] of Object.entries(marked)) {
		await open(page, path);

		await expectCurrent(nav(page), label, path);
	}
});

test('Nav marks the current section on the phone', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', 'the phone bar');
	for (const [path, label] of Object.entries({ '/': 'Home', '/music': 'Music', '/fashion/pieces': 'Fashion' })) {
		await open(page, path);

		await expectCurrent(nav(page), label, path);
	}
});

test('Scenario: Content never sits under the navigation', async ({ page, request }) => {
	await reset(request);
	await seed(request, { entries: albums(40) });
	for (const [width, height] of [[390, 844], [768, 1024], [844, 390], [1280, 800]]) {
		await page.setViewportSize({ width, height });
		await open(page, '/music/albums');
		const label = `${width}×${height}`;
		const last = page.getByRole('article').last();
		await last.scrollIntoViewIfNeeded();
		await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
		const box = await rect(last);

		if (width >= 1024) expect(box.y, label).toBeGreaterThanOrEqual((await rect(bar(page))).y + (await rect(bar(page))).height - 1);
		else expect(box.y + box.height, label).toBeLessThanOrEqual((await rect(dock(page))).y + 1);
	}
});

test('Scenario: Focused control is not hidden by the navigation', async ({ page, request }) => {
	await reset(request);
	await seed(request, { entries: albums(40) });
	for (const [width, height] of [[390, 844], [1280, 800]]) {
		await page.setViewportSize({ width, height });
		await open(page, '/music/albums');
		await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight / 2));
		const label = `${width}×${height}`;
		const navBox = () => rect(width >= 1024 ? bar(page) : dock(page));
		let measured = 0;
		let closest = Infinity;
		// the phone bar is at the bottom, so Tab forward brings controls up against it; the capsule is at the top, so on
		// the desktop focus starts mid-list and walks back with Shift+Tab
		const wide = width >= 1024;
		// the capsule and its scroll-padding follow the scroll a frame later (an IntersectionObserver), and no keyboard
		// user gets a key in before that frame, so the walk starts once the padding clears the stuck capsule
		if (wide) {
			await expect(bar(page)).toHaveAttribute('data-scrolled', '');
			const clearance = () =>
				page.evaluate(() => {
					const capsule = document.querySelector('.app-bar')!.getBoundingClientRect();
					return parseFloat(getComputedStyle(document.documentElement).scrollPaddingBlockStart) - capsule.bottom;
				});
			await expect.poll(clearance).toBeGreaterThanOrEqual(8);
			await page.getByRole('article').getByRole('link').nth(30).focus();
		}

		for (let i = 0; i < 40; i++) {
			await page.keyboard.press(wide ? 'Shift+Tab' : 'Tab');
			const focused = page.locator(':focus');
			if (!(await focused.count())) continue;
			if (await focused.evaluate((el) => !!el.closest('nav, header'))) continue;
			const box = await focused.boundingBox();
			if (!box) continue;
			const n = await navBox();
			const overlap = box.x < n.x + n.width && box.x + box.width > n.x && box.y < n.y + n.height && box.y + box.height > n.y;
			expect(overlap, `${label} tab ${i}`).toBe(false);
			measured++;
			closest = Math.min(closest, box.y >= n.y + n.height ? box.y - (n.y + n.height) : n.y - (box.y + box.height));
		}
		// the walk measured real controls, and at least one of them ended up right next to the bar
		expect(measured, `${label} controls measured`).toBeGreaterThanOrEqual(10);
		expect(closest, `${label} closest control to the bar`).toBeLessThanOrEqual(120);
	}
});

test('Scenario: Scrolled top bar is a compact capsule', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'sets its own viewports');
	await reset(request);
	await seed(request, { entries: albums(40) });
	await open(page, '/music/albums');
	const flat = await rect(bar(page));
	await page.evaluate(() => window.scrollBy(0, 700));
	await expect(bar(page)).toHaveAttribute('data-scrolled', '');
	const capsule = await rect(bar(page));

	expect(await bar(page).evaluate((el) => getComputedStyle(el).position)).toBe('sticky');
	expect(capsule.y).toBeLessThan(40);
	expect(capsule.y).toBeGreaterThanOrEqual(0);
	expect(capsule.width).toBeLessThan(flat.width * 0.8);
	// at most its content plus its own padding: the visible children's extent and the bar's inline padding
	const fit = await bar(page).evaluate((el) => {
		const s = getComputedStyle(el);
		const boxes = [...el.children]
			.filter((c) => (c as HTMLElement).checkVisibility({ visibilityProperty: true }))
			.map((c) => c.getBoundingClientRect())
			.filter((r) => r.width > 1 && r.height > 1);
		const content = Math.max(...boxes.map((r) => r.right)) - Math.min(...boxes.map((r) => r.left));
		return { content, padding: parseFloat(s.paddingInlineStart) + parseFloat(s.paddingInlineEnd), border: parseFloat(s.borderLeftWidth) + parseFloat(s.borderRightWidth), count: boxes.length };
	});
	expect(fit.count).toBeGreaterThan(0);
	expect(capsule.width).toBeLessThanOrEqual(fit.content + fit.padding + fit.border + 1);
	expect(Math.abs(capsule.x + capsule.width / 2 - 640)).toBeLessThanOrEqual(2);
	expect((await rect(bar(page).locator('.brand-name'))).width).toBeLessThanOrEqual(1);
	await expect(bar(page).getByRole('link', { name: 'Creative Archive' })).toHaveCount(1);

	await page.setViewportSize({ width: 390, height: 844 });
	await open(page, '/music/albums');
	await page.evaluate(() => window.scrollBy(0, 700));
	expect(await bar(page).evaluate((el) => getComputedStyle(el).position)).not.toBe('sticky');
});

test('Scenario: Capsule keeps clear of the selection bar and focus', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'sets its own viewports');
	await reset(request);
	await seed(request, { entries: albums(40) });
	for (const [width, height] of [[1024, 768], [1280, 800]]) {
		await page.setViewportSize({ width, height });
		await open(page, '/music/albums');
		await page.getByRole('main').getByRole('button', { name: 'Select', exact: true }).click();
		const selection = page.getByRole('region', { name: 'Selection', exact: true });
		await expect(selection).toBeVisible();
		await page.evaluate(() => window.scrollBy(0, 700));
		const label = `${width}`;
		await expect(bar(page)).toHaveAttribute('data-scrolled', '');
		// the fingerprint's capsule sticks from 1100 px (layout.css); between 1024 and 1099 the bar scrolls away, so the
		// floor is the viewport's top edge there and the capsule's bottom edge from 1100 up
		const sticky = (await bar(page).evaluate((el) => getComputedStyle(el).position)) === 'sticky';
		expect(sticky, label).toBe(width >= 1100);
		const capsule = await rect(bar(page));
		const floor = sticky ? capsule.y + capsule.height : 0;
		if (sticky) expect(capsule.y, label).toBeGreaterThanOrEqual(0);
		else expect(capsule.y + capsule.height, label).toBeLessThanOrEqual(0);

		const sel = await rect(selection);
		expect(sel.y, label).toBeGreaterThanOrEqual(floor - 1);
		expect(sel.y, label).toBeLessThan(floor + 60);
		const links = page.getByRole('article').getByRole('button', { pressed: false });
		await links.nth(20).focus();
		await page.keyboard.press('Shift+Tab');
		await page.keyboard.press('Tab');
		const focused = await rect(page.locator(':focus'));
		expect(focused.y, label).toBeGreaterThanOrEqual(floor - 1);
	}
});

test('the floating "+" keeps a light rim, so it shows over the charcoal rating card', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'the dock is the phone posture');
	await calm(page);
	await reset(request);
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde', rating: 9.75 }] });
	await open(page, `/entries/${id}`);
	const plus = dock(page).getByRole('button', { name: 'Add', exact: true });
	const rim = await plus.evaluate((el) => {
		const probe = document.createElement('i');
		probe.style.color = 'var(--rim)';
		document.body.append(probe);
		const colour = getComputedStyle(probe).color;
		probe.remove();
		const s = getComputedStyle(el);
		return { outline: `${s.outlineStyle} ${s.outlineColor}`, width: parseFloat(s.outlineWidth), colour };
	});
	expect(rim.outline).toBe(`solid ${rim.colour}`);
	expect(rim.width).toBeGreaterThanOrEqual(2);
});
