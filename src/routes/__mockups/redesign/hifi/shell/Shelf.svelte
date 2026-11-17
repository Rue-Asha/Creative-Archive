<script lang="ts">
	import type { MockEntry } from '../../fixtures.ts';
	import EntryTile from './EntryTile.svelte';
	import Icon from './Icon.svelte';
	import { plural } from './data.ts';

	type Props = {
		title: string;
		count?: number;
		list?: MockEntry[];
		seeAll?: string;
		noun?: [string, string];
		steps?: boolean;
		noImages?: boolean;
		ratio?: string;
		worst?: boolean;
		showKind?: boolean;
		level?: 'h2' | 'h3';
		heading?: 'card' | 'ruled';
	};
	let { title, count, list = [], seeAll, noun = ['entry', 'entries'], steps = false, noImages = false, ratio = '3 / 4', worst = false, showKind = true, level = 'h3', heading = 'ruled' }: Props = $props();

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

<section class="shelf" class:card={heading === 'card'} data-surface={heading === 'card' ? 'solid' : undefined} aria-labelledby="shelf-{id}">
	<header class:card-head={heading === 'card'}>
		<svelte:element this={level} id="shelf-{id}" class={heading === 'ruled' ? 'ruled' : undefined}>{title}</svelte:element>
		{#if count !== undefined}<span class="card-note">{plural(count, noun[0], noun[1])}</span>{/if}
		<span class="tools">
			{#if seeAll}<a class="btn secondary s" href={seeAll} data-press>See all<Icon name="arrow" size={16} /></a>{/if}
			<span class="step">
				<button type="button" class="btn icon s" aria-label="Scroll left" disabled={atStart} data-press="round" onclick={() => step(-1)}><Icon name="left" /></button>
				<button type="button" class="btn icon s" aria-label="Scroll right" disabled={atEnd} data-press="round" onclick={() => step(1)}><Icon name="right" /></button>
			</span>
		</span>
	</header>
	<ul bind:this={track} class="track" onscroll={edges} style:--tile-ratio={ratio}>
		{#each list as entry (entry.id)}
			<EntryTile {entry} {worst} {steps} {ratio} {showKind} noImage={noImages} />
		{/each}
	</ul>
</section>

<style>
	.shelf { display: grid; gap: var(--space-3); min-inline-size: 0; }
	.shelf.card { gap: var(--space-4); padding: var(--space-5); }
	header { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-1-5) var(--space-3); min-inline-size: 0; }
	header > :global(:is(.ruled, h2)) { overflow-wrap: anywhere; min-inline-size: 0; }
	.tools { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); margin-inline-start: auto; }
	.step { display: flex; gap: var(--space-2); }
	.btn.icon.s, .btn.s { --h: max(var(--control-height-xs), var(--target)); }
	.btn.s { padding-inline: var(--space-3-5); }
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
		scroll-snap-type: x proximity;
		scroll-padding-inline: var(--space-1);
		scrollbar-width: thin;
		scrollbar-color: var(--edge-control) transparent;
	}
	@media (max-width: 767px) {
		.track { grid-auto-columns: 8.25rem; gap: var(--space-2-5); }
	}
</style>
