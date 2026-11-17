import { getHeroes } from '#lib/server/heroes.ts';
import { themeColors } from '#lib/server/theme.ts';
import type { LayoutServerLoad } from './$types';

const themes = themeColors();

// every screen's frame shows its world's hero photo, and the status bar takes its world's colour
export const load: LayoutServerLoad = () => ({ heroes: getHeroes(), themes });
