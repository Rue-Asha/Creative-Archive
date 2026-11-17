<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { listFor, lists, dataFor } from '../parts/data.ts';
	import ListBody from '../parts/ListBody.svelte';
	import '../parts/wire.css';

	const fx = $derived(dataFor(page.url));
	const data = $derived(listFor('brands-shops', fx));
</script>

<svelte:head><title>Brands & shops (wireframe)</title></svelte:head>

<Frame world="fashion" section="fashion">
	<ListBody def={lists['brands-shops']} entries={data.entries} total={data.total} />
</Frame>
