<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { dataFor, entryFor } from '../../list/parts/data.ts';
	import EditHead from '../../list/parts/EditHead.svelte';
	import FormFields from '../../list/parts/FormFields.svelte';
	import '../../list/parts/wire.css';

	const fx = $derived(dataFor(page.url));
	const entry = $derived(entryFor(fx, 'piece'));
</script>

<svelte:head><title>Edit piece (wireframe)</title></svelte:head>

<Frame world="fashion" section="fashion" plus="inert">
	<EditHead domain="fashion" list="Wardrobe" title={entry.title} word="piece" lede="A piece’s status is part of this form (Wishlist, Owned, Gone); it has no rating and no progress." />
	<div class="screen-body" data-settle>
		<section class="card w-form" data-surface="solid" aria-label="Piece">
			<FormFields kind="piece" mode="edit" prefix="piece" title={entry.title} status="Owned" image="set" tags={['wool', 'autumn']} />
		</section>
	</div>
</Frame>
