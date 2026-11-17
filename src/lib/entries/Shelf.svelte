<script lang="ts">
	import { onMount } from 'svelte';
	import type { Action } from 'svelte/action';
	import { reducedMotion } from '#lib/motion.ts';
	import Button from '#lib/components/button/Button.svelte';
	import { COPY, withCount } from '#lib/copy.ts';
	import type { EntryType, ShelfData } from '#lib/types.ts';
	import { TYPES } from './config.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import { dragScroll } from './dragScroll.ts';
	import EntryCard from './EntryCard.svelte';

	let {
		shelf,
		accent,
		countAction,
		variant = 'card',
		level = 2,
		typed = false
	}: {
		shelf: ShelfData;
		accent?: string;
		countAction?: Action<HTMLElement, number>;
		// a solid card of its own (the list's Shelves view) or a ruled heading inside a card the page provides (Home)
		variant?: 'card' | 'ruled';
		// h2 on its own; h3 under a section's h2 (Home's "Recently added"), and the cards go a level below it
		level?: 2 | 3;
		// a shelf gathering several types (Home, a domain's In progress) names each card's type
		typed?: boolean;
	} = $props();

	// the count's own action is Home's count-up; every other shelf shows the number as it is
	const counted: Action<HTMLElement, number> = (node, count) => countAction?.(node, count);

	// a sub-type shelf counts in its own noun ("14 albums") unless the noun has no plural of its own (Anime, Manga); every
	// other shelf counts in entries. The number is its own span (Home counts it up), so only the words come from the copy.
	const type = $derived(shelf.key in TYPES ? TYPES[shelf.key as EntryType] : null);
	const noun = $derived.by(() => {
		const own = type && type.plural !== type.label;
		const text = own ? COPY.typeCount.replace('{type}', (shelf.count === 1 ? type.label : type.plural).toLowerCase()) : COPY.entryCount;
		return withCount(text, shelf.count).replace(/^\d+ /, '');
	});

	// a shelf mixing shapes (Home's "In progress") shows them all as portrait cards
	const shape = $derived(new Set(shelf.entries.map((e) => e.type)).size > 1 ? ('portrait' as const) : undefined);

	let row: HTMLElement;
	let canPrev = $state(false);
	let canNext = $state(false);

	function measure() {
		canPrev = row.scrollLeft > 1;
		canNext = row.scrollLeft + row.clientWidth < row.scrollWidth - 1;
	}

	function page(direction: 1 | -1) {
		row.scrollBy({ left: direction * row.clientWidth * 0.8, behavior: reducedMotion() ? 'auto' : 'smooth' });
	}

	onMount(() => {
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(row);
		return () => observer.disconnect();
	});
</script>

<section
	class="shelf"
	class:card={variant === 'card'}
	data-surface={variant === 'card' ? 'solid' : undefined}
	data-shelf={shelf.key}
	aria-label={accent ? `${shelf.title} · ${accent}` : shelf.title}
>
	<header class:card-head={variant === 'card'} data-shelf-head>
		<svelte:element this={`h${level}`} class="heading" class:ruled={variant === 'ruled'} data-section-heading>
			{shelf.title}{#if accent}<span class="dot-sep" aria-hidden="true">·</span><em class="accent-word">{accent}</em>{/if}
		</svelte:element>
		<span class="card-note"><span use:counted={shelf.count}>{shelf.count}</span> {noun}</span>
		<span class="tools">
			{#if shelf.href}<Button size="xs" href={shelf.href}>See all<Icon name="arrow-right" size={16} /></Button>{/if}
			<span class="step">
				<Button icon size="xs" label="Scroll left" disabled={!canPrev} onclick={() => page(-1)}><Icon name="chevron-left" size={16} /></Button>
				<Button icon size="xs" label="Scroll right" disabled={!canNext} onclick={() => page(1)}><Icon name="chevron-right" size={16} /></Button>
			</span>
		</span>
	</header>
	<ul class="track" data-shelf-row bind:this={row} onscroll={measure} use:dragScroll>
		{#each shelf.entries as entry (entry.id)}
			<li><EntryCard {entry} {shape} {typed} level={level === 2 ? 3 : 4} /></li>
		{/each}
	</ul>
</section>

<style>
	.shelf {
		display: grid;
		gap: var(--space-3);
		min-inline-size: 0;
	}

	.shelf.card {
		gap: var(--space-4);
		padding: var(--space-5);
	}

	header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-1-5) var(--space-3);
		min-inline-size: 0;
	}

	.heading {
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}

	.dot-sep {
		margin-inline: 0.25em;
		color: var(--ink-secondary);
	}

	.tools {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
		margin-inline-start: auto;
	}

	.step {
		display: flex;
		gap: var(--space-2);
	}

	.track {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 10rem;
		gap: var(--space-3);
		margin: 0;
		padding: 0 0 var(--space-1);
		list-style: none;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		scrollbar-width: thin;
		scrollbar-color: var(--edge-control) transparent;
	}

	.track > li {
		display: grid;
		min-inline-size: 0;
		scroll-snap-align: start;
	}

	@media (hover: hover) and (pointer: fine) {
		.track {
			cursor: grab;
		}
	}

	@media (max-width: 1023px) {
		.track {
			scroll-snap-type: x proximity;
			scroll-padding-inline: var(--space-1);
		}
	}

	@media (max-width: 767px) {
		.shelf.card {
			padding: var(--space-3);
		}

		.track {
			grid-auto-columns: 10.5rem;
			gap: var(--space-2-5);
		}
	}
</style>
