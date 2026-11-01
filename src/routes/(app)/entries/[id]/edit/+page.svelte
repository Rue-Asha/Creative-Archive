<script lang="ts">
	import { DOMAIN_LABEL } from '#lib/domains.ts';
	import { TYPES } from '#lib/entries/config.ts';
	import EntryForm from '#lib/entries/EntryForm.svelte';
	import Eyebrow from '#lib/ui/Eyebrow.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const config = $derived(TYPES[data.type]);
</script>

<svelte:head>
	<title>Edit {data.heading} · Creative Archive</title>
</svelte:head>

<div class="column page" data-column>
	<header data-page-header>
		<Eyebrow parts={[DOMAIN_LABEL[config.domain], 'Edit']} tone="accent" />
		<h1>Edit <em>{config.label.toLowerCase()}</em></h1>
	</header>

	{#key data.id}
		<EntryForm
			type={data.type}
			values={data.values}
			errors={form?.errors}
			artists={data.artists}
			tags={data.tags}
			action="?/save"
			cancelHref="/entries/{data.id}"
		/>
	{/key}
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--s-7);
		padding-block-start: var(--nav-top);
	}

	h1 {
		margin-block-start: var(--s-3);
	}
</style>
