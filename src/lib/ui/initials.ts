const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

const graphemes = (word: string) =>
	[...segmenter.segment(word)].map((s) => s.segment).filter((g) => !/^[\p{P}\p{Sm}\p{Sc}\p{Sk}]+$/u.test(g));

// First letters of the first two words; a single word gives its first two graphemes (CJK titles have no spaces).
export function initials(title: string): string {
	const words = title
		.trim()
		.split(/\s+/)
		.map(graphemes)
		.filter((g) => g.length > 0);
	if (words.length === 0) return '';
	const picked = words.length === 1 ? words[0].slice(0, 2) : [words[0][0], words[1][0]];
	return picked.join('').toLocaleUpperCase();
}
