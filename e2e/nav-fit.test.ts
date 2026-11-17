import { expect, test } from '@playwright/test';
import { calm, open } from './helpers.ts';

test.beforeEach(({ page }) => calm(page));

test('Scenario: Top bar fits from 1024 to 1280 px', async ({ page }, info) => {
	test.skip(info.project.name !== 'desktop', 'sets its own viewports');
	for (const path of ['/fashion/brands-shops', '/collections']) {
		for (const [width, height] of [[1024, 768], [1099, 800], [1100, 800], [1152, 800], [1280, 800]]) {
			await page.setViewportSize({ width, height });
			await open(page, path);
			const label = `${path} ${width}`;
			const links = page.getByRole('banner').getByRole('link');
			const boxes = (await links.all()).map(async (link) => (await link.boundingBox())!);
			const rects = await Promise.all(boxes);

			// brand, six sections and Settings
			expect(rects, label).toHaveLength(8);
			const centres = rects.map((r) => r.y + r.height / 2);
			expect(Math.max(...centres) - Math.min(...centres), label).toBeLessThanOrEqual(4);
			for (const [i, a] of rects.entries())
				for (const b of rects.slice(i + 1))
					expect(a.x + a.width <= b.x + 1 || b.x + b.width <= a.x + 1, label).toBe(true);
			const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
			expect(overflow, label).toBeLessThanOrEqual(0);
		}
	}
});
