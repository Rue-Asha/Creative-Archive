<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import { LISTS, listEntries } from '../../list/data.ts';
	import State from '../../shell/State.svelte';
	import { barActions } from '../actions.ts';
	import Sample from '../Sample.svelte';
	import SelectionBar from '../SelectionBar.svelte';
	import Toast from '../Toast.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const albums = $derived(listEntries(LISTS.albums, data).entries.slice(0, 4));
	const brands = $derived(listEntries(LISTS['brands-shops'], data).entries.slice(0, 4));
	const wardrobe = $derived(listEntries(LISTS.wardrobe, data).entries.slice(0, 4));
</script>

<svelte:head><title>Select states · Creative Archive</title></svelte:head>

<Frame world="music" section="music" list="albums">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Music</li><li>Albums</li><li>Select</li></ul>
			<h1>Select <em class="accent-word">states</em></h1>
			<p class="lede">What the selection bar offers for each selection, on the desktop and docked on the phone, and what the toasts say afterwards.</p>
		</div>
	</div>
	<div class="screen-body" data-settle>
		<State label="Nothing selected" note="Actions are disabled, not hidden; Done stays available.">
			<SelectionBar posture="desktop" count={0} actions={barActions(LISTS.albums)} />
			<Sample def={LISTS.albums} entries={albums} />
		</State>
		<State label="One selected" note="Singular count, announced politely. A tap or click toggles one entry; shift-click on the desktop selects the range from the last one toggled.">
			<SelectionBar posture="desktop" count={1} actions={barActions(LISTS.albums)} />
			<Sample def={LISTS.albums} entries={albums} selected={[albums[1]?.id]} />
		</State>
		<State label="Mixed types: Brands & shops" note="Brands, shops and sites have no status, so Set status is absent, not disabled. Tags are offered for every type.">
			<SelectionBar posture="desktop" count={3} actions={barActions(LISTS['brands-shops'])} />
			<Sample def={LISTS['brands-shops']} entries={brands} selected={brands.slice(0, 3).map((e) => e.id)} />
		</State>
		<State label="Wardrobe: all pieces" note="Pieces share one status set (Wishlist, Owned, Gone). Moving a piece off Owned takes it out of Wardrobe on the next load.">
			<SelectionBar posture="desktop" count={2} actions={barActions(LISTS.wardrobe)} />
			<Sample def={LISTS.wardrobe} entries={wardrobe} selected={wardrobe.slice(0, 2).map((e) => e.id)} />
		</State>
		<State label="Phone: docked at the bottom" note="Count, the main action (Set status, else Add tag) and More; Done is the round check. It sits above the safe area and replaces the phone bar while Select is on.">
			<div class="phones">
				<div class="phone-box"><SelectionBar posture="phone" count={4} actions={barActions(LISTS.albums)} /></div>
				<div class="phone-box tall"><SelectionBar posture="phone" count={4} actions={barActions(LISTS.albums)} moreOpen /></div>
				<div class="phone-box"><SelectionBar posture="phone" count={0} actions={barActions(LISTS.albums)} /></div>
				<div class="phone-box"><SelectionBar posture="phone" count={3} actions={barActions(LISTS['brands-shops'])} /></div>
			</div>
		</State>
		<State label="Toasts after an action" note="Past tense, naming the count (status names the action); one request per action, all or nothing.">
			<div class="toasts">
				<Toast message="Status set to Listened for 4 albums" />
				<Toast message="Status set to Listened for 1 album" />
				<Toast message="Tag “autumn” added to 4 albums" />
				<Toast message="Tag “autumn” removed from 2 albums" />
				<Toast message="Couldn’t save — try again" kind="error" />
			</div>
			<p class="hint">On failure every value stays as it was and the selection is kept, so the action can be repeated.</p>
		</State>
	</div>
</Frame>

<style>
	.phones { display: flex; flex-wrap: wrap; gap: var(--space-4); align-items: end; }
	.phone-box { inline-size: min(100%, 22.5rem); }
	.phone-box.tall { padding-block-start: 7rem; }
	.toasts { display: grid; gap: var(--space-2); justify-items: start; }
	.hint { font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-secondary); }
</style>
