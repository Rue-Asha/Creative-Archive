export interface Place {
	x: number; // offset from the centre, in percent of the card width
	z: number; // depth in px, negative = away from the viewer
	rotate: number; // rotateY in degrees
	scale: number;
	fade: number; // 1 = fully visible, 0 = hidden
	layer: number;
}

const OFFSET = 46;
const DEPTH = 160;
const TILT = 38;
const SHRINK = 0.04;
const VISIBLE = 3;

export const SWIPE_PX = 40;

const pad = (n: number) => String(n).padStart(2, '0');

export function coverflowState(index: number, count: number, by = 0) {
	const at = Math.max(0, Math.min(count - 1, index + by));
	return {
		index: at,
		label: `${pad(at + 1)} / ${pad(count)}`,
		arrows: count > 1,
		canPrev: at > 0,
		canNext: at < count - 1
	};
}

// right to left (negative dx) brings the next card to the centre
export function swipeStep(dx: number, threshold = SWIPE_PX): -1 | 0 | 1 {
	if (Math.abs(dx) < threshold) return 0;
	return dx < 0 ? 1 : -1;
}

// a position that follows the finger, with resistance past either end
export function dragPosition(index: number, dx: number, stepPx: number, count: number): number {
	const p = index - dx / stepPx;
	const last = count - 1;
	if (p < 0) return p / 3;
	if (p > last) return last + (p - last) / 3;
	return p;
}

// position may be fractional while a card is dragged between two steps
export function place(i: number, position: number): Place {
	const d = i - position;
	const far = Math.abs(d);
	const side = Math.sign(d);
	return {
		x: d * OFFSET,
		z: -Math.min(far, VISIBLE) * DEPTH || 0,
		rotate: -side * Math.min(far, 1) * TILT || 0,
		scale: 1 - Math.min(far, VISIBLE) * SHRINK,
		fade: Math.max(0, Math.min(1, VISIBLE - far)),
		layer: Math.round(100 - far * 10)
	};
}
