<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import { href } from '../../shell/data.ts';
	import Crumbs from '../../add/Crumbs.svelte';
	import FormCard from '../../add/FormCard.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const entry = $derived(href('entry', data.worst, 'k=piece'));
</script>

<svelte:head><title>Wool overshirt · Edit · Creative Archive</title></svelte:head>

<Frame world="fashion" section="fashion" list="wardrobe" plus="inert">
	<Crumbs kind="piece" last="Wool overshirt" lastHref={entry} worst={data.worst} head="Edit" word="piece" lede="A piece’s status is part of this form (Wishlist, Owned, Gone); it has no rating and no progress." />
	<div class="screen-body" data-settle>
		<FormCard kind="piece" mode="edit" title="Wool overshirt" status="Owned" image="set" cancelHref={entry} worst={data.worst} tags={['wool', 'autumn']} />
	</div>
</Frame>
