import { readdirSync, readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const srcDir = fileURLToPath(new URL('..', import.meta.url));
const stylesDir = fileURLToPath(new URL('./styles/', import.meta.url));

function sourceFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
		const path = `${dir}${e.name}`;
		if (e.isDirectory()) return sourceFiles(`${path}/`);
		return /\.(svelte|css)$/.test(e.name) ? [path] : [];
	});
}

const files = sourceFiles(srcDir).map((path) => {
	const text = readFileSync(path, 'utf8');
	const styles = path.endsWith('.css') ? [text] : [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
	return { path, name: relative(srcDir, path), css: styles.join('\n').replace(/\/\*[\s\S]*?\*\//g, '') };
});

const namedColours = new Set(
	`aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood
	cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray
	darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen
	darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue
	firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew
	hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan
	lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray
	lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue
	mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred
	midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid
	palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple
	rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue
	slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white
	whitesmoke yellow yellowgreen`.split(/\s+/)
);

function declarationValues(css: string): string[] {
	return [...css.matchAll(/\{([^{}]*)\}/g)].flatMap((m) => m[1].split(';').map((d) => d.slice(d.indexOf(':') + 1)));
}

function namedColoursIn(css: string): string[] {
	return declarationValues(css).flatMap((value) => {
		const words = value
			.replace(/(['"]).*?\1|url\([^)]*\)|var\(--[\w-]+/g, ' ')
			.toLowerCase()
			.match(/[a-z][a-z-]*/g);
		return (words ?? []).filter((w) => namedColours.has(w));
	});
}

describe('style rules', () => {
	it('Scenario: Components use no named colour', () => {
		const found = files
			.filter((f) => !f.path.startsWith(stylesDir))
			.flatMap((f) => namedColoursIn(f.css).map((c) => `${f.name}: ${c}`));
		expect(found).toEqual([]);
	});

	it('Scenario: Font sizes come from the type scale', () => {
		const token = String.raw`var\(--t-[\w-]+\)`;
		const allowed = new RegExp(`^(${token}|0|inherit|calc\\((${token}|var\\(--display-scale\\)|[\\d.]+|[*/]|\\s)+\\))$`);
		const found = files.flatMap((f) =>
			[...f.css.matchAll(/font-size\s*:\s*([^;}]+)/g)]
				.map((m) => m[1].trim())
				.filter((value) => !allowed.test(value))
				.map((value) => `${f.name}: ${value}`)
		);
		expect(found).toEqual([]);
	});
});
