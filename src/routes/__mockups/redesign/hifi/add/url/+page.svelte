<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import { nested } from '../../list/data.ts';
	import Crumbs from '../Crumbs.svelte';
	import FormCard from '../FormCard.svelte';
	import UrlStep from '../UrlStep.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const url = $derived(data.worst ? `https://example.com/${'long-product-path-'.repeat(8)}` : 'https://example.com/studio-nicholson/wool-overshirt');
</script>

<svelte:head><title>Add piece, URL preview · Creative Archive</title></svelte:head>

<Frame world="fashion" section="fashion" list="wardrobe" plus="inert">
	<Crumbs kind="piece" last="Add" worst={data.worst} head="Add" word="piece" lede="Paste a page link for a picture and a name, or fill the form by hand. Opened from Wardrobe, so Status starts on Owned." />
	<div class="screen-body" data-settle>
		<UrlStep mode="found" {url} />
		<FormCard kind="piece" title="Wool overshirt" status="Owned" preview cancelHref={nested('list', data.worst, 'd=fashion&t=wardrobe')} worst={data.worst} />
	</div>
</Frame>
