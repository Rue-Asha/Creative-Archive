<script lang="ts">
	import EntryCard from '#lib/entries/EntryCard.svelte';
	import { rise } from '#lib/motion.ts';
	import type { Entry } from '#lib/types.ts';
	import Counter from '#lib/ui/Counter.svelte';
	import RoundNav from '#lib/ui/RoundNav.svelte';
	import { coverflowState, dragPosition, place, swipeStep } from './coverflow.ts';

	let { entries }: { entries: Entry[] } = $props();

	const DRAG_PX = 120;

	let index = $state(0);
	const flow = $derived(coverflowState(index, entries.length));
	const current = $derived(flow.index);
	let dx = $state<number | null>(null);
	const position = $derived(dx === null ? current : dragPosition(current, dx, DRAG_PX, entries.length));

	let stage: HTMLDivElement;
	let pointer: { id: number; x: number; y: number; horizontal: boolean | null } | null = null;
	let swiped = false;

	function go(by: number) {
		const refocus = stage.contains(document.activeElement) && document.activeElement !== stage;
		index = coverflowState(current, entries.length, by).index;
		if (refocus) stage.focus();
	}

	function keydown(e: KeyboardEvent) {
		if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
		e.preventDefault();
		go(e.key === 'ArrowRight' ? 1 : -1);
	}

	// touch and pen swipe; a mouse has the arrows and keys
	function pointerdown(e: PointerEvent) {
		// a touch pan fires no click, so a swipe's flag must not outlive it
		swiped = false;
		if (e.pointerType === 'mouse' || !flow.arrows) return;
		pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, horizontal: null };
	}

	function pointermove(e: PointerEvent) {
		if (!pointer || e.pointerId !== pointer.id) return;
		const mx = e.clientX - pointer.x;
		const my = e.clientY - pointer.y;
		if (pointer.horizontal === null && Math.max(Math.abs(mx), Math.abs(my)) > 8) {
			pointer.horizontal = Math.abs(mx) > Math.abs(my);
			if (pointer.horizontal) stage.setPointerCapture(e.pointerId);
		}
		if (pointer.horizontal) dx = mx;
		else if (pointer.horizontal === false) pointer = null;
	}

	function pointerup(e: PointerEvent) {
		if (!pointer || e.pointerId !== pointer.id) return;
		if (dx !== null) {
			const landed = Math.round(position);
			go(landed !== current ? landed - current : swipeStep(dx));
			swiped = true;
		}
		cancel();
	}

	function cancel() {
		pointer = null;
		dx = null;
	}

	// a card beside the centre one steps the flow; only the centre card opens its entry
	function click(e: MouseEvent, i: number) {
		if (swiped) {
			swiped = false;
			e.preventDefault();
		} else if (i !== current) {
			e.preventDefault();
			go(i - current);
		}
	}
</script>

<section class="coverflow" data-coverflow aria-label="Latest additions">
	<p class="visually-hidden" aria-live="polite">{entries[current]?.title}, {flow.label}</p>

	<!-- the stage is the carousel's keyboard and swipe surface -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
	<div
		class="stage"
		class:dragging={dx !== null}
		data-coverflow-stage
		role="group"
		aria-roledescription="carousel"
		aria-label="Latest entries"
		tabindex="0"
		bind:this={stage}
		onkeydown={keydown}
		onpointerdown={pointerdown}
		onpointermove={pointermove}
		onpointerup={pointerup}
		onpointercancel={cancel}
	>
		{#each entries as entry, i (entry.id)}
			{@const p = place(i, position)}
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
			<div
				class="item"
				role="group"
				aria-roledescription="slide"
				aria-label={entry.title}
				aria-current={i === current ? 'true' : undefined}
				data-coverflow-card
				data-active={i === current ? '' : undefined}
				style="--x: {p.x}%; --z: {p.z}px; --r: {p.rotate}deg; --s: {p.scale}; --o: {p.fade}; z-index: {p.layer}"
				onclick={(e) => click(e, i)}
			>
				<div inert={i !== current}><EntryCard {entry} shape="portrait" /></div>
			</div>
		{/each}
	</div>

	<div class="controls">
		{#key current}<span class="tick" in:rise={{ y: 6 }}><Counter index={current + 1} total={entries.length} tone="photo" /></span>{/key}
		{#if flow.arrows}
			<RoundNav
				prevLabel="Previous entry"
				nextLabel="Next entry"
				prevDisabled={!flow.canPrev}
				nextDisabled={!flow.canNext}
				onprev={() => go(-1)}
				onnext={() => go(1)}
			/>
		{/if}
	</div>
</section>

<style>
	.coverflow {
		display: grid;
		justify-items: center;
		gap: var(--s-5);
		min-inline-size: 0;
	}

	.stage {
		position: relative;
		inline-size: 100%;
		block-size: 400px;
		perspective: 1400px;
		transform-style: preserve-3d;
		border-radius: var(--r-card);
		touch-action: pan-y;
		-webkit-user-select: none;
		user-select: none;
		-webkit-touch-callout: none;
	}

	.item {
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: calc(50% - 130px);
		inline-size: 260px;
		opacity: var(--o);
		transform: translateX(var(--x)) translateZ(var(--z)) rotateY(var(--r)) scale(var(--s));
		transition:
			transform var(--d-glide) var(--ease-out),
			opacity var(--d-slow) var(--ease-out);
	}

	.dragging .item {
		transition: none;
	}

	.item :global([data-card]) {
		box-shadow: var(--shadow-float);
	}

	.controls {
		display: flex;
		align-items: center;
		gap: var(--s-5);
	}

	.controls :global(.arrow.outline) {
		border-color: var(--glass-border);
		background: var(--glass);
		backdrop-filter: var(--glass-filter);
	}

	@media (prefers-reduced-motion: reduce) {
		.item {
			transform: translateX(var(--x)) scale(var(--s));
			transition: none;
		}
	}

	@media (max-width: 1023px) {
		.stage {
			block-size: 300px;
		}

		.item {
			inset-inline-start: calc(50% - 95px);
			inline-size: 190px;
		}
	}
</style>
