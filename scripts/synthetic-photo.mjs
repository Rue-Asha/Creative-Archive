// Generates a stand-in mockup photo for a shape the CC0 search didn't cover: a diagonal two-colour gradient with
// an optional third-colour light bloom and film grain, written as JPEG.
// Usage: node scripts/synthetic-photo.mjs <name> <width> <height> [#from] [#to] [#bloom]
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import sharp from 'sharp';

const [name, w, h, from = '#2a2622', to = '#c9b9a3', bloom] = process.argv.slice(2);
const width = Number(w);
const height = Number(h);
if (!name || !Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
	console.error('usage: node scripts/synthetic-photo.mjs <name> <width> <height> [#from] [#to] [#bloom]');
	process.exit(1);
}

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const [a, b] = [rgb(from), rgb(to)];
const c = bloom ? rgb(bloom) : null;
// deterministic grain, so a regenerated file doesn't show up as a change
let seed = 0x9e3779b9;
const noise = () => {
	seed ^= seed << 13;
	seed ^= seed >>> 17;
	seed ^= seed << 5;
	return ((seed >>> 0) / 0xffffffff - 0.5) * 18;
};

const pixels = Buffer.alloc(width * height * 3);
for (let y = 0; y < height; y++) {
	for (let x = 0; x < width; x++) {
		const t = (x / width) * 0.35 + (y / height) * 0.65;
		const glow = Math.max(0, 1 - Math.hypot(x / width - 0.7, y / height - 0.3) * 1.6) * 40;
		const bloomAt = c ? Math.max(0, 1 - Math.hypot(x / width - 0.25, y / height - 0.72) * 2.1) ** 1.6 : 0;
		const grain = noise();
		for (let k = 0; k < 3; k++) {
			const base = a[k] + (b[k] - a[k]) * t + glow;
			const v = c ? base + (c[k] - base) * bloomAt : base;
			pixels[(y * width + x) * 3 + k] = Math.max(0, Math.min(255, Math.round(v + grain)));
		}
	}
}

const dir = resolve(process.env.MOCKUP_PHOTOS_DIR ?? 'fixtures/mockups');
mkdirSync(dir, { recursive: true });
const out = join(dir, `${name}.jpg`);
await sharp(pixels, { raw: { width, height, channels: 3 } }).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
console.log(out);
