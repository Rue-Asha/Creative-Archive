<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { COPY } from '#lib/copy.ts';
	import { DOMAIN_LABEL } from '#lib/domains.ts';
	import { TYPES } from '#lib/entries/config.ts';
	import EntryCard from '#lib/entries/EntryCard.svelte';
	import FilterBar from '#lib/entries/FilterBar.svelte';
	import { statusShelves, toSearchParams, type ListState } from '#lib/entries/query.ts';
	import Shelf from '#lib/entries/Shelf.svelte';
	import { reveal, stagger } from '#lib/motion.ts';
	import Button from '#lib/ui/Button.svelte';
	import Eyebrow from '#lib/ui/Eyebrow.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const config = $derived(TYPES[data.type]);
	// every filter change is a history entry, so Back steps through the filter sets
	function apply(next: ListState) {
		const query = toSearchParams(next).toString();
		goto(query ? `?${query}` : page.url.pathname, { reset: false });
	}

	const shelves = $derived(data.state.view === 'shelves' ? statusShelves(data.type, data.entries) : null);
	const images = $derived(data.entries.flatMap((e) => (e.imageId === null ? [] : [`/images/${e.imageId}`])).slice(0, 4));
</script>

<svelte:head><title>{data.label} · {DOMAIN_LABEL[data.world]} · Creative Archive</title></svelte:head>

<div class="page">
	<header class="column head">
		<Eyebrow parts={[DOMAIN_LABEL[data.world]]} tone="accent" />
		<div class="title-row">
			<h1>{data.label}</h1>
			<span class="count tnum">{data.entries.length}</span>
			{#if data.total}<Button href="/add/{data.type}" variant="accent" class="add">Add</Button>{/if}
		</div>
	</header>

	{#if data.total}
		<div class="column">
			<FilterBar {config} state={data.state} tags={data.tags} fixedStatus={data.fixedStatus} onchange={apply} />
		</div>
	{/if}

	{#if shelves && data.entries.length}
		<div class="shelves">
			{#each shelves as shelf (shelf.key)}<Shelf {shelf} />{/each}
		</div>
	{:else if data.entries.length}
		<section class="column results" aria-label="{data.label} list">
			<div class="glow" aria-hidden="true">
				{#each images as src (src)}<img {src} alt="" />{/each}
			</div>
			<ul class="grid">
				{#each data.entries as entry, i (entry.id)}
					<li use:reveal={{ delay: stagger(i) }}><EntryCard {entry} /></li>
				{/each}
			</ul>
		</section>
	{:else if data.total}
		<section class="column empty" aria-label="No matches">
			<h2>{COPY.nothingMatches}</h2>
			<Button variant="secondary" arrow={false} onclick={() => goto(page.url.pathname, { reset: false })}>{COPY.resetFilters}</Button>
		</section>
	{:else}
		<section class="column empty" aria-label="No entries">
			<h2>No {config.plural.toLowerCase()} yet</h2>
			<p>Add the first one to start the list.</p>
			<Button href="/add/{data.type}" variant="accent">Add</Button>
		</section>
	{/if}
</div>

<style>
	.page {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--s-6);
		padding-block-start: var(--nav-top);
	}

	.head {
		display: grid;
		gap: var(--s-2);
	}

	.title-row {
		display: flex;
		align-items: baseline;
		gap: var(--s-3);
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

	.title-row :global(.add) {
		margin-inline-start: auto;
		align-self: center;
	}

	.results {
		position: relative;
		isolation: isolate;
	}

	/* ambient light: the list's own covers, blurred far behind it */
	.glow {
		position: absolute;
		inset: -12% -6%;
		z-index: -1;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		filter: blur(90px) saturate(1.8);
		opacity: 0.55;
		pointer-events: none;
		mask-image: radial-gradient(closest-side, white 40%, transparent);
	}

	.glow img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		align-items: end;
		gap: var(--s-4) var(--s-3);
	}

	.shelves {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--s-8);
	}

	.empty {
		display: grid;
		justify-items: start;
		gap: var(--s-3);
		padding-block: var(--s-8);
	}

	.empty h2 {
		font-size: var(--t-display-2);
	}

	.empty p {
		color: var(--ink-2);
	}

	@media (min-width: 640px) {
		.grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: var(--s-6) var(--s-4);
		}
	}

	@media (min-width: 1024px) {
		.grid {
			grid-template-columns: repeat(5, minmax(0, 1fr));
		}
	}
</style>
