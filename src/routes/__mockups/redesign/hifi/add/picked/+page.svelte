<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import { nested } from '../../list/data.ts';
	import Crumbs from '../Crumbs.svelte';
	import { asType, LONG, TYPES } from '../data.ts';
	import FormCard from '../FormCard.svelte';
	import Picked from '../Picked.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const kind = $derived(asType(page.url.searchParams.get('type')));
	const info = $derived(TYPES[kind]);
	const title = $derived(data.worst ? LONG : 'Kintsugi Summer');
</script>

<svelte:head><title>Add {info.word}, picked · Creative Archive</title></svelte:head>

<Frame world={info.domain} section={info.domain} plus="inert">
	<Crumbs {kind} last="Add" worst={data.worst} head="Add" word={info.word} lede="The form is filled from the result and stays fully editable." />
	<div class="screen-body" data-settle>
		<Picked {title} by="Juno Ashby" year={2019} type={kind} artist={kind === 'album' || kind === 'song'} worst={data.worst} />
		<FormCard {kind} {title} cancelHref={nested('list', data.worst, `d=${info.domain}&t=${info.list}`)} worst={data.worst} tags={['favourite']} />
	</div>
</Frame>
