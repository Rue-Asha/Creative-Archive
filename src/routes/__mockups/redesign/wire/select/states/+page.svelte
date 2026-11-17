<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { listFor, lists, dataFor } from '../../list/parts/data.ts';
	import Panel from '../../list/parts/Panel.svelte';
	import Results from '../../list/parts/Results.svelte';
	import SelectionBar from '../../list/parts/SelectionBar.svelte';
	import Toast from '../../list/parts/Toast.svelte';
	import '../../list/parts/wire.css';

	const fx = $derived(dataFor(page.url));
	const albums = $derived(listFor('albums', fx));
	const brands = $derived(listFor('brands-shops', fx));
	const wardrobe = $derived(listFor('wardrobe', fx));
	const few = <T,>(list: T[]) => list.slice(0, 4);
</script>

<svelte:head><title>Select mode states (wireframe)</title></svelte:head>

<Frame world="music" section="music">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Music</li><li>Albums</li><li>Select</li></ul>
			<h1>Select <em class="accent-word">states</em></h1>
			<p class="lede">What the selection bar offers for each selection, and what the toasts say afterwards.</p>
		</div>
	</div>
	<div class="screen-body w-gallery">
		<Panel title="Nothing selected" note="Actions are disabled, not hidden; Done stays available">
			<div class="w-stack">
				<SelectionBar count={0} />
				<Results def={lists.albums} entries={few(albums.entries)} total={4} selectable hint={false} />
			</div>
		</Panel>
		<Panel title="One selected" note="Singular wording; the count is announced politely">
			<div class="w-stack">
				<SelectionBar count={1} />
				<Results def={lists.albums} entries={few(albums.entries)} total={4} selectable selected={[2]} hint={false} />
			</div>
		</Panel>
		<Panel title="Mixed types: Brands and shops" note="Brands, shops and sites have no status, so Set status is absent, not disabled. Tags are offered for every type">
			<div class="w-stack">
				<SelectionBar count={3} canStatus={false} />
				<Results def={lists['brands-shops']} entries={few(brands.entries)} total={4} selectable selected={[1, 2, 3]} hint={false} />
			</div>
		</Panel>
		<Panel title="Wardrobe: all pieces" note="Pieces share one status set (Wishlist, Owned, Gone); moving a piece off Owned takes it out of Wardrobe on the next load">
			<div class="w-stack">
				<SelectionBar count={2} />
				<Results def={lists.wardrobe} entries={few(wardrobe.entries)} total={4} selectable selected={[1, 2]} hint={false} />
			</div>
		</Panel>
		<Panel title="Toasts after an action" note="Past tense, naming the count; one request per action, all or nothing" wide>
			<div class="w-stack">
				<Toast message="4 albums updated" />
				<Toast message="1 album updated" />
				<Toast message="Tag “autumn” added to 4 albums" />
				<Toast message="Tag “autumn” removed from 2 albums" />
				<Toast message="Couldn’t save — try again" kind="error" />
				<p class="w-hint">On failure every value stays as it was and the selection is kept, so the action can be repeated.</p>
			</div>
		</Panel>
	</div>
</Frame>
