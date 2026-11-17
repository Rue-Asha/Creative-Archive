<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { listFor, lists, dataFor } from '../list/parts/data.ts';
	import ListBody from '../list/parts/ListBody.svelte';
	import '../list/parts/wire.css';

	const fx = $derived(dataFor(page.url));
	const data = $derived(listFor('albums', fx));
	const picked = $derived(data.entries.slice(2, 6).map((e) => e.id));
</script>

<svelte:head><title>Albums, Select mode (wireframe)</title></svelte:head>

<Frame world="music" section="music">
	<ListBody
		def={lists.albums}
		entries={data.entries}
		total={data.total}
		select={{ selected: picked, note: 'Shift-click on the sixth album selected the range from the last one toggled (3 to 6). A tap or click toggles one entry; Escape or Done leaves Select mode and entries open again. The bar stays under the head while the list scrolls.' }}
	/>
</Frame>
