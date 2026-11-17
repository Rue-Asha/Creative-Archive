<script lang="ts">
	import { tick } from 'svelte';
	import Button from '#lib/components/button/Button.svelte';
	import Menu from '#lib/components/menu/Menu.svelte';
	import { glide } from '#lib/motion.ts';
	import type { Selection } from '#lib/select/selection.svelte.ts';
	import type { Entry } from '#lib/types.ts';
	import { initials } from '#lib/ui/initials.ts';

	type Props = {
		entries: Entry[];
		typeLabels: Record<number, string>;
		selection: Selection;
		onmove: (from: number, to: number) => void;
		onremove: (entry: Entry) => void;
	};

	let { entries, typeLabels, selection, onmove, onremove }: Props = $props();

	const uid = $props.id();
	const digits = $derived(Math.max(2, String(entries.length).length));
	const pos = (i: number) => String(i + 1).padStart(digits, '0');

	const maker = (e: Entry) => {
		const d = e.details;
		if (e.type === 'album' || e.type === 'song') return e.artistName;
		if (e.type === 'book') return d.authors?.join(', ');
		if (e.type === 'piece') return d.brand;
		return undefined;
	};
	const meta = (e: Entry) => [typeLabels[e.id], maker(e)].filter(Boolean).join(' · ');

	// A keyed move re-inserts the row, which drops focus: put it back on the control that had it. A first or last row
	// has only one of the two Move buttons, so the other one stands in.
	// the row's new place, said politely: focus stays on the Move button, so nothing else tells a screen reader it moved
	// A retry after a reverted move says the same words, and an unchanged text isn't read again: the region is emptied
	// and refilled a beat later, so the empty state reaches the accessibility tree in between. Only the last move speaks.
	let said = $state('');
	let saying = 0;
	function announce(entry: Entry, to: number) {
		const text = `${entry.title} moved to ${to + 1} of ${entries.length}`;
		const n = ++saying;
		said = '';
		setTimeout(() => {
			if (n === saying) said = text;
		}, 100);
	}

	async function move(from: number, to: number, kind: 'up' | 'down' | 'menu') {
		const id = entries[from].id;
		announce(entries[from], to);
		onmove(from, to);
		await tick();
		const find = (key: string) => document.querySelector<HTMLElement>(`[data-key="${key}"]`);
		const opposite = kind === 'up' ? 'down' : 'up';
		(kind === 'menu' ? find(`actions-${id}`) : (find(`${kind}-${id}`) ?? find(`${opposite}-${id}`)))?.focus();
	}

	function closeMenu(event: Event) {
		(event.currentTarget as HTMLElement).closest<HTMLElement>('[popover]')?.hidePopover();
	}

	// Drag by the handle (a fine pointer only): the row follows the pointer with transform, a drop line shows where it lands.
	let dragFrom = $state(-1);
	let dragTo = $state(-1);
	let dy = $state(0);
	let startY = 0;
	let rects: DOMRect[] = [];

	function grab(event: PointerEvent, i: number) {
		if (event.button !== 0 || dragFrom >= 0) return;
		const handle = event.currentTarget as HTMLElement;
		rects = [...handle.closest('ol')!.querySelectorAll<HTMLElement>(':scope > li')].map((row) => row.getBoundingClientRect());
		handle.setPointerCapture(event.pointerId);
		startY = event.clientY;
		dragFrom = dragTo = i;
		dy = 0;
	}
	function drag(event: PointerEvent) {
		if (dragFrom < 0) return;
		dy = event.clientY - startY;
		const mid = rects[dragFrom].top + rects[dragFrom].height / 2 + dy;
		dragTo = rects.filter((r, j) => j !== dragFrom && r.top + r.height / 2 < mid).length;
	}
	function drop() {
		if (dragFrom < 0) return;
		const [from, to] = [dragFrom, dragTo];
		dragFrom = dragTo = -1;
		dy = 0;
		if (from === to) return;
		announce(entries[from], to);
		onmove(from, to);
	}
	const edge = (i: number) => (dragFrom < 0 || dragTo === dragFrom || i !== dragTo ? undefined : dragTo < dragFrom ? 'before' : 'after');

	// rows glide to their new places after a pointer move; a keyboard move jumps (it repeats fast and must keep up)
	let pointer = $state(false);

	function onkeydown(event: KeyboardEvent) {
		pointer = false;
		if (event.key !== 'Escape' || dragFrom < 0) return;
		event.preventDefault();
		dragFrom = dragTo = -1;
		dy = 0;
	}
</script>

<svelte:window {onkeydown} onpointerdown={() => (pointer = true)} />

{#snippet thumb(entry: Entry)}
	{#if entry.imageId !== null}
		<img class="thumb" src="/images/{entry.imageId}" alt="" loading="lazy" />
	{:else}
		<span class="thumb plate" aria-hidden="true">{initials(entry.title)}</span>
	{/if}
{/snippet}

<ol class="rows" class:dragging={dragFrom >= 0} class:solo={entries.length < 2} style:--digits={digits}>
	{#each entries as entry, i (entry.id)}
		{@const on = selection.ids.has(entry.id)}
		<li class="item" animate:glide={pointer} class:on class:lifted={dragFrom === i} data-drop={edge(i)} style:transform={dragFrom === i ? `translateY(${dy}px)` : undefined}>
			{#if selection.active}
				<button type="button" class="pick" data-pick aria-pressed={on} aria-labelledby="{uid}-t{entry.id}" aria-describedby="{uid}-m{entry.id}" onclick={(e) => selection.toggle(entry.id, { range: e.shiftKey })}>
					<span class="check" aria-hidden="true">
						{#if on}<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>{/if}
					</span>
					<span class="position"><span class="sr-only">Position </span>{pos(i)}</span>
					{@render thumb(entry)}
					<span class="text">
						<span class="title" id="{uid}-t{entry.id}">{entry.title}</span>
						<span class="meta" id="{uid}-m{entry.id}">{meta(entry)}</span>
					</span>
				</button>
			{:else}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<span class="grip" data-grip aria-hidden="true" onpointerdown={(e) => grab(e, i)} onpointermove={drag} onpointerup={drop} onpointercancel={drop}>
					<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" /></svg>
				</span>
				<span class="position"><span class="sr-only">Position </span>{pos(i)}<span class="of"><span class="sr-only"> of </span><span class="slash" aria-hidden="true">/</span>{String(entries.length).padStart(digits, '0')}</span></span>
				{@render thumb(entry)}
				<span class="text">
					<a class="title" href="/entries/{entry.id}">{entry.title}</a>
					<span class="meta">{meta(entry)}</span>
				</span>
				<span class="moves">
					{#if i > 0}
						<Button variant="quiet" size="s" icon label="Move {entry.title} up" data-key="up-{entry.id}" onclick={() => move(i, i - 1, 'up')}>
							<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
						</Button>
					{:else}<span class="gap" aria-hidden="true"></span>{/if}
					{#if i < entries.length - 1}
						<Button variant="quiet" size="s" icon label="Move {entry.title} down" data-key="down-{entry.id}" onclick={() => move(i, i + 1, 'down')}>
							<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
						</Button>
					{:else}<span class="gap" aria-hidden="true"></span>{/if}
					<Button variant="quiet" size="s" icon label="Remove {entry.title}" onclick={() => onremove(entry)}>
						<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5" /></svg>
					</Button>
				</span>
				<span class="slot">
					<Button variant="secondary" size="s" icon label="Actions for {entry.title}" data-key="actions-{entry.id}" popovertarget="{uid}-m-{entry.id}" aria-haspopup="menu">
						<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><circle cx="5.5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="18.5" cy="12" r="1.6" /></svg>
					</Button>
					<Menu id="{uid}-m-{entry.id}" name="Actions for {entry.title}" align="end">
						{#if i > 0}<button type="button" class="menu-item" role="menuitem" tabindex="-1" onclick={(e) => (closeMenu(e), move(i, i - 1, 'menu'))}>Move up</button>{/if}
						{#if i < entries.length - 1}<button type="button" class="menu-item" role="menuitem" tabindex="-1" onclick={(e) => (closeMenu(e), move(i, i + 1, 'menu'))}>Move down</button>{/if}
						<div class="menu-rule" role="separator"></div>
						<button type="button" class="menu-item" role="menuitem" tabindex="-1" onclick={(e) => (closeMenu(e), onremove(entry))}>Remove</button>
					</Menu>
				</span>
			{/if}
		</li>
	{/each}
</ol>
<p class="sr-only" aria-live="polite">{said}</p>

<style>
	.rows {
		display: grid;
		gap: var(--space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.item {
		--thumb: var(--space-12);
		position: relative;
		display: grid;
		grid-template-columns: auto auto minmax(0, 1fr) auto;
		grid-template-areas: 'pos thumb text slot';
		align-items: center;
		gap: var(--space-3);
		min-block-size: var(--target-touch);
		padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
		min-inline-size: 0;
	}
	/* picked is the charcoal ring inside the edge, a fill and the filled check; focus is the ring outside the edge */
	.item.on {
		outline: var(--stroke-strong) solid var(--ink);
		outline-offset: calc(-1 * var(--stroke-strong));
		background: var(--selection);
	}
	.position {
		grid-area: pos;
		color: var(--ink);
		font-variant-numeric: var(--numeric-figures);
		min-inline-size: calc(var(--digits) * 2ch + 3ch);
	}
	.position :global(.slash) {
		margin-inline: 0.45em;
	}
	.thumb {
		grid-area: thumb;
		display: grid;
		place-items: center;
		inline-size: var(--thumb);
		block-size: var(--thumb);
		border-radius: var(--radius-round);
		object-fit: cover;
		background: var(--surface-raised);
	}
	.plate {
		color: var(--ink-secondary);
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-title-size);
	}
	.text {
		grid-area: text;
		display: grid;
		gap: var(--space-0-5);
		min-inline-size: 0;
	}
	.title {
		min-block-size: var(--target);
		color: var(--ink);
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		font-weight: var(--type-title-weight);
		text-decoration: none;
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}
	a.title {
		justify-self: start;
		max-inline-size: 100%;
	}
	@media (hover: hover) {
		a.title:hover {
			text-decoration: underline;
			text-underline-offset: 0.2em;
		}
	}
	.meta {
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.slot {
		grid-area: slot;
		display: flex;
		align-items: center;
	}
	.moves {
		grid-area: slot;
		display: none;
		align-items: center;
	}
	.gap {
		display: block;
		flex: none;
		inline-size: max(var(--control-height-s), var(--target));
	}
	.grip {
		grid-area: grip;
		display: none;
		place-items: center;
		color: var(--ink-secondary);
		cursor: grab;
		touch-action: none;
	}

	.pick {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: auto auto auto minmax(0, 1fr);
		align-items: center;
		gap: var(--space-3);
		min-block-size: var(--target-touch);
		margin: calc(-1 * var(--space-2)) calc(-1 * var(--space-2)) calc(-1 * var(--space-2)) calc(-1 * var(--space-3));
		padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
		border: 0;
		border-radius: var(--radius-panel);
		background: transparent;
		color: var(--ink);
		text-align: start;
		min-inline-size: 0;
	}
	.pick .position,
	.pick .thumb,
	.pick .text {
		grid-area: auto;
	}
	.pick .position {
		min-inline-size: calc(var(--digits) * 1ch);
	}
	.check {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: var(--space-6);
		block-size: var(--space-6);
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
	}
	.on .check {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
		box-shadow: none;
	}
	.on .title {
		color: var(--accent-text);
	}
	@media (hover: hover) {
		.item:not(.on):has(.pick:hover) {
			background: var(--surface-hover);
		}
	}

	.item.lifted {
		z-index: var(--z-raised);
		background: var(--surface-raised);
		box-shadow: var(--shadow-lift);
		cursor: grabbing;
	}
	.item[data-drop]::after {
		content: '';
		position: absolute;
		inset-inline: 0;
		block-size: var(--stroke-strong);
		border-radius: var(--radius-pill);
		background: var(--surface-inverse);
	}
	.item[data-drop='before']::after {
		inset-block-start: calc(-1 * var(--space-1) / 2 - var(--stroke-strong) / 2);
	}
	.item[data-drop='after']::after {
		inset-block-end: calc(-1 * var(--space-1) / 2 - var(--stroke-strong) / 2);
	}
	.rows.dragging {
		user-select: none;
		-webkit-user-select: none;
	}

	/* the drag handle shows on a fine pointer only; Move up and Move down are the keyboard and touch way */
	@media (pointer: fine) {
		.item:not(:has(.pick)) {
			grid-template-columns: auto auto auto minmax(0, 1fr) auto;
			grid-template-areas: 'grip pos thumb text slot';
		}
		.grip {
			display: grid;
		}
		.solo .item:not(:has(.pick)) {
			grid-template-columns: auto auto minmax(0, 1fr) auto;
			grid-template-areas: 'pos thumb text slot';
		}
		.solo .grip {
			display: none;
		}
	}
	@media (min-width: 1024px) {
		.moves {
			display: flex;
		}
		.slot {
			display: none;
		}
	}
	@media (max-width: 767px) {
		.position {
			min-inline-size: calc(var(--digits) * 1ch);
		}
		.position :global(.of) {
			display: none;
		}
		.item {
			--thumb: var(--space-10);
			gap: var(--space-2-5);
		}
	}
</style>
