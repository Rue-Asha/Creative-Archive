<script lang="ts">
	import { initials } from './initials.ts';

	let {
		images,
		label,
		name,
		src = (id: number) => `/images/${id}`
	}: {
		images: number[];
		label: string;
		// the collection's name: its initials fill the plate when there is no image
		name?: string;
		// mockups map their fake ids to fixture photos
		src?: (id: number) => string;
	} = $props();

	const shown = $derived(images.slice(0, 3));
</script>

<div class="collage" data-count={shown.length} role="img" aria-label={label}>
	{#each shown as id, i (i)}
		<img src={src(id)} alt="" loading="lazy" />
	{:else}
		<span class="none" aria-hidden="true">{name ? initials(name) : ''}</span>
	{/each}
</div>

<style>
	.collage {
		display: grid;
		grid-template-columns: 2fr 1fr;
		grid-template-rows: 1fr 1fr;
		gap: var(--space-1);
		inline-size: 100%;
		block-size: 100%;
		min-block-size: 0;
		overflow: hidden;
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
	}

	img {
		display: block;
		inline-size: 100%;
		block-size: 100%;
		min-inline-size: 0;
		min-block-size: 0;
		object-fit: cover;
	}

	img:first-child {
		grid-row: 1 / span 2;
	}

	.collage[data-count='1'] {
		grid-template-columns: 1fr;
	}

	.collage[data-count='2'] img:nth-child(2) {
		grid-row: 1 / span 2;
	}

	.none {
		grid-column: 1 / -1;
		grid-row: 1 / span 2;
		display: grid;
		place-items: center;
		background: var(--surface-plate-1);
		box-shadow: var(--ring-hairline);
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-m-size);
		line-height: 1;
		color: var(--ink-secondary);
	}
</style>
