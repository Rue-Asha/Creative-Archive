<script lang="ts">
	import type { Action } from 'svelte/action';
	import { reveal, stagger } from '#lib/motion.ts';
	import type { Collection } from '#lib/types.ts';
	import ArrowButton from '#lib/ui/ArrowButton.svelte';
	import Collage from '#lib/ui/Collage.svelte';

	let { collections, countAction }: { collections: Collection[]; countAction?: Action<HTMLElement, number> } = $props();

	const counted: Action<HTMLElement, number> = (node, count) => countAction?.(node, count);

	const featured = $derived(collections.find((c) => c.collage.length));
	const cover = $derived(featured?.collage[0] ?? null);
	const tiles = $derived(featured ? [featured, ...collections.filter((c) => c !== featured)] : collections);
</script>

<section class="column collections" data-column aria-label="Collections" use:reveal>
	{#if cover !== null}
		<div class="glow" aria-hidden="true"><img src="/images/{cover}" alt="" /></div>
	{/if}
	<div class="head">
		<h2 data-section-heading>Collections</h2>
		<span class="count tnum" use:counted={collections.length}>{collections.length}</span>
		<a class="see-all" href="/collections">All collections <ArrowButton decorative variant="outline" size="sm" /></a>
	</div>
	<ul class="bento">
		{#each tiles as c, i (c.id)}
			<li class:feature={c === featured} use:reveal={{ delay: stagger(i) }}>
				<a class="collection liquid" data-bento-card href="/collections/{c.id}">
					<div class="collage"><Collage images={c.collage} label="{c.name} collage" /></div>
					<div class="text">
						<h3>{c.name}</h3>
						<span class="tnum"><span data-count-key={c.id} use:counted={c.count}>{c.count}</span> {c.count === 1 ? 'entry' : 'entries'}</span>
					</div>
					{#if c === featured && c.description}<p class="desc">{c.description}</p>{/if}
				</a>
			</li>
		{/each}
	</ul>
</section>

<style>
	.collections {
		position: relative;
		isolation: isolate;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--s-5);
	}

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

	.head {
		display: flex;
		align-items: baseline;
		gap: var(--s-3);
	}

	h2 {
		font-size: var(--t-section);
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

	.see-all {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-block-size: 44px;
		margin-inline-start: auto;
		align-self: center;
		font-size: var(--t-small);
		font-weight: 600;
	}

	.bento {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		grid-auto-rows: 220px;
		gap: var(--s-4);
	}

	.feature {
		grid-column: span 2;
		grid-row: span 2;
	}

	.collection {
		position: relative;
		display: grid;
		grid-template-rows: minmax(0, 1fr) auto;
		block-size: 100%;
		padding: 6px;
		border-radius: var(--r-card);
		transition:
			transform var(--d-base) var(--ease-out),
			box-shadow var(--d-base) var(--ease-out);
	}

	.collection:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-float);
	}

	.collage {
		min-block-size: 0;
		border-radius: var(--r-md);
		overflow: hidden;
	}

	.text {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--s-2);
		padding: var(--s-3) var(--s-3) var(--s-2);
	}

	h3 {
		font-family: var(--font-display);
		font-size: var(--t-display-3);
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.text span {
		flex: none;
		font-size: var(--t-small);
		color: var(--ink-2);
	}

	.desc {
		padding: 0 var(--s-3) var(--s-3);
		color: var(--ink-2);
		font-size: var(--t-small);
	}

	@media (max-width: 1023px) {
		.bento {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			grid-auto-rows: 190px;
			gap: var(--s-3);
		}

		.text {
			flex-direction: column;
			align-items: flex-start;
			gap: 0;
			padding: var(--s-2) var(--s-2) 4px;
		}

		.see-all {
			justify-content: center;
			min-inline-size: 44px;
			font-size: 0;
			gap: 0;
		}
	}
</style>
