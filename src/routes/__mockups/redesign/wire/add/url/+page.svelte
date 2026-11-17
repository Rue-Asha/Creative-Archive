<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import AddHead from '../../list/parts/AddHead.svelte';
	import { dataFor } from '../../list/parts/data.ts';
	import FormFields from '../../list/parts/FormFields.svelte';
	import UrlStep from '../../list/parts/UrlStep.svelte';
	import '../../list/parts/wire.css';

	const fx = $derived(dataFor(page.url));
</script>

<svelte:head><title>Add piece, URL preview (wireframe)</title></svelte:head>

<Frame world="fashion" section="fashion" plus="inert">
	<AddHead domain="fashion" list="Wardrobe" word="piece" lede="Paste a page link for a picture and a name, or fill the form by hand. Opened from Wardrobe, so Status starts on Owned." />
	<div class="screen-body" data-settle>
		<UrlStep mode="found" url={fx.worst ? `https://example.com/${'long-product-path-'.repeat(8)}` : 'https://example.com/studio-nicholson/wool-overshirt'} />
		<section class="card w-form" data-surface="solid" aria-label="Piece">
			<FormFields kind="piece" prefix="url" title="Wool overshirt" status="Owned" preview tags={[]} />
		</section>
	</div>
</Frame>
