<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { listFor, lists, dataFor } from './parts/data.ts';
	import ListBody from './parts/ListBody.svelte';
	import './parts/wire.css';

	const fx = $derived(dataFor(page.url));
	const data = $derived(listFor('albums', fx));
</script>

<svelte:head><title>Albums (wireframe)</title></svelte:head>

<Frame world="music" section="music">
	<ListBody def={lists.albums} entries={data.entries} total={data.total} />
</Frame>
