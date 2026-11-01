export const DOMAINS = ['music', 'animanga', 'books', 'fashion'] as const;
export type Domain = (typeof DOMAINS)[number];
export const WORLD_NAMES = ['home', ...DOMAINS] as const;
export type World = (typeof WORLD_NAMES)[number];
export const DOMAIN_LABEL: Record<Domain, string> = {
	music: 'Music',
	animanga: 'Animanga',
	books: 'Books',
	fashion: 'Fashion'
};
