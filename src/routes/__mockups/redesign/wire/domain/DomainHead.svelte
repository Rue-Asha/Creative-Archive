<script lang="ts">
	import { fmt } from '../shell/data.ts';
	import Head from '../shell/Head.svelte';
	import AddMenu from './AddMenu.svelte';
	import type { DomainView } from './data.ts';

	let { view, menu = false }: { view: DomainView; menu?: boolean } = $props();
	const facts = $derived({
		caption: 'Whole domain',
		items: [
			{ n: fmt(view.total), label: view.total === 1 ? 'Entry' : 'Entries' },
			...(view.media ? [{ n: fmt(view.inProgressCount), label: 'In progress' }] : []),
			{ n: fmt(view.subTypes.length), label: view.subTypes.length === 1 ? 'Sub-type' : 'Sub-types' }
		]
	});
</script>

{#snippet actions()}<AddMenu domain={view.d} open={menu} inline={menu} />{/snippet}

<Head kicker={['Domain']} lede={view.lede} hero={view.hero} {facts} {actions}>
	{#snippet title()}<em class="accent-word">{view.label}</em>{/snippet}
</Head>
