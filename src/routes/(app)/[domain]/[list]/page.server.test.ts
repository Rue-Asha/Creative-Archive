import { isRedirect } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';
import { load } from './+page.server.ts';

const run = (domain: string, list: string, query: string) => {
	try {
		load({ params: { domain, list }, url: new URL(`http://localhost/${domain}/${list}?${query}`) } as never);
	} catch (thrown) {
		if (isRedirect(thrown)) return { status: thrown.status, location: thrown.location };
		throw thrown;
	}
	return null;
};

describe('retired fashion lists', () => {
	it('Scenario: Retired brands list redirects', () => {
		expect(run('fashion', 'brands', 'tag=3&sort=title')).toEqual({ status: 308, location: '/fashion/brands-shops?tag=3&sort=title&kind=brand' });
		expect(run('fashion', 'brands', '')).toEqual({ status: 308, location: '/fashion/brands-shops?kind=brand' });
	});

	it('Scenario: Retired shops list redirects', () => {
		expect(run('fashion', 'shops', 'sort=title')).toEqual({ status: 308, location: '/fashion/brands-shops?sort=title' });
		expect(run('fashion', 'shops', '')).toEqual({ status: 308, location: '/fashion/brands-shops' });
	});
});
