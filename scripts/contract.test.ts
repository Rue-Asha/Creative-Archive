import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../', import.meta.url));
const contract = readFileSync(join(root, 'docs/functional-contract.md'), 'utf8');
const product = readFileSync(join(root, 'PRODUCT.md'), 'utf8');

function section(heading: string): string {
	const start = contract.indexOf(`\n${heading} `);
	expect(start, heading).toBeGreaterThan(-1);
	const next = contract.slice(start + 1).search(/\n#{2,3} /);
	return contract.slice(start, next === -1 ? undefined : start + 1 + next);
}

describe('functional contract', () => {
	it('Scenario: Contract lists magazines', () => {
		expect(section('### 4.3')).toContain('`/fashion/magazines`');
		const add = section('### 4.4');
		expect(add).toMatch(/Valid `type`:[^\n]*\bmagazine\b/);
		expect(add).toMatch(/With URL preview \([^)]*\bmagazine\b[^)]*\)/);
		expect(contract).toContain(
			'| Fashion | Magazine | `magazines` | Name | Handles: Instagram, TikTok, YouTube, Website | none | no | none | no | yes |'
		);
	});

	it('describes Select mode and the bulk actions in the list', () => {
		const list = section('### 4.3');
		expect(list).toContain('Select');
		expect(list).toContain('Set status');
		expect(list).toContain('Add tag');
		expect(list).toContain('Remove tag');
		expect(list).toContain('wording fixed at gate 5');
		for (const option of ['Any rating', '9 and up', '8 and up', '7 and up', '6 and up', '5 and up'])
			expect(list).toContain(`"${option}"`);
	});

	it('describes reorder and Select mode in a collection', () => {
		const page = section('### 4.8');
		for (const text of ['Move up', 'Move down', 'Move to top', 'Move to bottom', 'Move before…', 'Remove from collection', '409'])
			expect(page, text).toContain(text);
		expect(page).toMatch(/drag/i);
	});

	it('lists the new form actions', () => {
		const routes = section('### 4.10');
		for (const text of ['bulkStatus', 'bulkTag', 'removeMany', 'reorder', '400', '409'])
			expect(routes, text).toContain(text);
	});

	it('allow-lists data-world, data-stage and data-backdrop', () => {
		const list = section('## 7.');
		expect(list).toMatch(/\| `data-world`/);
		expect(list).toMatch(/\| `data-stage`/);
		expect(list).toMatch(/\| `data-backdrop`/);
	});

	it('PRODUCT.md names bulk actions and magazines', () => {
		expect(product).toMatch(/bulk/i);
		expect(product).toMatch(/magazine/i);
	});
});
