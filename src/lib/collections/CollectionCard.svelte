<script lang="ts">
	import type { Collection } from '#lib/types.ts';
	import Collage from '#lib/ui/Collage.svelte';

	let { collection }: { collection: Collection } = $props();
</script>

<article class="card" data-collection-card>
	<div class="art"><Collage images={collection.collage} label="{collection.name} collage" /></div>
	<div class="foot">
		<h3><a href="/collections/{collection.id}">{collection.name}</a></h3>
		<span class="count tnum" data-count aria-label="{collection.count} {collection.count === 1 ? 'entry' : 'entries'}">{collection.count}</span>
	</div>
</article>

<style>
	.card {
		position: relative;
		display: grid;
		gap: var(--s-3);
		transition: transform var(--d-base) var(--ease-out);
	}

	.art {
		aspect-ratio: 4 / 3;
		border-radius: var(--r-card);
		overflow: hidden;
		box-shadow: var(--shadow-card);
		transition: box-shadow var(--d-base) var(--ease-out);
	}

	.foot {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--s-3);
		padding-inline: var(--s-1);
	}

	h3 {
		font-size: 16px;
		font-weight: 600;
		line-height: 1.25;
		overflow-wrap: anywhere;
	}

	h3 a::after {
		content: '';
		position: absolute;
		inset: 0;
	}

	.count {
		flex: none;
		font-size: var(--t-small);
		font-weight: 600;
		color: var(--ink-2);
		padding: 2px 10px;
		border-radius: var(--r-pill);
		background: var(--accent-wash);
	}

	.card:has(a:focus-visible) .art {
		box-shadow: var(--focus-ring);
	}

	@media (hover: hover) and (pointer: fine) {
		.card:hover {
			transform: translateY(-4px);
		}

		.card:hover .art {
			box-shadow: var(--shadow-float);
		}
	}
</style>
