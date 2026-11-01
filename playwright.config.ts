import { defineConfig } from '@playwright/test';
import { resolve } from 'node:path';

const port = Number(process.env.PORT ?? 4173);
// E2E_APP_DIR points at an unpacked release tarball; the database stays in the repo's .e2e/.
const db = resolve(`.e2e/${port}.db`);

export default defineConfig({
	testDir: 'e2e',
	// every data test resets the one shared database first, so tests cannot run side by side
	workers: 1,
	// adapter-node assumes https unless a proxy says otherwise, and an https self-origin fails Kit's
	// CSRF check for form posts and DELETEs over plain http. This plays the proxy's part.
	use: { baseURL: `http://localhost:${port}`, extraHTTPHeaders: { 'x-forwarded-proto': 'http' } },
	projects: [
		{
			name: 'phone',
			use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }
		},
		{
			name: 'desktop',
			use: { viewport: { width: 1280, height: 800 } }
		}
	],
	webServer: {
		command: `mkdir -p '${resolve('.e2e')}' && rm -f '${db}'* && node build`,
		cwd: process.env.E2E_APP_DIR,
		port,
		reuseExistingServer: false,
		env: {
			PORT: String(port),
			PROTOCOL_HEADER: 'x-forwarded-proto',
			DATABASE_PATH: db,
			BODY_SIZE_LIMIT: '17M',
			CREATIVE_ARCHIVE_TEST: '1',
			MOCKUP_PHOTOS_DIR: resolve('fixtures/mockups')
		}
	}
});
