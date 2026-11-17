<script lang="ts">
	import ListRow from '#lib/components/list-row/ListRow.svelte';
	import { TYPES } from '#lib/entries/config.ts';
	import type { Entry } from '#lib/types.ts';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';

	let { works }: { works: Entry[] } = $props();
</script>

<section class="card works" data-surface="solid" aria-labelledby="works-title">
	<div class="card-head">
		<h2 id="works-title">Works</h2>
		<span class="card-note">{works.length === 1 ? '1 work' : `${works.length} works`}</span>
	</div>
	{#if works.length}
		<ul class="list">
			{#each works as work (work.id)}
				{@const year = work.details.year ? ` · ${work.details.year}` : ''}
				<li>
					<ListRow
						href="/entries/{work.id}"
						title={work.title}
						meta="{TYPES[work.type].label}{year}"
						value={work.rating === null ? undefined : `${work.rating} / 10`}
					>
						{#snippet leading()}
							{#if work.imageId !== null}<img src="/images/{work.imageId}" alt="" />{:else}<ImagePlaceholder title={work.title} />{/if}
						{/snippet}
					</ListRow>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="hint">No works yet. Albums and songs linked to this artist appear here.</p>
	{/if}
</section>

<style>
	.works {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-5);
		min-inline-size: 0;
	}

	.list {
		display: grid;
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.list :global(.leading) {
		inline-size: 3.5rem;
		aspect-ratio: 1;
		overflow: hidden;
		border-radius: var(--radius-text);
	}

	.list img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.hint {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}
</style>
