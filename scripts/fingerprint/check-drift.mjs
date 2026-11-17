#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const root = process.cwd();
const lockPath = join(root, 'fingerprint.lock');
if (!existsSync(lockPath)) {
	console.error('check-drift: fingerprint.lock not found, run Design-System/scripts/sync.sh <app-path>');
	process.exit(2);
}

const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
const problems = [];
for (const [rel, expected] of Object.entries(lock.files)) {
	const p = join(root, rel);
	if (!existsSync(p)) {
		problems.push(`${rel} missing`);
		continue;
	}
	if (createHash('sha256').update(readFileSync(p)).digest('hex') !== expected) problems.push(`${rel} changed`);
}

if (problems.length) {
	console.error(problems.map((p) => `check-drift: ${p}`).join('\n'));
	console.error(`check-drift: vendored files differ from lock v${lock.version}. Request changes in Design-System/requests.md, then re-sync.`);
	process.exit(1);
}
console.log(`check-drift: ${Object.keys(lock.files).length} file(s) match lock v${lock.version}`);
