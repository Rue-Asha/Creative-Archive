<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import { nested, LISTS } from '../list/data.ts';
	import CatalogueStep from './CatalogueStep.svelte';
	import Crumbs from './Crumbs.svelte';
	import { asType, resultsFor, TYPES } from './data.ts';
	import FormCard from './FormCard.svelte';
	import UrlStep from './UrlStep.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const kind = $derived(asType(page.url.searchParams.get('type')));
	const info = $derived(TYPES[kind]);
	const fromStatus = $derived(page.url.searchParams.get('status') === 'owned' ? 'Owned' : undefined);
	const cancel = $derived(nested('list', data.worst, `d=${info.domain}&t=${info.list}`));
	const ratio = $derived(LISTS[info.list].ratio);
</script>

<svelte:head><title>Add {info.word} · Creative Archive</title></svelte:head>

<Frame world={info.domain} section={info.domain} plus="inert">
	<Crumbs {kind} last="Add" worst={data.worst} head="Add" word={info.word} lede={info.lede} />
	<div class="screen-body" data-settle>
		{#if info.entry === 'catalogue'}
			<CatalogueStep noun={info.word} type={kind} query={data.worst ? 'tōkyō' : 'kintsugi'} results={resultsFor(kind, data.worst)} worst={data.worst} {ratio} />
		{:else}
			{#if info.entry === 'url'}<UrlStep />{/if}
			<FormCard {kind} cancelHref={cancel} status={fromStatus} worst={data.worst} />
		{/if}
	</div>
</Frame>
