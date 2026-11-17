import { expect, test, type Locator, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const tabs = (page: Page) => page.getByRole('navigation', { name: 'Sub-types' });
const box = async (loc: Locator) => (await loc.boundingBox())!;
const captions = (page: Page) => tabs(page).getByText(/^(My things|Discover)$/);

test('Scenario: Fashion tabs come in two labelled groups', async ({ page }) => {
	await open(page, '/fashion');

	const mine = tabs(page).getByRole('group', { name: 'My things' });
	const discover = tabs(page).getByRole('group', { name: 'Discover' });
	await expect(mine.getByRole('link')).toHaveText(['Wardrobe', 'Pieces', 'Looks']);
	await expect(discover.getByRole('link')).toHaveText(['Brands & shops', 'Influencers', 'Magazines']);
	await expect(captions(page)).toHaveText(['My things', 'Discover']);
	await expect(captions(page).first()).toBeVisible();
	await expect(captions(page).last()).toBeVisible();
	await expect(tabs(page).getByRole('link').getByText(/^(My things|Discover)$/)).toHaveCount(0);
	await expect(tabs(page).getByRole('separator')).toHaveCount(0);
	await expect(tabs(page).locator('ul.kicker')).toHaveCount(2);
});

test('Scenario: Other domains keep a flat tab bar', async ({ page }) => {
	for (const domain of ['music', 'animanga', 'books']) {
		await open(page, `/${domain}`);

		await expect(tabs(page).getByRole('group').or(tabs(page).getByRole('separator')).or(captions(page)), domain).toHaveCount(0);
		await expect(tabs(page).locator('ul.kicker'), domain).toHaveCount(1);
	}
});

// On Fashion's night stage the captions read like the kicker they head: white secondary on the veil.
test('Scenario: Group captions use the type scale and colour tokens', async ({ page }) => {
	await open(page, '/fashion');

	const want = await page.evaluate(() => {
		const probe = document.createElement('span');
		probe.style.color = 'var(--ink-on-inverse-secondary)';
		probe.style.fontSize = 'var(--type-overline-size)';
		document.querySelector('.app')!.append(probe);
		const s = getComputedStyle(probe);
		const out = { color: s.color, size: s.fontSize };
		probe.remove();
		return out;
	});
	await expect(captions(page)).toHaveCount(2);
	for (const caption of await captions(page).all()) {
		const style = await caption.evaluate((el) => {
			const s = getComputedStyle(el);
			return { color: s.color, size: s.fontSize, kicker: getComputedStyle(el.parentElement!.querySelector('.kicker li')!).color };
		});
		expect(style).toEqual({ ...want, kicker: want.color });
	}
});

test('Scenario: Sub-types fit the phone', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone');
	for (const size of [{ width: 320, height: 640 }, { width: 390, height: 844 }]) {
		await page.setViewportSize(size);
		await open(page, '/fashion');

		expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
		expect(await tabs(page).evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
		for (const link of await tabs(page).getByRole('link').all()) {
			const b = await box(link);
			expect(b.x).toBeGreaterThanOrEqual(0);
			expect(b.x + b.width).toBeLessThanOrEqual(size.width);
			expect(b.height).toBeGreaterThanOrEqual(44);
		}
	}
});

// Rue, gate 7 re-verify: "— Magazines" opened a line. Every line opens with a part, the dash before it hangs past the
// kicker's start edge and is clipped: on the flat night band (no hero) nothing light is painted there.
test('Scenario: Wrapped sub-types never open a line on a dash', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone');
	await seed(request, { entries: [{ type: 'piece', title: 'Wool coat', status: 'owned' }, { type: 'brand', title: 'Studio Nord' }, { type: 'magazine', title: 'Apartamento' }] });
	await page.setViewportSize({ width: 375, height: 812 });
	for (const path of ['/fashion', '/fashion/wardrobe']) {
		await open(page, path);
		const kickers = tabs(page).locator('ul.kicker');
		let wrapped = 0;
		for (const kicker of await kickers.all()) {
			const lines = await kicker.evaluate((ul) => {
				const left = ul.getBoundingClientRect().left;
				return [...ul.children].map((li) => ({
					li: li.getBoundingClientRect().toJSON() as DOMRect,
					link: li.querySelector('a')!.getBoundingClientRect().left,
					starts: Math.abs(li.getBoundingClientRect().left - left) < 0.5,
					left
				}));
			});
			const starts = lines.filter((l, i) => i > 0 && l.starts);
			wrapped += starts.length;
			for (const [i, l] of lines.entries()) {
				if (i === 0 || !l.starts) continue;
				// the line opens with the part's own text
				expect(Math.abs(l.link - l.left), path).toBeLessThan(0.5);
				// the rows close up: one touch target per line, no extra gap
				expect(l.li.top - lines[i - 1].li.top, path).toBeLessThanOrEqual(44.5);
				// nothing light is painted in the gap before the line
				const strip = await page.screenshot({ clip: { x: l.left - 14, y: l.li.top + 4, width: 13, height: l.li.height - 8 } });
				const light = await page.evaluate(async (b64) => {
					const img = new Image();
					img.src = `data:image/png;base64,${b64}`;
					await img.decode();
					const canvas = document.createElement('canvas');
					[canvas.width, canvas.height] = [img.width, img.height];
					const ctx = canvas.getContext('2d')!;
					ctx.drawImage(img, 0, 0);
					const d = ctx.getImageData(0, 0, img.width, img.height).data;
					let max = 0;
					for (let p = 0; p < d.length; p += 4) max = Math.max(max, d[p], d[p + 1], d[p + 2]);
					return max;
				}, strip.toString('base64'));
				// the Fashion night is rgb(41, 33, 29); a white dash would push a channel far above it
				expect(light, path).toBeLessThan(90);
			}
		}
		expect(wrapped, path).toBeGreaterThan(0);
	}
});
