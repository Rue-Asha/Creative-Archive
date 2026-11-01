<script lang="ts">
	import { DOMAIN_LABEL } from '#lib/domains.ts';
	import AddMenu from '#lib/domains/AddMenu.svelte';
	import SubTabs from '#lib/domains/SubTabs.svelte';
	import Shelf from '#lib/entries/Shelf.svelte';
	import { reveal } from '#lib/motion.ts';
	import PhotoHero from '#lib/shell/PhotoHero.svelte';
	import Eyebrow from '#lib/ui/Eyebrow.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>{DOMAIN_LABEL[data.world]} · Creative Archive</title></svelte:head>

<PhotoHero image={data.hero} world={data.world}>
	<div class="head">
		<Eyebrow parts={['Domain']} tone="photo" />
		<h1>{DOMAIN_LABEL[data.world]}</h1>
	</div>
	<div class="actions">
		<SubTabs domain={data.world} />
		<AddMenu domain={data.world} />
	</div>
</PhotoHero>

<div class="shelves">
	{#each data.shelves as shelf (shelf.key)}
		<div use:reveal><Shelf {shelf} /></div>
	{/each}
</div>

<style>
	.head {
		display: grid;
		gap: var(--s-2);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-4);
	}

	.shelves {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--s-8);
		padding-block: var(--s-8);
	}
</style>
