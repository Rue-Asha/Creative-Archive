<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import { asKey, entryFor, INFO } from './data.ts';
	import EntryHead from './EntryHead.svelte';
	import EntryMain from './EntryMain.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const kind = $derived(asKey(page.url.searchParams.get('k')));
	const entry = $derived(entryFor(data, kind));
	const info = $derived(INFO[kind]);
</script>

<svelte:head><title>{entry.title} · Creative Archive</title></svelte:head>

<Frame world={info.domain} section={info.domain} list={kind === 'piece' ? 'wardrobe' : undefined}>
	<EntryHead {kind} title={entry.title} artist={kind === 'album' ? (entry.by ?? 'Juno Ashby') : null} worst={data.worst} collections={entry.collections} />
	<div class="screen-body" data-settle>
		<EntryMain {kind} {entry} worst={data.worst} />
	</div>
</Frame>
