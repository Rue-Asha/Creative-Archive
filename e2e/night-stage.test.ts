import { expect, test, type Locator, type Page } from '@playwright/test';
import { calm, open, openEntryMenu, reset, seed } from './helpers.ts';

// Night stage (fingerprint 2.1.0; Rue, gate 7, 2026-11-17, direction B): a domain's screens are its world's night banner.

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const WORLDS = ['music', 'animanga', 'books', 'fashion'] as const;

declare global {
	interface Window {
		__nightContrast: (root: Element, overlay?: boolean) => string[];
	}
}

// Every visible text in `root` against what is painted behind it: its own and its ancestors' background colours laid
// over the world's worst backdrop — the night itself, or the veil over a white pixel (the photo's worst under light
// type). An overlay floats over the screen, so its walk ends at the overlay itself and its surface is laid over the
// night and the veil, never over the light page that holds it in the DOM. Disabled controls are exempt (WCAG 1.4.3).
async function installContrast(page: Page): Promise<void> {
	await page.evaluate(() => {
		type C = [number, number, number, number];
		const parse = (s: string): C => {
			// color-mix() computes to color(srgb r g b / a) with 0–1 channels
			const srgb = s.startsWith('color(srgb');
			const m = s.match(/[\d.]+/g)!.map(Number);
			const k = srgb ? 255 : 1;
			return [m[0] * k, m[1] * k, m[2] * k, m.length > 3 ? m[3] : 1];
		};
		const over = (top: C, under: C): C => {
			const a = top[3] + under[3] * (1 - top[3]);
			return [0, 1, 2].map((i) => (top[i] * top[3] + under[i] * under[3] * (1 - top[3])) / (a || 1)).concat(a) as C;
		};
		const lum = (c: C) => {
			const [r, g, b] = [c[0], c[1], c[2]].map((v) => {
				const s = v / 255;
				return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
			});
			return 0.2126 * r + 0.7152 * g + 0.0722 * b;
		};
		const ratio = (a: C, b: C) => {
			const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
			return (x + 0.05) / (y + 0.05);
		};
		const probe = (value: string) => {
			const el = document.createElement('i');
			el.style.color = value;
			document.querySelector('.app')!.append(el);
			const c = parse(getComputedStyle(el).color);
			el.remove();
			return c;
		};
		window.__nightContrast = (root, overlay = false) => {
			const bases = [probe('var(--world-night)'), over(probe('var(--world-veil)'), [255, 255, 255, 1])];
			const fails: string[] = [];
			for (const el of [root, ...root.querySelectorAll('*')]) {
				if (!(el instanceof HTMLElement) || el.closest(':disabled, [aria-disabled="true"], [inert], [aria-hidden="true"]')) continue;
				const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent!.trim()).join('');
				if (!text || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
				const box = el.getBoundingClientRect();
				if (box.width < 2 || box.height < 2) continue;
				const layers: C[] = [];
				const on: string[] = [];
				// in the bar and the head the stage (or the night band) paints over the frame's own glass
				const stop = el.closest('.app-bar, .screen-head') ? el.closest('.frame') : overlay ? root.parentElement : null;
				for (let a: Element | null = el; a && a !== stop; a = a.parentElement) {
					const bg = parse(getComputedStyle(a).backgroundColor);
					if (bg[3] > 0) {
						layers.push(bg);
						on.push(`${a.tagName.toLowerCase()}.${a.classList[0] ?? ''}`);
					}
					if (bg[3] >= 1) break;
				}
				const s = getComputedStyle(el);
				const large = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && Number(s.fontWeight) >= 700);
				for (const base of bases) {
					const bg = layers.reduceRight((under, top) => over(top, under), base);
					const r = ratio(over(parse(s.color), bg), bg);
					if (r < (large ? 3 : 4.5)) fails.push(`${text.slice(0, 30)} (${el.tagName.toLowerCase()}.${el.classList[0] ?? ''} on ${on.join(' < ') || 'the stage'}) ${r.toFixed(2)}`);
				}
			}
			return [...new Set(fails)];
		};
	});
}

async function expectReadable(page: Page, scope: Locator, label: string, overlay = false): Promise<void> {
	await installContrast(page);
	expect(await scope.count(), label).toBeGreaterThan(0);
	await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
	for (const root of await scope.all()) {
		expect(await root.evaluate((el, o) => window.__nightContrast(el, o), overlay), label).toEqual([]);
	}
}

// The veil as painted, not as declared: the photo and the stage under it turn white and everything on the stage is
// hidden, so a pixel's darkness is the scrim's alpha over white, (255 - pixel) / (255 - night) per channel.
// Returns the alpha at each point (CSS px, viewport coordinates).
async function paintedVeil(page: Page, points: [number, number][]): Promise<number[]> {
	const style = await page.addStyleTag({
		content: `.frame > .stage { background: #fff !important; } .stage-photo { opacity: 0 !important; }
			.screen-lead > *, .screen-head > :not(.screen-lead), .app-bar > *, .screen-body, .dock { visibility: hidden !important; }`
	});
	await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
	const shot = (await page.screenshot()).toString('base64');
	await style.evaluate((el) => (el as Element).remove());
	return page.evaluate(
		async ({ shot, points }) => {
			const img = new Image();
			img.src = `data:image/png;base64,${shot}`;
			await img.decode();
			const canvas = document.createElement('canvas');
			[canvas.width, canvas.height] = [img.width, img.height];
			const ctx = canvas.getContext('2d')!;
			ctx.drawImage(img, 0, 0);
			const probe = document.createElement('i');
			probe.style.color = 'var(--world-night)';
			document.querySelector('.app')!.append(probe);
			const night = getComputedStyle(probe).color.match(/[\d.]+/g)!.map(Number);
			probe.remove();
			const dpr = img.width / innerWidth;
			return points.map(([x, y]) => {
				const px = ctx.getImageData(Math.round(x * dpr), Math.round(y * dpr), 1, 1).data;
				return [0, 1, 2].reduce((sum, i) => sum + (255 - px[i]) / (255 - night[i]), 0) / 3;
			});
		},
		{ shot, points }
	);
}

const range = (from: number, to: number, step = 1) => Array.from({ length: Math.max(0, Math.floor((to - from) / step)) }, (_, i) => from + i * step);

const world = (page: Page) => page.locator('.app');

test('Scenario: World screens carry their world and the night stage', async ({ page, request }) => {
	const {
		entries: [book, piece]
	} = await seed(request, { entries: [{ type: 'book', title: 'Dune' }, { type: 'piece', title: 'Wool coat', status: 'owned' }] });
	const screens: [string, string][] = [
		...WORLDS.map((w) => [`/${w}`, w] as [string, string]),
		['/music/albums', 'music'],
		['/fashion/wardrobe', 'fashion'],
		[`/entries/${book}`, 'books'],
		[`/entries/${book}/edit`, 'books'],
		[`/entries/${piece}`, 'fashion'],
		['/add/anime', 'animanga']
	];
	for (const [path, name] of screens) {
		await open(page, path);
		await expect(world(page), path).toHaveAttribute('data-world', name);
		await expect(world(page), path).toHaveAttribute('data-stage', 'night');
	}
});

test('Scenario: Home, collections and settings stay light', async ({ page, request }) => {
	const {
		collections: [collection]
	} = await seed(request, { entries: [{ type: 'book', title: 'Dune' }], collections: [{ name: 'Moodboard', entries: [0] }] });
	for (const path of ['/', '/collections', `/collections/${collection}`, '/settings']) {
		await open(page, path);
		await expect(world(page), path).not.toHaveAttribute('data-world');
		await expect(world(page), path).not.toHaveAttribute('data-stage');
		await expect(page.locator('main h1'), path).toHaveCSS('color', 'rgb(29, 29, 31)');
	}
});

test('Scenario: The banner keeps the photo visible', async ({ page, request }) => {
	await seed(request, { entries: [{ type: 'album', title: 'Blonde' }], heroes: [...WORLDS] });
	const phone = page.viewportSize()!.width < 768;
	for (const name of WORLDS) {
		await open(page, `/${name}`);
		const stage = page.locator('.frame > figure.stage');
		await expect(stage.locator('img.stage-photo')).toBeVisible();
		// the veil stays a veil: the photo shows through at least 16% where the type sits and is clear past it
		const veil = await world(page).evaluate((el) => {
			const alpha = (v: string) => {
				const probe = document.createElement('i');
				probe.style.color = `var(${v})`;
				el.append(probe);
				const rgba = getComputedStyle(probe).color.match(/[\d.]+/g)!.map(Number);
				probe.remove();
				return rgba.length > 3 ? rgba[3] : 1;
			};
			return { strong: alpha('--world-veil-strong'), text: alpha('--world-veil'), soft: alpha('--world-veil-soft'), clear: alpha('--world-veil-clear') };
		});
		expect(veil.strong, name).toBeLessThanOrEqual(0.9);
		expect(veil.text, name).toBeLessThanOrEqual(0.84);
		expect(veil.text, name).toBeGreaterThanOrEqual(0.72);
		expect(veil.soft, name).toBeLessThanOrEqual(0.5);
		expect(veil.clear, name).toBe(0);
		const stageBox = (await stage.boundingBox())!;
		const lead = (await page.locator('.screen-lead').boundingBox())!;
		if (phone) {
			// the photo shows clear between the bar and the lead's plate
			expect(lead.y - stageBox.y, name).toBeGreaterThanOrEqual(200);
		} else {
			// the taller banner: the stage reaches at least the facts card plus the overlap
			expect(stageBox.height, name).toBeGreaterThanOrEqual(340);
			const stops = await stage.evaluate((el) => getComputedStyle(el, '::after').backgroundImage);
			expect(stops, name).toContain('rgba(');
			expect(stops, name).toMatch(/, 0\)/);
		}
		// as painted: every line of the lead sits on the veil, and the photo shows clear beside or above the lead
		const lines = await page.locator('.screen-lead').evaluate((lead) =>
			[...lead.querySelectorAll('h1, .lede, .kicker li')].map((el) => {
				const r = el.getBoundingClientRect();
				return [r.left, r.right, r.top + r.height / 2] as [number, number, number];
			})
		);
		expect(lines.length, name).toBeGreaterThan(2);
		const under = await paintedVeil(page, lines.flatMap(([l, r, y]) => [[l + 2, y], [(l + r) / 2, y], [r - 2, y]] as [number, number][]));
		for (const a of under) {
			expect(a, name).toBeGreaterThanOrEqual(0.72 - 0.02);
			expect(a, name).toBeLessThanOrEqual(0.9 + 0.02);
		}
		const h1 = (await page.locator('.screen-lead h1').boundingBox())!;
		const bar = (await page.locator('.app-bar').boundingBox())!;
		const around = await paintedVeil(page, [
			...range(bar.y + bar.height, h1.y, 4).map((y) => [h1.x + 4, y] as [number, number]),
			...range(h1.x, stageBox.x + stageBox.width - 24, 8).map((x) => [x, h1.y + h1.height / 2] as [number, number])
		]);
		expect(Math.min(...around), name).toBeLessThanOrEqual(0.02);
	}
});

test('Scenario: The tablet banner keeps clear photo above the title', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop');
	await seed(request, { entries: [{ type: 'album', title: 'Blonde' }, { type: 'piece', title: 'Wool coat', status: 'owned' }], heroes: [...WORLDS] });
	await page.setViewportSize({ width: 768, height: 900 });
	for (const name of WORLDS) {
		await open(page, `/${name}`);
		const h1 = (await page.locator('.screen-lead h1').boundingBox())!;
		const bar = (await page.locator('.app-bar').boundingBox())!;
		const ys = range(Math.ceil(bar.y + bar.height), Math.floor(h1.y));
		const column = await paintedVeil(page, ys.map((y) => [h1.x + 4, y]));
		let run = 0;
		let longest = 0;
		for (const a of column) {
			run = a <= 0.02 ? run + 1 : 0;
			longest = Math.max(longest, run);
		}
		expect(longest, name).toBeGreaterThanOrEqual(64);
	}
});

test('Scenario: A world without a hero photo shows the flat night band', async ({ page, request }) => {
	await seed(request, { entries: [{ type: 'piece', title: 'Wool coat', status: 'owned' }] });
	await open(page, '/fashion');
	await expect(page.locator('.frame > figure.stage')).toHaveCount(0);
	const band = await page.locator('.frame').evaluate((el) => {
		const s = getComputedStyle(el, '::before');
		const night = getComputedStyle(el).getPropertyValue('--world-night').trim();
		return { bg: s.backgroundColor, image: s.backgroundImage, night, height: parseFloat(s.height) };
	});
	expect(band.night.toUpperCase()).toBe('#29211D');
	expect(band.bg).toBe('rgb(41, 33, 29)');
	expect(band.image).toBe('none');
	const head = (await page.locator('.screen-head').boundingBox())!;
	expect(band.height).toBeGreaterThanOrEqual(head.height);
	await expect(page.locator('main h1')).toHaveCSS('color', 'rgb(255, 255, 255)');
	await expectReadable(page, page.locator('.app-bar, .screen-head'), 'no-hero head');
});

test('Scenario: A world without a hero photo keeps a banner-tall head', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop');
	await seed(request, { entries: [{ type: 'piece', title: 'Wool coat', status: 'owned' }] });
	for (const width of [768, 1280]) {
		await page.setViewportSize({ width, height: 900 });
		await open(page, '/fashion');
		await expect(page.locator('.frame > figure.stage')).toHaveCount(0);
		const { head, lead, min, max } = await page.locator('.screen-head').evaluate((el) => {
			const px = (v: string) => {
				const probe = document.createElement('i');
				probe.style.cssText = `position:absolute;block-size:${v}`;
				el.append(probe);
				const h = probe.getBoundingClientRect().height;
				probe.remove();
				return h;
			};
			const h = el.getBoundingClientRect();
			const l = el.querySelector('.screen-lead')!.getBoundingClientRect();
			return {
				head: { top: h.top, bottom: h.bottom, height: h.height, pad: parseFloat(getComputedStyle(el).paddingBlockEnd), gap: parseFloat(getComputedStyle(el).rowGap) },
				lead: { bottom: l.bottom },
				min: px('calc(var(--facts-max) + var(--space-16))'),
				max: px('calc(var(--facts-max) + var(--stage-overlap) + var(--space-16))')
			};
		});
		expect(head.height, `${width}`).toBeGreaterThanOrEqual(min - 0.5);
		expect(head.height, `${width}`).toBeLessThanOrEqual(max + 0.5);
		// the type at the foot: under the lead lie only the head's bottom padding and, on wide screens, the empty row the
		// facts card spans beside the seg bar
		expect(head.bottom - head.pad - lead.bottom, `${width}`).toBeLessThanOrEqual(head.gap + 1);
		expect(head.bottom - head.pad - lead.bottom, `${width}`).toBeGreaterThanOrEqual(-1);
	}
});

test('Scenario: Head text on the night is light or sits on its own surface', async ({ page, request }) => {
	const {
		entries: [book, , , artist, album]
	} = await seed(request, {
		entries: [
			{ type: 'book', title: 'A Field Guide to Winter', status: 'done', rating: 9 },
			{ type: 'anime', title: 'Night Train', status: 'progress', progress: { episodes: { current: 3, total: 12 } } },
			{ type: 'piece', title: 'Wool coat', status: 'owned' },
			{ type: 'artist', title: 'Marlene Okafor' },
			{ type: 'album', title: 'Blue Hour', artist: 3 }
		],
		heroes: [...WORLDS]
	});
	void artist;
	for (const path of [...WORLDS.map((w) => `/${w}`), '/animanga/anime', '/fashion/wardrobe', `/entries/${book}`, `/entries/${album}`, '/add/book', `/entries/${book}/edit`]) {
		await open(page, path);
		await expect(page.locator('main h1'), path).toHaveCSS('color', 'rgb(255, 255, 255)');
		await expectReadable(page, page.locator('.app-bar, .screen-head'), path);
	}
});

test('Scenario: Overlays in a world stay readable', async ({ page, request }) => {
	const {
		entries: [book]
	} = await seed(request, {
		entries: [
			{ type: 'book', title: 'A Field Guide to Winter', status: 'done', rating: 9 },
			{ type: 'book', title: 'Dune', status: 'want' }
		],
		heroes: ['books']
	});
	const overlay = (sel: string) => page.locator(sel).filter({ visible: true });

	await open(page, '/books');
	await page.locator('main').getByRole('button', { name: 'Add', exact: true }).click();
	await expect(page.getByRole('menu', { name: 'Add to Books' })).toBeVisible();
	await expectReadable(page, overlay('[role="menu"]'), 'add menu', true);
	await page.keyboard.press('Escape');

	await open(page, `/entries/${book}`);
	await expectReadable(page, page.locator('.screen-body'), 'entry body');
	await openEntryMenu(page);
	await expectReadable(page, overlay('[role="menu"]'), 'entry menu', true);
	await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
	await expectReadable(page, page.getByRole('alertdialog'), 'delete dialog', true);
	// the modal scrim is the world's night, not charcoal
	const scrim = await page.getByRole('alertdialog').evaluate((el) => {
		const probe = document.createElement('i');
		probe.style.color = 'var(--world-night)';
		el.append(probe);
		const night = getComputedStyle(probe).color;
		probe.remove();
		return { night, backdrop: getComputedStyle(el, '::backdrop').backgroundColor };
	});
	expect(scrim.night).toBe('rgb(22, 37, 42)');
	// color-mix() computes to color(srgb r g b / a) with 0–1 channels
	const channels = (c: string) => {
		const k = c.startsWith('color(srgb') ? 255 : 1;
		const m = c.match(/[\d.]+/g)!.map(Number);
		return { rgb: m.slice(0, 3).map((v) => Math.round(v * k)), alpha: m.length > 3 ? m[3] : 1 };
	};
	expect(channels(scrim.backdrop).rgb).toEqual(channels(scrim.night).rgb);
	expect(channels(scrim.backdrop).alpha).toBeGreaterThan(0);
	await page.keyboard.press('Escape');
	await page.getByRole('button', { name: /^Status/ }).click();
	await expectReadable(page, overlay('[role="menu"], [role="listbox"]'), 'status menu', true);
	await page.keyboard.press('Escape');
	await page.getByRole('button', { name: 'Add to collection' }).click();
	await expectReadable(page, overlay('[role="menu"]'), 'collection menu', true);
	await page.getByRole('menuitem', { name: 'New collection' }).click();
	await expectReadable(page, page.getByRole('dialog', { name: 'New collection' }), 'new collection dialog', true);
	await page.keyboard.press('Escape');

	if (page.viewportSize()!.width < 1024) {
		await page.locator('.dock').getByRole('button', { name: 'Add', exact: true }).click();
		await expectReadable(page, page.getByRole('dialog'), 'type sheet', true);
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog')).toHaveCount(0);
	}

	await open(page, '/books/books');
	await page.locator('main').getByRole('button', { name: 'Select', exact: true }).click();
	await page.getByRole('button', { name: 'Dune', exact: true }).click();
	const bar = page.getByRole('region', { name: 'Selection', exact: true });
	await expectReadable(page, bar, 'selection bar', true);
	const direct = bar.getByRole('button', { name: 'Set status', exact: true });
	if ((await direct.count()) > 0) await direct.click();
	else {
		await bar.getByRole('button', { name: 'More', exact: true }).click();
		await page.getByRole('menuitem', { name: 'Set status', exact: true }).click();
	}
	await expectReadable(page, page.getByRole('dialog'), 'status sheet', true);
	await page.getByRole('dialog').getByRole('button', { name: 'Read', exact: true }).click();
	const toast = page.getByRole('status').filter({ hasText: 'Status set to Read' });
	await expect(toast).toBeVisible();
	await expectReadable(page, toast, 'toast', true);
});

test('Scenario: Focus rings in a world stand out from what they sit on', async ({ page, request }) => {
	await seed(request, { entries: [{ type: 'book', title: 'Dune', status: 'want' }], heroes: ['books'] });
	for (const path of ['/books', '/books/books']) {
		await open(page, path);
		await installContrast(page);
		let checked = 0;
		let halos = 0;
		for (let i = 0; i < 30; i++) {
			await page.keyboard.press('Tab');
			// reduced motion still fades colours, the ring's included: read it once it has settled
			await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
			const result = await page.evaluate(() => {
				const el = document.activeElement as HTMLElement | null;
				if (!el?.closest('.app-bar, .screen-head') || !el.matches(':focus-visible')) return null;
				const s = getComputedStyle(el);
				// the ring sits outside the control, on its parent's backdrop: the same check as text, with the ring as ink
				const against = (color: string) => {
					const probe = document.createElement('span');
					probe.textContent = 'ring';
					probe.style.cssText = `color:${color};font-size:30px;position:absolute`;
					el.parentElement!.append(probe);
					const fails = window.__nightContrast(probe);
					probe.remove();
					return fails;
				};
				const name = el.textContent?.trim() || el.getAttribute('aria-label');
				const ring = against(s.outlineColor);
				if (!el.matches('[data-focus="halo"]')) return { name, fails: ring };
				// a pill with a halo: the white ring with a halo inside it. One of the two must stand out from the
				// backdrop, and the ring from the halo; in a world the halo is the night, not charcoal
				if (s.boxShadow === 'none') return { name, fails: ['no halo'] };
				const halo = s.boxShadow.match(/rgba?\([^)]*\)/)![0];
				const fails = ring.length && against(halo).length ? [`ring ${ring.join(', ')}`] : [];
				const probe = document.createElement('i');
				probe.style.color = 'var(--world-night)';
				el.append(probe);
				const night = getComputedStyle(probe).color;
				probe.remove();
				if (halo !== night) fails.push(`halo ${halo} is not the night ${night}`);
				const lum = (c: string) => {
					const [r, g, b] = c.match(/[\d.]+/g)!.map(Number).map((v) => {
						const x = v / 255;
						return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
					});
					return 0.2126 * r + 0.7152 * g + 0.0722 * b;
				};
				const [hi, lo] = [lum(s.outlineColor), lum(halo)].sort((p, q) => q - p);
				if ((hi + 0.05) / (lo + 0.05) < 3) fails.push(`ring on halo ${((hi + 0.05) / (lo + 0.05)).toFixed(2)}`);
				return { name, fails, halo: true };
			});
			if (!result) continue;
			checked++;
			if ('halo' in result) halos++;
			expect(result.fails, `${path} ${result.name}`).toEqual([]);
		}
		expect(checked, path).toBeGreaterThan(3);
		// the head's Add pill and the bar's current pill are halo controls: the walk must reach them
		expect(halos, path).toBeGreaterThan(0);
	}
});

test('Scenario: The status bar takes the screen\'s colour', async ({ page, request }) => {
	const {
		entries: [book]
	} = await seed(request, { entries: [{ type: 'book', title: 'Dune' }] });
	const theme = page.locator('head meta[name="theme-color"]');
	const screens: [string, string][] = [
		['/', '#E7E2DC'],
		['/collections', '#E7E2DC'],
		['/settings', '#E7E2DC'],
		['/music', '#2A191C'],
		['/animanga', '#11142B'],
		['/books', '#16252A'],
		['/fashion', '#29211D'],
		[`/entries/${book}`, '#16252A']
	];
	for (const [path, color] of screens) {
		await open(page, path);
		await expect(theme, path).toHaveCount(1);
		await expect(theme, path).toHaveAttribute('content', color);
	}
	await open(page, '/');
	const nav = page.viewportSize()!.width < 1024 ? page.locator('.dock') : page.locator('.app-bar');
	await nav.getByRole('link', { name: 'Books', exact: true }).click();
	await page.waitForURL('**/books');
	await expect(theme).toHaveCount(1);
	await expect(theme).toHaveAttribute('content', '#16252A');
});
