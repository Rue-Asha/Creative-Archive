// The pill glide (motion.css "2. The pill glides"): an inert charcoal copy of the track is laid over it and clipped to the
// current item, so labels change colour exactly under the pill. Keyboard activation, scroll and resize jump. After
// Design-System specimen/shell.js pill() and edges().
const FADE = 56;

export function pill(track: HTMLElement) {
	const items = [...track.querySelectorAll<HTMLElement>('a, button')];
	const host = track.parentElement;
	if (!items.length || !host) return {};
	const isOn = (i: HTMLElement) => i.hasAttribute('aria-current') || i.getAttribute('aria-pressed') === 'true';

	host.setAttribute('data-pill-host', '');
	track.setAttribute('data-pill-track', '');
	items.forEach((i) => i.setAttribute('data-pill-item', ''));
	const ghost = track.cloneNode(true) as HTMLElement;
	ghost.removeAttribute('data-pill-track');
	ghost.setAttribute('data-pill-ghost', '');
	ghost.setAttribute('aria-hidden', 'true');
	ghost.inert = true;
	ghost.querySelectorAll('[id], [aria-current], [aria-pressed], [data-pill-item]').forEach((n) => {
		for (const a of ['id', 'aria-current', 'aria-pressed']) n.removeAttribute(a);
		n.setAttribute('tabindex', '-1');
	});
	track.after(ghost);

	function edges() {
		const more = track.scrollWidth - track.clientWidth;
		const start = more > 1 && track.scrollLeft > 1;
		const end = more > 1 && track.scrollLeft < more - 1;
		for (const n of [track, ghost]) {
			n.toggleAttribute('data-fade-start', start);
			n.toggleAttribute('data-fade-end', end);
		}
		host!.toggleAttribute('data-more-start', start);
		host!.toggleAttribute('data-more-end', end);
	}

	function place(instant: boolean) {
		if (instant) ghost.setAttribute('data-pill-instant', '');
		ghost.scrollLeft = track.scrollLeft;
		const h = host!.getBoundingClientRect();
		const b = track.getBoundingClientRect();
		Object.assign(ghost.style, { left: `${b.left - h.left}px`, top: `${b.top - h.top}px`, width: `${b.width}px`, height: `${b.height}px` });
		const cur = items.find(isOn);
		if (cur) {
			const t = cur.offsetTop;
			const l = cur.offsetLeft - track.scrollLeft;
			ghost.style.setProperty('--pill-clip', `inset(${t}px ${track.offsetWidth - l - cur.offsetWidth}px ${track.offsetHeight - t - cur.offsetHeight}px ${l}px round 999px)`);
		} else ghost.style.removeProperty('--pill-clip');
		if (instant) {
			void getComputedStyle(ghost).clipPath;
			ghost.removeAttribute('data-pill-instant');
		}
	}

	const onClick = (e: MouseEvent) => {
		const hit = items.find((i) => i.contains(e.target as Node));
		if (!hit) return;
		if (hit.hasAttribute('aria-pressed')) items.forEach((i) => i.setAttribute('aria-pressed', String(i === hit)));
		else if (hit.getAttribute('href') === '#') {
			items.forEach((i) => (i === hit ? i.setAttribute('aria-current', 'page') : i.removeAttribute('aria-current')));
			e.preventDefault();
		}
		place(e.detail === 0);
	};
	track.addEventListener('click', onClick);

	const cur = items.find(isOn);
	if (cur && track.scrollWidth > track.clientWidth) {
		const over = cur.offsetLeft + cur.offsetWidth + FADE - track.clientWidth;
		if (over > 0) track.scrollLeft = Math.min(over, cur.offsetLeft - FADE);
	}
	const sync = () => {
		edges();
		place(true);
	};
	const observer = new ResizeObserver(sync);
	observer.observe(track);
	track.addEventListener('scroll', sync, { passive: true });
	sync();

	return {
		destroy() {
			observer.disconnect();
			track.removeEventListener('click', onClick);
			track.removeEventListener('scroll', sync);
			ghost.remove();
			host.removeAttribute('data-pill-host');
			track.removeAttribute('data-pill-track');
			items.forEach((i) => i.removeAttribute('data-pill-item'));
		}
	};
}
