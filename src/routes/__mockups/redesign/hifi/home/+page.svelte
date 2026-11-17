<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import { homeView } from './data.ts';
	import HomeBody from './HomeBody.svelte';
	import HomeHead from './HomeHead.svelte';

	const view = $derived(homeView(mockData(new URL(page.url.href))));
</script>

<svelte:head><title>Creative Archive</title></svelte:head>

<Frame world="home" section="home">
	<HomeHead {view} />
	<HomeBody {view} settle />
</Frame>
