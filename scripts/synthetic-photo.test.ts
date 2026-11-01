import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import { afterAll, expect, test } from 'vitest';

// MOCKUP_PHOTOS_DIR moves the output away from fixtures/mockups, whose credits test must not see this file.
const dir = mkdtempSync(join(tmpdir(), 'creative-archive-synthetic-'));

afterAll(() => rmSync(dir, { recursive: true, force: true }));

test('Scenario: Missing photo shape is generated', async () => {
	execFileSync('node', [resolve('scripts/synthetic-photo.mjs'), 'tall-cover', '600', '900'], {
		env: { ...process.env, MOCKUP_PHOTOS_DIR: dir },
		stdio: 'pipe'
	});

	const meta = await sharp(join(dir, 'tall-cover.jpg')).metadata();
	expect(meta.format).toBe('jpeg');
	expect([meta.width, meta.height]).toEqual([600, 900]);
});
