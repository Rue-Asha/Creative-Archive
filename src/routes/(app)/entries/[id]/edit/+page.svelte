<script lang="ts">
	import { TYPES } from '#lib/entries/config.ts';
	import EntryForm from '#lib/entries/EntryForm.svelte';
	import FormHead from '#lib/entries/FormHead.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const config = $derived(TYPES[data.type]);
	const word = $derived(data.type === 'brand' || data.type === 'site' ? 'brand or shop' : config.label.toLowerCase());
	const lede = $derived(
		config.status === 'media'
			? 'Status, rating and progress stay on the entry page. Cancel returns to the entry.'
			: 'Change what you stored. Cancel returns to the entry.'
	);
</script>

<svelte:head>
	<title>Edit {data.heading} · Creative Archive</title>
</svelte:head>

<FormHead type={data.type} last={data.heading} lastHref="/entries/{data.id}" head="Edit" {word} {lede} />

<div class="screen-body">
	{#key data.id}
		<EntryForm
			type={data.type}
			values={data.values}
			errors={form?.errors}
			artists={data.artists}
			tags={data.tags}
			action="?/save"
			mode="edit"
			cancelHref="/entries/{data.id}"
		/>
	{/key}
</div>
