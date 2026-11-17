<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { dataFor, entryFor } from '../list/parts/data.ts';
	import EditHead from '../list/parts/EditHead.svelte';
	import FormFields from '../list/parts/FormFields.svelte';
	import '../list/parts/wire.css';

	const fx = $derived(dataFor(page.url));
	const entry = $derived(entryFor(fx, 'album'));
</script>

<svelte:head><title>Edit album (wireframe)</title></svelte:head>

<Frame world="music" section="music" plus="inert">
	<EditHead domain="music" list="Albums" title={entry.title} word="album" lede="Status, rating and progress stay on the entry page. Cancel returns to the entry." />
	<div class="screen-body" data-settle>
		<section class="card w-form" data-surface="solid" aria-label="Album">
			<FormFields kind="album" mode="edit" prefix="edit" title={entry.title} image="set" artistLinked tags={fx.worst ? fx.tags.slice(0, 40).map((t) => t.name) : ['favourite', 'autumn', 'quiet']} />
		</section>
	</div>
</Frame>
