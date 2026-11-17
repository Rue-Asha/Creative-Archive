<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { base, dataFor, entryFor } from '../../list/parts/data.ts';
	import EntryMain from '../../list/parts/EntryMain.svelte';
	import Panel from '../../list/parts/Panel.svelte';
	import Toast from '../../list/parts/Toast.svelte';
	import '../../list/parts/wire.css';

	const fx = $derived(dataFor(page.url));
	const magazine = $derived(entryFor(fx, 'magazine'));
	const bare = $derived({ ...entryFor(fx, 'album'), cover: null, rating: null, status: null, tags: [], notes: null, collections: [] });
	const artist = $derived({ ...entryFor(fx, 'artist'), works: [] });
</script>

<svelte:head><title>Entry states (wireframe)</title></svelte:head>

<Frame world="music" section="music">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Music</li><li>Entries</li></ul>
			<h1>Entry <em class="accent-word">states</em></h1>
			<p class="lede">Types without controls, a bare entry, an artist without works, failed saves and a missing entry.</p>
		</div>
	</div>
	<div class="screen-body w-gallery">
		<Panel title="Magazine: no status, rating or progress" note="Brands, shops, influencers, magazines and looks show fields and tags only" wide>
			<EntryMain kind="magazine" entry={magazine} />
		</Panel>
		<Panel title="Bare album: no cover, unrated, no tags, no note" note="Initials plate instead of a cover; “–” in the rating; empty groups are left out" wide>
			<EntryMain kind="album" entry={bare} />
		</Panel>
		<Panel title="Artist with no works" note="The Works group stays and says what fills it" wide>
			<EntryMain kind="artist" entry={artist} />
		</Panel>
		<Panel title="A save fails" note="Status, rating, progress and collection changes show at once; on failure the toast says so and the control returns to the server’s value">
			<div class="w-stack">
				<Toast message="Couldn’t save — try again" kind="error" />
				<Toast message="Deleted" />
			</div>
		</Panel>
		<Panel title="Unknown entry (404)" note="A non-numeric or unknown id answers 404">
			<section class="card w-empty" data-surface="solid" aria-labelledby="nf-h">
				<h2 id="nf-h">Entry not found</h2>
				<p>It may have been deleted. Go back to the list to pick another.</p>
				<a class="w-btn" href="{base}/list">Back to Albums</a>
			</section>
		</Panel>
	</div>
</Frame>
