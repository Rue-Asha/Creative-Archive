<script lang="ts">
	import { onMount } from 'svelte';
	import type { Action } from 'svelte/action';
	import { reducedMotion, reveal, stagger } from '#lib/motion.ts';
	import type { ShelfData } from '#lib/types.ts';
	import ArrowButton from '#lib/ui/ArrowButton.svelte';
	import RoundNav from '#lib/ui/RoundNav.svelte';
	import { dragScroll } from './dragScroll.ts';
	import EntryCard from './EntryCard.svelte';

	let { shelf, accent, countAction }: { shelf: ShelfData; accent?: string; countAction?: Action<HTMLElement, number> } = $props();

	// the count's own action is Home's count-up; every other shelf shows the number as it is
	const counted: Action<HTMLElement, number> = (node, count) => countAction?.(node, count);

	// a shelf mixing shapes (Home's "In progress") shows them all as portrait cards
	const shape = $derived(new Set(shelf.entries.map((e) => e.type)).size > 1 ? ('portrait' as const) : undefined);
	const cover = $derived(shelf.entries.find((e) => e.imageId !== null)?.imageId ?? null);

	let row: HTMLElement;
	let canPrev = $state(false);
	let canNext = $state(false);

	function measure() {
		canPrev = row.scrollLeft > 1;
		canNext = row.scrollLeft + row.clientWidth < row.scrollWidth - 1;
	}

	function page(direction: 1 | -1) {
		row.scrollBy({ left: direction * row.clientWidth * 0.85, behavior: reducedMotion() ? 'auto' : 'smooth' });
	}

	onMount(() => {
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(row);
		return () => observer.disconnect();
	});
</script>

<section class="shelf" data-shelf={shelf.key} aria-label={accent ? `${shelf.title} · ${accent}` : shelf.title}>
	{#if cover !== null}
		<div class="glow" aria-hidden="true"><img src="/images/{cover}" alt="" /></div>
	{/if}
	<div class="column shelf-head" data-shelf-head>
		<h2 data-section-heading>
			{shelf.title}{#if accent}<span class="dot-sep" aria-hidden="true">·</span><em>{accent}</em>{/if}
		</h2>
		<span class="count tnum" use:counted={shelf.count}>{shelf.count}</span>
		<div class="tools">
			{#if shelf.href}
				<a class="see-all" href={shelf.href}>See all <ArrowButton decorative variant="outline" size="sm" /></a>
			{/if}
			<div class="arrows">
				<RoundNav prevLabel="Scroll left" nextLabel="Scroll right" prevDisabled={!canPrev} nextDisabled={!canNext} onprev={() => page(-1)} onnext={() => page(1)} />
			</div>
		</div>
	</div>
	<div class="column shelf-row-wrap">
		<ul class="shelf-row" data-shelf-row bind:this={row} onscroll={measure} use:dragScroll>
			{#each shelf.entries as entry, i (entry.id)}
				<li use:reveal={{ delay: stagger(i) }}><EntryCard {entry} {shape} /></li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.shelf {
		position: relative;
		isolation: isolate;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--s-5);
	}

	/* ambient light: the shelf's first cover, blurred far behind it */
	.glow {
		position: absolute;
		inset: -20% -4%;
		z-index: -1;
		filter: blur(90px) saturate(1.2);
		opacity: 0.55;
		pointer-events: none;
		mask-image: var(--glow-mask);
	}

	.glow img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.shelf-head {
		display: flex;
		align-items: baseline;
		gap: var(--s-3);
	}

	h2 {
		font-size: var(--t-section);
	}

	h2 em {
		font-style: var(--accent-style);
	}

	.dot-sep {
		margin-inline: 0.25em;
		color: var(--ink-2);
	}

	.count {
		font-size: var(--t-small);
		font-weight: 600;
		color: var(--ink-2);
		padding: 2px 10px;
		border-radius: var(--r-pill);
		background: var(--accent-wash);
		translate: 0 -4px;
	}

	.tools {
		display: flex;
		align-items: center;
		gap: var(--s-4);
		margin-inline-start: auto;
		align-self: center;
	}

	.see-all {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-block-size: 44px;
		font-size: var(--t-small);
		font-weight: 600;
	}

	.arrows {
		display: none;
	}

	/* room for a card's hover lift and shadow inside the scrolling row */
	.shelf-row {
		display: flex;
		gap: var(--s-4);
		overflow-x: auto;
		padding-block: 8px 20px;
		margin-block: -8px -20px;
		scrollbar-width: none;
		overscroll-behavior-x: contain;
	}

	.shelf-row li {
		flex: 0 0 calc((100% - 5 * var(--s-4)) / 6);
	}

	@media (hover: hover) and (pointer: fine) {
		.shelf-row {
			cursor: grab;
		}
	}

	@media (min-width: 1024px) {
		.arrows {
			display: block;
		}

		/* the heading stays under the nav while its row scrolls past */
		.shelf-head {
			position: sticky;
			inset-block-start: calc(var(--nav-top) - var(--s-3));
			z-index: 2;
			isolation: isolate;
		}

		.shelf-head::before {
			content: '';
			position: absolute;
			inset: -10px -20px;
			z-index: -1;
			border-radius: var(--r-pill);
			background: var(--grain), var(--glass-strong);
			backdrop-filter: var(--glass-filter);
			border: 1px solid var(--glass-border);
			box-shadow: var(--glass-rim);
		}
	}

	@media (max-width: 1023px) {
		/* shelves bleed to the right viewport edge on phone */
		.shelf-row-wrap {
			inline-size: auto;
			margin-inline: var(--gutter) 0;
		}

		.shelf-row {
			gap: var(--s-3);
			scroll-snap-type: x mandatory;
			padding-inline-end: var(--gutter);
		}

		.shelf-row li {
			flex: 0 0 168px;
			scroll-snap-align: start;
		}

		.see-all {
			justify-content: center;
			min-inline-size: 44px;
			font-size: 0;
			gap: 0;
		}
	}
</style>
