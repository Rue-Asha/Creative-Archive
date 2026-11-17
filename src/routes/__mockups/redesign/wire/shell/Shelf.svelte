<script lang="ts">
	import type { MockEntry } from '../../fixtures.ts';
	import { base, entries as entriesText } from './data.ts';
	import EntryTile from './EntryTile.svelte';
	import Icon from './Icon.svelte';

	type Props = {
		title: string;
		count?: number;
		list?: MockEntry[];
		seeAll?: string;
		steps?: boolean;
		noImages?: boolean;
		level?: 'h2' | 'h3';
	};
	let { title, count, list = [], seeAll, steps = false, noImages = false, level = 'h2' }: Props = $props();

	let track = $state<HTMLUListElement>();
	let atStart = $state(true);
	let atEnd = $state(false);

	function edges() {
		if (!track) return;
		atStart = track.scrollLeft <= 1;
		atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
	}
	const step = (dir: -1 | 1) => track?.scrollBy({ left: dir * track.clientWidth * 0.8 });
	$effect(() => {
		edges();
	});
	const id = $props.id();
</script>

<section class="shelf" aria-labelledby="shelf-{id}">
	<header>
		<svelte:element this={level} id="shelf-{id}">{title}</svelte:element>
		{#if count !== undefined}<span class="fw-note">{entriesText(count)}</span>{/if}
		<span class="tools">
			{#if seeAll}<a class="see-all fw-chip" href="{base}/{seeAll}">See all<Icon name="arrow" size={16} /></a>{/if}
			<button type="button" class="fw-icon s" aria-label="Scroll left" disabled={atStart} onclick={() => step(-1)}><Icon name="left" size={18} /></button>
			<button type="button" class="fw-icon s" aria-label="Scroll right" disabled={atEnd} onclick={() => step(1)}><Icon name="right" size={18} /></button>
		</span>
	</header>
	<ul bind:this={track} class="track" onscroll={edges}>
		{#each list as entry (entry.id)}
			<EntryTile {entry} {steps} noImage={noImages} />
		{/each}
	</ul>
</section>

<style>
	.shelf { display: grid; gap: var(--space-3); min-inline-size: 0; }
	header { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-1-5) var(--space-4); min-inline-size: 0; }
	header > :global(:is(h2, h3)) { font-size: var(--type-display-s-size); line-height: var(--type-display-s-line); letter-spacing: var(--type-display-s-tracking); overflow-wrap: anywhere; min-inline-size: 0; }
	.tools { display: flex; align-items: center; gap: var(--space-2); margin-inline-start: auto; }
	.track { display: flex; gap: var(--space-4); margin: 0; padding: 0 0 var(--space-2); list-style: none; overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x proximity; }
	.track > :global(li) { scroll-snap-align: start; }
</style>
