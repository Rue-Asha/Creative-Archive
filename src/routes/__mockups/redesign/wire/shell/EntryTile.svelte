<script lang="ts">
	import type { MockEntry } from '../../fixtures.ts';
	import Cover from './Cover.svelte';
	import { base, kindLabel, progressText, ratingText, statusLabel } from './data.ts';
	import Icon from './Icon.svelte';

	let { entry, steps = false, noImage = false }: { entry: MockEntry; steps?: boolean; noImage?: boolean } = $props();

	const status = $derived(statusLabel(entry));
	const rating = $derived(ratingText(entry.rating));
	const progress = $derived(progressText(entry));
</script>

<li class="tile">
	<a class="open" href="{base}/wire/entry" title={entry.title}>
		<Cover title={entry.title} image={!noImage && entry.cover !== null} />
		<span class="title" dir="auto">{entry.title}</span>
		<span class="meta" dir="auto">{kindLabel(entry.kind)}{entry.by ? ` · ${entry.by}` : ''}</span>
		{#if status || rating}<span class="meta">{[status, rating].filter(Boolean).join(' · ')}</span>{/if}
	</a>
	{#if steps && progress}
		<div class="steps" role="group" aria-label="Progress">
			<button type="button" class="fw-icon s" aria-label="One less"><Icon name="minus" size={16} /></button>
			<span class="value">{progress}</span>
			<button type="button" class="fw-icon s" aria-label="One more"><Icon name="plus" size={16} /></button>
		</div>
	{/if}
</li>

<style>
	.tile { display: grid; align-content: start; gap: var(--space-2); inline-size: var(--tile-width, 9.5rem); flex: none; min-inline-size: 0; }
	.open { display: grid; gap: var(--space-1); color: inherit; text-decoration: none; min-inline-size: 0; }
	.open :global(.cover) { margin-block-end: var(--space-1); }
	.title { font-size: var(--type-title-size); line-height: var(--type-title-line); font-weight: var(--type-title-weight); overflow-wrap: anywhere; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; }
	.meta { font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-muted); overflow-wrap: anywhere; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; }
	.steps { display: flex; align-items: center; justify-content: space-between; gap: var(--space-1); }
	.value { flex: 1; min-inline-size: 0; text-align: center; font-size: var(--type-caption-size); line-height: var(--type-caption-line); font-variant-numeric: var(--numeric-figures); overflow-wrap: anywhere; }
</style>
