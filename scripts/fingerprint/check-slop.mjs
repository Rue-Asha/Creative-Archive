#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const args = process.argv.slice(2);
const flag = (name) => {
	const i = args.indexOf(name);
	return i === -1 ? null : (args[i + 1] ?? null);
};
const root = process.cwd();
const explicitBanned = flag('--banned');
const bannedPath = resolve(root, explicitBanned ?? 'scripts/fingerprint/banned.md');
const baselineFlag = flag('--baseline');

const NAMED = `aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen`.split(' ');

const COLOR_PROPS = /^(--[\w-]+|color|background|background-color|background-image|border(-[\w]+)*|outline(-[\w]+)*|fill|stroke|box-shadow|text-shadow|caret-color|accent-color|text-decoration(-color)?|column-rule(-color)?|scrollbar-color|stop-color|flood-color|lighting-color)$/;
const HEX = /#[0-9a-fA-F]{3,8}\b/;
const COLOR_FN = /(?<![\w-])(rgba?|hsla?|hwb|oklch|oklab|lab|lch|color)\(/;
const NAMED_RE = new RegExp(`(?<![\\w-])(${NAMED.join('|')})(?![\\w(-])`, 'i');
const KEYWORDS = /^(none|inherit|initial|unset|revert|0)?$/;
const TIME = /(?<![\w.-])(\d*\.?\d+)(ms|s)\b/g;
const EASING = /(?<![\w-])(ease|ease-in|ease-out|ease-in-out|linear|step-start|step-end)(?![\w-])|cubic-bezier\(|steps\(|linear\(/;

const stripVars = (v) => {
	let prev;
	do {
		prev = v;
		v = v.replace(/var\([^()]*\)/g, ' ');
	} while (v !== prev);
	return v.trim();
};
const lineOf = (text, idx) => text.slice(0, idx).split('\n').length;
const blank = (s) => s.replace(/[^\n]/g, ' ');

function segments(file, src) {
	if (file.endsWith('.css')) return [{ text: src, offset: 0 }];
	const out = [];
	for (const m of src.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)) {
		out.push({ text: m[1], offset: m.index + m[0].indexOf('>') + 1 });
	}
	for (const m of src.matchAll(/(?<![\w:-])style\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/g)) {
		const text = m[1] ?? m[2] ?? m[3];
		out.push({ text, offset: m.index + m[0].indexOf(text) });
	}
	for (const m of src.matchAll(/(?<![\w-])style:([\w-]+)(?:\|important)?\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
		out.push({ text: `${m[1]}:${m[2] ?? m[3]}`, offset: m.index });
	}
	return out;
}

function checkDecl(prop, value) {
	const hits = [];
	value = value.trim().replace(/\s+/g, ' ');
	const v = value.replace(/"[^"]*"|'[^']*'/g, '""').replace(/url\([^)]*\)/g, ' ');
	if (COLOR_PROPS.test(prop) && (HEX.test(v) || COLOR_FN.test(v) || NAMED_RE.test(v))) {
		hits.push(['color-literal', `color literal in "${prop}: ${value}"`]);
	}
	const rest = stripVars(v);
	if (prop === 'box-shadow' && !KEYWORDS.test(rest.replace(/,/g, ' ').trim())) hits.push(['shadow-raw', `raw box-shadow "${value}", use a var(--…) token`]);
	if (/^border(-[a-z]+)*-radius$/.test(prop) && !/^[\s0/]*$/.test(rest) && !KEYWORDS.test(rest)) hits.push(['radius-raw', `raw ${prop} "${value}", use a var(--…) token`]);
	if (prop === 'font-family' && !KEYWORDS.test(rest)) hits.push(['font-family-raw', `raw font-family "${value}", use a var(--…) token`]);
	const motion = /^(transition|animation)$/.test(prop);
	const longDuration = /^(transition|animation)-duration$/.test(prop);
	const longTiming = /^(transition|animation)-timing-function$/.test(prop);
	if (motion || longDuration || longTiming) {
		const nonZeroTime = [...rest.matchAll(TIME)].some((t) => parseFloat(t[1]) !== 0);
		const rawEasing = EASING.test(rest);
		const bad = motion ? nonZeroTime || rawEasing : longDuration ? nonZeroTime : rawEasing;
		if (bad) hits.push(['motion-raw', `raw ${prop} "${value}", use var(--…) tokens`]);
	}
	return hits;
}

function parseBanned(path) {
	const entries = [];
	const text = readFileSync(path, 'utf8');
	for (const block of text.split(/^## /m).slice(1)) {
		const id = block.split('\n')[0].trim().split(/\s+/)[0];
		const reason = block.match(/^Reason:\s*(.+)$/m)?.[1].trim() ?? '';
		const rx = block.match(/```regex\n([\s\S]*?)```/)?.[1].trim();
		entries.push({ id, reason, regex: rx ? new RegExp(rx, 'gmu') : null });
	}
	return entries;
}

if (!existsSync(bannedPath)) {
	console.error(`check-slop: banned list not found at ${relative(root, bannedPath)} (use --banned <path>)`);
	process.exit(2);
}
const banned = parseBanned(bannedPath);

if (args.includes('--list-review')) {
	for (const b of banned.filter((b) => !b.regex)) console.log(`${b.id} ${b.reason}`);
	process.exit(0);
}

function walk(dir) {
	if (!existsSync(dir)) return [];
	return readdirSync(dir).flatMap((name) => {
		const p = join(dir, name);
		if (statSync(p).isDirectory()) return walk(p);
		return /\.(svelte|css)$/.test(name) || p === join(root, 'src/app.html') ? [p] : [];
	});
}

const skip = join(root, 'src/lib/styles/fingerprint');
const files = walk(join(root, 'src')).filter((f) => !f.startsWith(skip + '/'));
const problems = [];

for (const file of files) {
	const src = readFileSync(file, 'utf8');
	const rel = relative(root, file);
	for (const seg of segments(file, src)) {
		const text = seg.text.replace(/\/\*[\s\S]*?\*\//g, blank);
		for (const m of text.matchAll(/(--[\w-]+|[a-zA-Z-]+)\s*:\s*([^;{}]*)/g)) {
			for (const [id, msg] of checkDecl(m[1].toLowerCase(), m[2])) {
				problems.push(`${rel}:${lineOf(src, seg.offset + m.index)} ${id} ${msg}`);
			}
		}
	}
	for (const b of banned.filter((b) => b.regex)) {
		for (const m of src.matchAll(b.regex)) {
			problems.push(`${rel}:${lineOf(src, m.index)} ${b.id} ${b.reason}`);
		}
	}
}

if (baselineFlag) {
	const baselinePath = resolve(root, baselineFlag);
	if (!existsSync(baselinePath)) {
		console.error(`check-slop: baseline not found at ${relative(root, baselinePath)}`);
		process.exit(2);
	}
	// "file:line rule message" -> "file rule message": the line moves, the declaration text does not
	const key = (line) => line.replace(/^(.+?):\d+ /, '$1 ');
	const budget = new Map();
	for (const line of readFileSync(baselinePath, 'utf8').split('\n').filter(Boolean)) budget.set(line, (budget.get(line) ?? 0) + 1);
	const fresh = problems.filter((line) => {
		const k = key(line);
		const left = budget.get(k) ?? 0;
		if (left) budget.set(k, left - 1);
		return !left;
	});
	if (fresh.length) {
		console.error(fresh.join('\n'));
		console.error(`check-slop: ${fresh.length} new problem(s) beyond the ${problems.length - fresh.length} recorded`);
		process.exit(1);
	}
	console.log(`check-slop: ${problems.length} recorded problem(s) tolerated, nothing new`);
	process.exit(0);
}

if (problems.length) {
	console.error(problems.join('\n'));
	console.error(`check-slop: ${problems.length} problem(s)`);
	process.exit(1);
}
console.log(`check-slop: ${files.length} file(s) clean`);
