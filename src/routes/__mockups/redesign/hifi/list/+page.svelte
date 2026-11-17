<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import { asList, LISTS, listEntries } from './data.ts';
	import ListBody from './ListBody.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const def = $derived(LISTS[asList(page.url.searchParams.get('t'))]);
	const list = $derived(listEntries(def, data));
</script>

<svelte:head><title>{def.name} · Creative Archive</title></svelte:head>

<Frame world={def.domain} section={def.domain} list={def.slug}>
	<ListBody {def} entries={list.entries} total={list.total} worst={data.worst} />
</Frame>
