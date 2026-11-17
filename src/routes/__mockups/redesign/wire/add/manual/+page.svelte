<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import AddHead from '../../list/parts/AddHead.svelte';
	import { dataFor } from '../../list/parts/data.ts';
	import FormFields from '../../list/parts/FormFields.svelte';
	import '../../list/parts/wire.css';

	const fx = $derived(dataFor(page.url));
</script>

<svelte:head><title>Add anime, manual (wireframe)</title></svelte:head>

<Frame world="animanga" section="animanga" plus="inert">
	<AddHead domain="animanga" list="Anime" word="anime" lede="Typed by hand (manual=1). Status starts on No status, or on the value in ?status=." />
	<div class="screen-body" data-settle>
		<section class="card w-form" data-surface="solid" aria-label="Anime">
			<FormFields kind="anime" prefix="manual" tags={fx.worst ? fx.tags.slice(0, 14).map((t) => t.name) : []} />
		</section>
	</div>
</Frame>
