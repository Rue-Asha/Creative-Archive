<script lang="ts">
	import { TYPES } from '#lib/entries/config.ts';
	import type { Entry } from '#lib/types.ts';
	import Card from '#lib/ui/Card.svelte';

	let { works }: { works: Entry[] } = $props();
</script>

<section class="works" aria-labelledby="works-title">
	<h2 id="works-title">Works</h2>
	<div class="grid">
		{#each works as work (work.id)}
			<Card
				href="/entries/{work.id}"
				title={work.title}
				image={work.imageId === null ? null : `/images/${work.imageId}`}
				chip={TYPES[work.type].label}
				meta={work.details.year ? String(work.details.year) : undefined}
				tint={null}
				coverId={work.id}
				rating={work.rating}
				shape="square"
			/>
		{/each}
	</div>
</section>

<style>
	.works {
		display: grid;
		gap: var(--s-5);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 160px), 1fr));
		gap: var(--s-4);
	}

	@media (min-width: 1024px) {
		.grid {
			grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		}
	}
</style>
