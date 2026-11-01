<script lang="ts">
	import Icon from './Icon.svelte';

	let {
		images,
		label,
		src = (id: number) => `/images/${id}`
	}: {
		images: number[];
		label: string;
		// mockups map their fake ids to fixture photos
		src?: (id: number) => string;
	} = $props();

	const shown = $derived(images.slice(0, 3));
</script>

<div class="collage n{shown.length}" role="img" aria-label={label}>
	{#each shown as id, i (i)}
		<img src={src(id)} alt="" loading="lazy" />
	{:else}
		<span class="empty a"></span>
		<span class="empty b"></span>
		<span class="empty c"><Icon name="collections" size={22} /></span>
	{/each}
</div>

<style>
	.collage {
		display: grid;
		grid-template-columns: 2fr 1fr;
		grid-template-rows: 1fr 1fr;
		gap: 3px;
		inline-size: 100%;
		block-size: 100%;
		min-block-size: 0;
		overflow: hidden;
		border-radius: inherit;
		background: var(--surface-2);
	}

	img,
	.empty {
		inline-size: 100%;
		block-size: 100%;
		min-block-size: 0;
		object-fit: cover;
	}

	.collage > :first-child {
		grid-row: span 2;
	}

	.n1 > :first-child {
		grid-column: span 2;
	}

	.n2 > :nth-child(2) {
		grid-row: span 2;
	}

	.empty {
		display: grid;
		place-items: center;
		background: var(--accent-soft);
		color: var(--accent);
	}

	.b {
		background: var(--accent-wash);
	}

	.c {
		background: var(--surface-2);
	}
</style>
