// How far the photo trails the page: it moves at 0.3 of the scroll speed.
const RATE = 0.3;

export function parallaxOffset(scrollY: number, reduced: boolean): number {
	return reduced ? 0 : Math.max(0, scrollY) * RATE;
}
