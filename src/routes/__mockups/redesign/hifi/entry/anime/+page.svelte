<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import { entryFor } from '../data.ts';
	import EntryHead from '../EntryHead.svelte';
	import EntryMain from '../EntryMain.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const entry = $derived(entryFor(data, 'anime'));
</script>

<svelte:head><title>{entry.title} · Creative Archive</title></svelte:head>

<Frame world="animanga" section="animanga">
	<EntryHead kind="anime" title={entry.title} artist={null} worst={data.worst} collections={entry.collections} />
	<div class="screen-body" data-settle>
		<EntryMain kind="anime" entry={{ ...entry, status: 'doing' }} worst={data.worst} />
	</div>
</Frame>
