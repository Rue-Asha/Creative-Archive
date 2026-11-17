<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import State from '../../shell/State.svelte';
	import { href } from '../../shell/data.ts';
	import { nested } from '../../list/data.ts';
	import Toast from '../../select/Toast.svelte';
	import { entryFor } from '../data.ts';
	import EntryMain from '../EntryMain.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const worst = $derived(data.worst);
	const magazine = $derived(entryFor(data, 'magazine'));
	const bare = $derived({ ...entryFor(data, 'album'), cover: null, rating: null, status: null, tags: [], notes: null, collections: [] });
	const artist = $derived({ ...entryFor(data, 'artist'), works: [] });
</script>

<svelte:head><title>Entry states · Creative Archive</title></svelte:head>

<Frame world="music" section="music">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Music</li><li>Entries</li></ul>
			<h1>Entry <em class="accent-word">states</em></h1>
			<p class="lede">Types without controls, a bare entry, an artist without works, failed saves and a missing entry.</p>
		</div>
	</div>
	<div class="screen-body" data-settle>
		<State label="Magazine: no status, rating or progress" note="Brands, shops, influencers, magazines and looks show fields and tags only.">
			<EntryMain kind="magazine" entry={magazine} {worst} />
		</State>
		<State label="Bare album: no cover, unrated, no tags, no note" note="An initials plate instead of a cover; “–” in the rating; empty groups are left out.">
			<EntryMain kind="album" entry={bare} {worst} />
		</State>
		<State label="Artist with no works" note="The Works group stays and says what fills it.">
			<EntryMain kind="artist" entry={artist} {worst} />
		</State>
		<State label="A save fails" note="Status, rating, progress and collection changes show at once; on failure the toast says so and the control returns to the server’s value.">
			<div class="toasts">
				<Toast message="Couldn’t save — try again" kind="error" />
				<Toast message="Deleted" />
			</div>
		</State>
		<State label="Unknown entry (404)" note="A non-numeric or unknown id answers 404.">
			<section class="card pad" data-surface="solid" aria-labelledby="nf-h">
				<div class="empty">
					<h2 class="title" id="nf-h">Entry not found</h2>
					<p class="body">It may have been deleted. Go back to the list to pick another.</p>
					<div class="action"><a class="btn secondary" href={nested('list', worst, 'd=music&t=albums')} data-press>Back to Albums</a></div>
				</div>
			</section>
			<p class="hint"><a href={href('home', worst)}>Home</a></p>
		</State>
	</div>
</Frame>

<style>
	.pad { padding: var(--space-4); }
	.toasts { display: grid; gap: var(--space-2); justify-items: start; }
	.hint { font-size: var(--type-caption-size); }
</style>
