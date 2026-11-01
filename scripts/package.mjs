import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
const name = `creative-archive-${version}`;
const tarball = `${name}.tgz`;
const staging = join('dist', 'staging');
const root = join(staging, name);

rmSync('dist', { recursive: true, force: true });
mkdirSync(root, { recursive: true });
cpSync('build', join(root, 'build'), { recursive: true });
// the server applies migrations/ from the package root, found next to package.json
cpSync('migrations', join(root, 'migrations'), { recursive: true });
cpSync('package.json', join(root, 'package.json'));
cpSync('package-lock.json', join(root, 'package-lock.json'));

// prepare runs svelte-kit sync, which is a dev dependency and absent here
execFileSync('npm', ['ci', '--omit=dev', '--ignore-scripts', '--no-audit', '--no-fund'], {
	cwd: root,
	stdio: 'inherit'
});
// npm ci creates no node_modules while there are no production dependencies; the tarball layout stays fixed
mkdirSync(join(root, 'node_modules'), { recursive: true });

execFileSync('tar', ['-czf', join('dist', tarball), '-C', staging, name]);
rmSync(staging, { recursive: true });

const hash = createHash('sha256').update(readFileSync(join('dist', tarball))).digest('hex');
writeFileSync(join('dist', `${tarball}.sha256`), `${hash}  ${tarball}\n`);
console.log(`dist/${tarball}`);
