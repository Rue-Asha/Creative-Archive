<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import AddHead from '../../list/parts/AddHead.svelte';
	import { dataFor } from '../../list/parts/data.ts';
	import FormFields from '../../list/parts/FormFields.svelte';
	import Picked from '../../list/parts/Picked.svelte';
	import '../../list/parts/wire.css';

	const fx = $derived(dataFor(page.url));
	const long = $derived(fx.worst ? 'The Extraordinarily Long Title That Never Quite Ends And Keeps Going '.repeat(3).slice(0, 180) : 'Kintsugi Summer');
</script>

<svelte:head><title>Add album, picked result (wireframe)</title></svelte:head>

<Frame world="music" section="music" plus="inert">
	<AddHead domain="music" list="Albums" word="album" lede="The form is filled from the result and stays fully editable." />
	<div class="screen-body" data-settle>
		<Picked title="Kintsugi Summer" by="Juno Ashby" year={2019} />
		<section class="card w-form" data-surface="solid" aria-label="Album">
			<FormFields kind="album" prefix="picked" title={long} tags={[]} />
		</section>
	</div>
</Frame>
