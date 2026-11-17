import { expect, test, type Page } from '@playwright/test';
import { calm, cardTitles, cards, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const main = (page: Page) => page.locator('main');
const bar = (page: Page) => page.getByRole('toolbar', { name: 'Filters' });

test('Scenario: Add shows only when the list has entries', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'magazine', title: 'Vestoj' },
			{ type: 'site', title: 'Corner Shop', kind: 'shop' }
		]
	});
	await open(page, '/fashion/magazines');
	await expect(main(page).getByRole('link', { name: 'Add', exact: true })).toHaveCount(1);
	await expect(main(page).getByRole('link', { name: 'Add', exact: true })).toHaveAttribute('href', '/add/magazine');

	await open(page, '/fashion/brands-shops');
	await expect(main(page).getByRole('link', { name: 'Add', exact: true })).toHaveCount(1);
	await expect(main(page).getByRole('link', { name: 'Add', exact: true })).toHaveAttribute('href', '/add/brand');
	await expect(page.getByRole('heading', { name: /No .* yet/ })).toHaveCount(0);
});

test('Scenario: Existing magazines appear in their list', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'magazine', title: 'Vestoj', createdAt: '2026-01-01T10:00:00.000Z' },
			{ type: 'magazine', title: 'Fantastic Man', createdAt: '2026-01-02T10:00:00.000Z' },
			{ type: 'brand', title: 'Maison' }
		]
	});
	await open(page, '/fashion/magazines');

	await expect(cardTitles(page)).toHaveText(['Fantastic Man', 'Vestoj']);
	await expect(page.getByRole('heading', { level: 1 })).toContainText('Magazines');
});

test('Scenario: Minimum rating offers whole steps', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'album', title: 'Almost', rating: 7.99 },
			{ type: 'album', title: 'Eight', rating: 8 },
			{ type: 'album', title: 'Nine and a half', rating: 9.5 }
		]
	});
	await open(page, '/music/albums');
	const rating = bar(page).getByRole('combobox', { name: 'Minimum rating', exact: true });

	await expect(rating.getByRole('option')).toHaveText(['Any rating', '9 and up', '8 and up', '7 and up', '6 and up', '5 and up']);
	await rating.selectOption({ label: '8 and up' });
	await expect(page).toHaveURL(/rating=8$/);
	await expect(cardTitles(page)).toHaveText(['Nine and a half', 'Eight']);
});

test('Scenario: Five hundred entries and long titles stay usable', async ({ page, request }) => {
	const long = [
		'Lorem ipsum dolor sit amet '.repeat(7).slice(0, 180),
		'とても長いタイトルのアルバムとても長いタイトルのアルバム'.repeat(5).slice(0, 180),
		'عنوان طويل جدا للألبوم عنوان طويل جدا للألبوم '.repeat(5).slice(0, 180)
	];
	await seed(request, {
		entries: Array.from({ length: 500 }, (_, i) => ({
			type: 'album' as const,
			title: i < 10 ? `${i} ${long[i % 3]}` : `Album ${i}`,
			createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, 500 - i)).toISOString()
		}))
	});
	for (const size of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
		await page.setViewportSize(size);
		await open(page, '/music/albums');

		await expect(cards(page)).toHaveCount(500);
		const overflow = await page.evaluate(() => {
			const bad: string[] = [];
			for (const card of document.querySelectorAll('article')) {
				const box = card.getBoundingClientRect();
				const title = card.querySelector('[data-card-title]')!.getBoundingClientRect();
				if (title.left < box.left - 1 || title.right > box.right + 1) bad.push(card.textContent!.slice(0, 20));
			}
			return { bad, scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth };
		});
		expect(overflow.bad, `${size.width}px`).toEqual([]);
		expect(overflow.scroll, `${size.width}px`).toBeLessThanOrEqual(overflow.client);
	}
});
