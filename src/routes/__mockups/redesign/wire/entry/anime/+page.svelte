<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { dataFor, entryFor } from '../../list/parts/data.ts';
	import EntryBody from '../../list/parts/EntryBody.svelte';
	import '../../list/parts/wire.css';

	const fx = $derived(dataFor(page.url));
	const entry = $derived(entryFor(fx, 'anime'));
</script>

<svelte:head><title>Anime entry (wireframe)</title></svelte:head>

<Frame world="animanga" section="animanga">
	<EntryBody kind="anime" entry={{ ...entry, status: 'doing' }} />
</Frame>
