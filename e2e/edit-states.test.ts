import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed, type SeedEntry } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

type Row = { entry: SeedEntry; label: 'Title' | 'Name'; fields: Record<string, string>; select?: Record<string, string> };

const ROWS: Row[] = [
	{
		entry: { type: 'album', title: 'Blonde', details: { year: 2016, recordType: 'ep', trackCount: 17 } },
		label: 'Title',
		fields: { Year: '2016', Tracks: '17' },
		select: { Type: 'ep' }
	},
	{ entry: { type: 'artist', title: 'Frank Ocean' }, label: 'Name', fields: {} },
	{ entry: { type: 'song', title: 'Nights', details: { albumTitle: 'Blonde', year: 2016 } }, label: 'Title', fields: { Album: 'Blonde', Year: '2016' } },
	{
		entry: { type: 'anime', title: 'Frieren', details: { altTitle: 'Sousou no Frieren', year: 2023 }, progress: { episodes: { current: 3, total: 28 } } },
		label: 'Title',
		fields: { 'Alternative title': 'Sousou no Frieren', Year: '2023', 'Episodes total': '28' }
	},
	{
		entry: { type: 'manga', title: 'Vagabond', details: { altTitle: 'Bagabondo', year: 1998 }, progress: { chapters: { current: 3, total: 327 }, volumes: { current: 1, total: 37 } } },
		label: 'Title',
		fields: { 'Alternative title': 'Bagabondo', Year: '1998', 'Chapters total': '327', 'Volumes total': '37' }
	},
	{ entry: { type: 'book', title: 'Dune', details: { authors: ['Frank Herbert', 'Brian Herbert'], year: 1965 } }, label: 'Title', fields: { Authors: 'Frank Herbert\nBrian Herbert', Year: '1965' } },
	{
		entry: { type: 'brand', title: 'Studio Nicholson', kind: 'brand', details: { url: 'https://studionicholson.example/', description: 'Calm London label.' } },
		label: 'Name',
		fields: { URL: 'https://studionicholson.example/', Description: 'Calm London label.' },
		select: { Kind: 'brand' }
	},
	{
		entry: { type: 'site', title: 'Vestiaire', kind: 'shop', details: { url: 'https://vestiaire.example/', description: 'Second-hand pieces.' } },
		label: 'Name',
		fields: { URL: 'https://vestiaire.example/', Description: 'Second-hand pieces.' },
		select: { Kind: 'shop' }
	},
	{
		entry: { type: 'influencer', title: 'Kinfolk', details: { handles: { instagram: 'kinfolk', website: 'https://kinfolk.example/' } } },
		label: 'Name',
		fields: { Instagram: 'kinfolk', Website: 'https://kinfolk.example/' }
	},
	{
		entry: { type: 'magazine', title: 'Apartamento', details: { handles: { instagram: 'apartamentomagazine', youtube: 'apartamento' } } },
		label: 'Name',
		fields: { Instagram: 'apartamentomagazine', YouTube: 'apartamento' }
	},
	{
		entry: { type: 'piece', title: 'Wool coat', status: 'owned', details: { brand: 'Margaret Howell', url: 'https://mh.example/coat', price: '€ 450' } },
		label: 'Name',
		fields: { Brand: 'Margaret Howell', URL: 'https://mh.example/coat', Price: '€ 450' },
		select: { Status: 'owned' }
	},
	{ entry: { type: 'look', title: 'Autumn layers', details: { sourceUrl: 'https://look.example/autumn' } }, label: 'Title', fields: { 'Source URL': 'https://look.example/autumn' } }
];

test('Scenario: Edit opens every type with its values', async ({ page, request }) => {
	const { entries } = await seed(request, { entries: ROWS.map((r) => ({ ...r.entry, rating: r.entry.type === 'album' ? 8.5 : undefined })) });
	for (const [i, row] of ROWS.entries()) {
		await open(page, `/entries/${entries[i]}/edit`);
		const type = row.entry.type;
		await expect(page.getByLabel(row.label, { exact: true }), type).toHaveValue(row.entry.title);
		for (const [label, value] of Object.entries(row.fields)) await expect(page.getByLabel(label, { exact: true }), `${type} ${label}`).toHaveValue(value);
		for (const [label, value] of Object.entries(row.select ?? {})) await expect(page.getByLabel(label, { exact: true }), `${type} ${label}`).toHaveValue(value);
		if (type === 'piece') await expect(page.getByLabel('Status', { exact: true })).toBeVisible();
		else await expect(page.getByLabel('Status', { exact: true }), `${type} has no Status`).toHaveCount(0);
		await expect(page.getByLabel('Rating'), `${type} has no Rating`).toHaveCount(0);
		await expect(page.getByLabel(/current/i), `${type} has no current progress`).toHaveCount(0);
	}
});

const nav = (page: Page, name: string) => page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name });
const dialog = (page: Page) => page.getByRole('alertdialog', { name: 'Discard changes?' });

test('Scenario: Edited form asks before leaving', async ({ page, request }) => {
	const { entries } = await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	await open(page, `/entries/${entries[0]}/edit`);
	await page.getByLabel('Title', { exact: true }).fill('Blond');
	// the phone bar slides out while a text field has focus, so the field lets go first
	const home = async () => {
		await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
		await nav(page, 'Home').click();
	};
	await home();

	await expect(dialog(page)).toBeVisible();
	await dialog(page).getByRole('button', { name: 'Keep editing' }).click();
	await expect(dialog(page)).toHaveCount(0);
	await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Blond');

	await home();
	await dialog(page).getByRole('button', { name: 'Discard' }).click();
	await expect(page).toHaveURL(/\/$/);
	await open(page, `/entries/${entries[0]}/edit`);
	await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Blonde');
});

test('Scenario: Edit crumb stays on one line with a long title', async ({ page, request }) => {
	const long = 'An exceedingly long title that keeps going well past the width of any phone screen, '.repeat(2).trim();
	const { entries } = await seed(request, { entries: [{ type: 'book', title: long }] });
	await open(page, `/entries/${entries[0]}/edit`);
	const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' });
	const rows = await crumbs.getByRole('listitem').evaluateAll((items) => items.map((li) => Math.round(li.getBoundingClientRect().top)));
	expect(new Set(rows).size).toBe(1);
	const last = crumbs.getByRole('link', { name: long });
	const cut = await last.evaluate((el) => el.scrollWidth > el.clientWidth);
	expect(cut).toBe(true);
	const others = await crumbs.getByRole('listitem').first().evaluate((el) => el.scrollWidth <= el.clientWidth);
	expect(others).toBe(true);
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
