// Scroll cue helpers: copy-in for sync.sh <app> --primitive scroll-cue. Use as Svelte actions
// (`use:cue`, `use:cueY`) on the scrolling track; its parent is the host. The CSS is layout.css.

// The wide app bar's scrolled state: sets data-scrolled on the bar while the top of its frame is
// out of view, from an IntersectionObserver on a sentinel (never a scroll listener). `use:scrolled`
// on the .app-bar; layout.css turns the attribute into the sticky capsule at 1100px and up.
export function scrolled(bar: HTMLElement) {
	const frame = bar.parentElement as HTMLElement;
	const sentinel = document.createElement('div');
	sentinel.setAttribute('aria-hidden', 'true');
	sentinel.style.cssText = 'position:absolute;inset-block-start:0;inset-inline-start:0;inline-size:1px;pointer-events:none;block-size:var(--bar-h)';
	frame.append(sentinel);
	const watch = new IntersectionObserver(([e]) => bar.toggleAttribute('data-scrolled', !e.isIntersecting));
	watch.observe(sentinel);
	return {
		destroy() {
			watch.disconnect();
			sentinel.remove();
		}
	};
}

// The phone dock while typing: sets data-hidden on the .dock while a text input, textarea or
// contenteditable in the page has focus on a coarse pointer (layout.css fades and slides it
// out; it stays in the DOM). `use:hideOnType` on the .dock.
const NOT_TEXT = new Set(['button', 'checkbox', 'color', 'file', 'image', 'radio', 'range', 'reset', 'submit']);
const typing = (el: EventTarget | null) =>
	el instanceof HTMLElement &&
	(el.isContentEditable || el instanceof HTMLTextAreaElement || (el instanceof HTMLInputElement && !NOT_TEXT.has(el.type)));

export function hideOnType(dock: HTMLElement) {
	const coarse = matchMedia('(pointer: coarse)');
	const set = (on: boolean) => dock.toggleAttribute('data-hidden', on && coarse.matches);
	const focusin = (e: FocusEvent) => set(typing(e.target));
	const focusout = (e: FocusEvent) => set(typing(e.relatedTarget));
	const sync = () => set(typing(document.activeElement));
	document.addEventListener('focusin', focusin);
	document.addEventListener('focusout', focusout);
	coarse.addEventListener('change', sync);
	sync();
	return {
		destroy() {
			document.removeEventListener('focusin', focusin);
			document.removeEventListener('focusout', focusout);
			coarse.removeEventListener('change', sync);
			dock.removeAttribute('data-hidden');
		}
	};
}

// A track that scrolls sideways: the edge that holds more fades and the host draws a chevron in it.
export function cue(track: HTMLElement) {
	const host = track.parentElement as HTMLElement;
	const sync = () => {
		const room = track.scrollWidth - track.clientWidth;
		const start = room > 1 && track.scrollLeft > 1;
		const end = room > 1 && track.scrollLeft < room - 1;
		track.toggleAttribute('data-fade-start', start);
		track.toggleAttribute('data-fade-end', end);
		host.toggleAttribute('data-more-start', start);
		host.toggleAttribute('data-more-end', end);
	};
	sync();
	track.addEventListener('scroll', sync, { passive: true });
	const watch = new ResizeObserver(sync);
	watch.observe(track);
	for (const child of track.children) watch.observe(child);
	return {
		destroy() {
			track.removeEventListener('scroll', sync);
			watch.disconnect();
		}
	};
}

// The same cue for a list that scrolls down: while more follows, the bottom fades and the host draws a chevron in it.
export function cueY(track: HTMLElement) {
	const host = track.parentElement as HTMLElement;
	const sync = () => {
		const more = track.scrollHeight - track.clientHeight - track.scrollTop > 1;
		track.toggleAttribute('data-fade-below', more);
		host.toggleAttribute('data-more-below', more);
	};
	sync();
	track.addEventListener('scroll', sync, { passive: true });
	const watch = new ResizeObserver(sync);
	watch.observe(track);
	for (const child of track.children) watch.observe(child);
	return {
		destroy() {
			track.removeEventListener('scroll', sync);
			watch.disconnect();
		}
	};
}
