<script lang="ts">
	import type { Collection } from '#lib/types.ts';
	import Collage from '#lib/ui/Collage.svelte';

	let { collection }: { collection: Collection } = $props();
</script>

<article class="card" data-surface="solid" data-collection-card data-press>
	<div class="art"><Collage images={collection.collage} name={collection.name} label="{collection.name} collage" /></div>
	<div class="foot">
		<h3><a href="/collections/{collection.id}">{collection.name}</a></h3>
		<span class="count" data-count aria-label="{collection.count} {collection.count === 1 ? 'entry' : 'entries'}">{collection.count}</span>
	</div>
</article>

<style>
	.card {
		position: relative;
		display: grid;
		gap: var(--space-3);
		align-content: start;
		min-inline-size: 0;
		padding: var(--space-3);
	}

	.art {
		aspect-ratio: 4 / 3;
	}

	.foot {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
		padding-inline: var(--space-1);
	}

	h3 {
		min-inline-size: 0;
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		font-weight: var(--type-title-weight);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}

	h3 a {
		color: var(--ink);
		text-decoration: none;
	}

	h3 a::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: var(--radius-card);
	}

	h3 a:focus-visible {
		outline: 0;
	}

	h3 a:focus-visible::after {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}

	.count {
		flex: none;
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
		font-variant-numeric: var(--numeric-figures);
	}

	@media (hover: hover) and (pointer: fine) {
		.card:has(h3 a:hover) {
			background: var(--surface-raised);
		}
	}
</style>
