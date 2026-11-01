import { readdirSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

const dir = '.github/workflows';
const files = readdirSync(dir).filter((f) => f.endsWith('.yml'));
const read = (f: string) => readFileSync(`${dir}/${f}`, 'utf8');

test('Scenario: Workflow actions are pinned to commit SHAs', () => {
	expect(files).toEqual(['ci.yml', 'gate.yml', 'release.yml']);
	for (const f of files) {
		const text = read(f);
		const remote = text.match(/^\s*(?:- )?uses: (?!\.\/).+$/gm) ?? [];
		expect(remote.length).toBeGreaterThan(0);
		for (const line of remote) expect(line, `${f}: ${line}`).toMatch(/uses: \S+@[0-9a-f]{40} # v\d/);
		expect(text, f).not.toMatch(/^\s*cache:/m);
		for (const m of text.matchAll(/uses: actions\/checkout@[^\n]*\n((?:[ \t]+.*\n)*)/g))
			expect(m[1], f).toMatch(/persist-credentials: false/);
	}
});
