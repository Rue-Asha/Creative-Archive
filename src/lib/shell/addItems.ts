import { DOMAINS, type Domain } from '#lib/domains.ts';
import { TYPES, TYPES_BY_DOMAIN } from '#lib/entries/config.ts';

export interface AddItem {
	domain: Domain;
	label: string;
	href: string;
}

// brand and site share one form, so they are one item
export function addItems(scope: Domain | 'all', context?: { list?: string }): AddItem[] {
	if (scope === 'all') return DOMAINS.flatMap((domain) => addItems(domain, context));
	return TYPES_BY_DOMAIN[scope]
		.filter((type) => type !== 'site')
		.map((type) => {
			const href = type === 'brand' ? '/add/brand' : `/add/${type}`;
			const owned = type === 'piece' && context?.list === 'wardrobe';
			return {
				domain: scope,
				label: type === 'brand' ? 'Brand or shop' : TYPES[type].label,
				href: owned ? `${href}?status=owned` : href
			};
		});
}
