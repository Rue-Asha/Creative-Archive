<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import { nested } from '../../list/data.ts';
	import Crumbs from '../Crumbs.svelte';
	import { asType, TYPES } from '../data.ts';
	import FormCard from '../FormCard.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const kind = $derived(asType(page.url.searchParams.get('type'), 'anime'));
	const info = $derived(TYPES[kind]);
</script>

<svelte:head><title>Add {info.word}, by hand · Creative Archive</title></svelte:head>

<Frame world={info.domain} section={info.domain} plus="inert">
	<Crumbs {kind} last="Add" worst={data.worst} head="Add" word={info.word} lede="Typed by hand (manual=1). Status starts on No status, or on the value in ?status=." />
	<div class="screen-body" data-settle>
		<FormCard {kind} cancelHref={nested('list', data.worst, `d=${info.domain}&t=${info.list}`)} worst={data.worst} tags={data.worst ? data.tags.slice(0, 14).map((t) => t.name) : []} />
	</div>
</Frame>
