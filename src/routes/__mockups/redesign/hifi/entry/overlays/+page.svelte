<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import Icon from '../../shell/Icon.svelte';
	import State from '../../shell/State.svelte';
	import Dialog from '../../add/Dialog.svelte';
	import { entryFor } from '../data.ts';
	import CollectionMenu from '../CollectionMenu.svelte';
	import MenuButton from '../MenuButton.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const title = $derived(entryFor(data, 'album').title);
	const id = 'nc';
	const collections = $derived(data.collections.map((c) => c.name));
	const statuses = ['No status', 'Want to listen', 'Listening', 'Listened', 'Dropped'];
</script>

<svelte:head><title>Entry menus and dialogs · Creative Archive</title></svelte:head>

<Frame world="music" section="music">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Music</li><li>Albums</li></ul>
			<h1>Entry <em class="accent-word">menus</em></h1>
			<p class="lede">Status, Add to collection and Delete as they open from the entry page.</p>
		</div>
	</div>
	<div class="screen-body" data-settle>
		<State label="Status menu" note="Exactly one row checked; the options are the domain’s labels plus No status. Arrows, Home, End, Escape; focus returns to the button.">
			<MenuButton label="Status: Listening" menuLabel="Status" shown>
				{#each statuses as s (s)}<button type="button" class="menu-item" role="menuitemradio" aria-checked={s === 'Listening'}><Icon name="check" size={16} />{s}</button>{/each}
			</MenuButton>
		</State>
		<State label="Add to collection" note="Every collection with a check for those holding this entry; a row toggles membership at once. New collection asks for a name.">
			<MenuButton label="Add to collection" menuLabel="Add to collection" shown>
				{#snippet lead()}<Icon name="plus" size={16} />{/snippet}
				<CollectionMenu {collections} />
			</MenuButton>
		</State>
		<State label="New collection" note="Creates the collection and adds this entry at once.">
			<Dialog title="New collection">
				<div class="field pill invalid">
					<label for="{id}-n">Name</label>
					<div class="control"><input id="{id}-n" type="text" value="" aria-invalid="true" aria-describedby="{id}-e" /></div>
					<p class="error" id="{id}-e" role="alert"><Icon name="alert" size={14} />Name is required</p>
				</div>
				{#snippet actions()}
					<button type="button" class="btn secondary" data-press>Cancel</button>
					<button type="button" class="btn primary arrow" data-press data-focus="halo">Create<span class="circle" aria-hidden="true"><Icon name="arrow" size={18} /></span></button>
				{/snippet}
			</Dialog>
		</State>
		<State label="Delete this album?" note="Never the page’s primary action. Cancel has the focus, Escape cancels, focus returns to Delete. Brands and shops say “Delete this shop?” by Kind.">
			<Dialog title="Delete this album?" alert>
				<strong lang={data.worst ? 'ja' : undefined}>{title}</strong>
				<p>It leaves your collections and its history goes with it.</p>
				{#snippet actions()}
					<button type="button" class="btn secondary" data-focus="halo" data-press>Cancel</button>
					<button type="button" class="btn danger" data-press><Icon name="trash" size={16} />Delete</button>
				{/snippet}
			</Dialog>
		</State>
	</div>
</Frame>
