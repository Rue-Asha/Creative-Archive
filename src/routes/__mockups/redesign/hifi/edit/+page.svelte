<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import { href } from '../shell/data.ts';
	import Crumbs from '../add/Crumbs.svelte';
	import { LONG } from '../add/data.ts';
	import FormCard from '../add/FormCard.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const title = $derived(data.worst ? LONG : 'Kintsugi Summer');
	const short = $derived(title.length > 28 ? `${title.slice(0, 26).trimEnd()}…` : title);
	const entry = $derived(href('entry', data.worst));
</script>

<svelte:head><title>{title} · Edit · Creative Archive</title></svelte:head>

<Frame world="music" section="music" plus="inert">
	<Crumbs kind="album" last={short} lastHref={entry} worst={data.worst} head="Edit" word="album" lede="Status, rating and progress stay on the entry page. Cancel returns to the entry." />
	<div class="screen-body" data-settle>
		<FormCard kind="album" mode="edit" {title} image="set" artistLinked cancelHref={entry} worst={data.worst} tags={data.worst ? data.tags.slice(0, 40).map((t) => t.name) : ['favourite', 'autumn', 'quiet']} />
	</div>
</Frame>
