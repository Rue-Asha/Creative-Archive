import { requireTestFlag } from '#lib/server/test-flag.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => {
	requireTestFlag();
};
