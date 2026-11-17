<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import EntryCard from '../parts/EntryCard.svelte';
	import { listFor, lists, titleSamples, type ListEntry, dataFor } from '../parts/data.ts';
	import Panel from '../parts/Panel.svelte';
	import Results from '../parts/Results.svelte';
	import Toolbar from '../parts/Toolbar.svelte';
	import '../parts/wire.css';

	const fx = $derived(dataFor(page.url));
	const albums = $derived(listFor('albums', fx));
	const anime = $derived(listFor('anime', fx));
	const progress = $derived<ListEntry[]>([
		{ ...anime.entries[0], id: 801, title: 'Harbour Lights', progress: { done: 7, total: 24, unit: 'episodes' }, status: 'doing' },
		{ ...anime.entries[0], id: 802, title: 'Night Train to Aomori', progress: { done: 0, total: 24, unit: 'episodes' }, status: 'doing' },
		{ ...anime.entries[0], id: 803, title: 'The Lighthouse Keeper', progress: { done: 24, total: 24, unit: 'episodes' }, status: 'doing' }
	]);
	const samples = $derived(titleSamples('albums'));
</script>

<svelte:head><title>List states (wireframe)</title></svelte:head>

<Frame world="music" section="music">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Music</li><li>Lists</li></ul>
			<h1>List <em class="accent-word">states</em></h1>
			<p class="lede">Every state of a list that the main wireframes do not show: empty, filtered-empty, long titles, quick controls.</p>
		</div>
	</div>
	<div class="screen-body w-gallery">
		<Panel title="No entries at all" note="Filters, facts and Select are hidden; one Add link (contract 4.3, state E)">
			<Results def={lists.albums} entries={[]} total={0} state="empty" />
		</Panel>
		<Panel title="Filters match nothing" note="Filters stay so they can be changed; Reset filters clears them (filtered-empty)">
			<div class="w-stack">
				<Toolbar def={lists.albums} status="Dropped" rating="9 and up" actions="none" />
				<Results def={lists.albums} entries={albums.entries} total={albums.total} state="nomatch" />
			</div>
		</Panel>
		<Panel title="Empty Wardrobe" note="Same empty state, named after the list">
			<Results def={lists.wardrobe} entries={[]} total={0} state="empty" />
		</Panel>
		<Panel title="Long titles in any script" note="Latin 180 characters, Japanese, Arabic (right to left), one letter; titles clamp to three lines in a list, the entry page shows them in full">
			<section class="card w-list" data-surface="solid" aria-label="Long titles">
				<ul class="w-grid" data-tone="square">
					{#each samples as e (e.id)}<EntryCard entry={e} tone="square" />{/each}
				</ul>
			</section>
		</Panel>
		<Panel title="In-progress anime and manga: quick controls" note="Step buttons named “Episodes: one less / one more”; the value is a button; one less is disabled at 0, one more at the known total">
			<section class="card w-list" data-surface="solid" aria-label="Quick controls">
				<ul class="w-grid" data-tone="portrait">
					{#each progress as e (e.id)}<EntryCard entry={e} tone="portrait" />{/each}
				</ul>
			</section>
		</Panel>
		<Panel title="Shelves with a missing status" note="A status without entries has no shelf; the order is In progress, Want, Done, Dropped, No status">
			<Results def={lists.albums} entries={albums.entries.filter((e) => e.status === 'doing' || e.status === 'done')} total={albums.entries.filter((e) => e.status === 'doing' || e.status === 'done').length} view="shelves" hint={false} />
		</Panel>
	</div>
</Frame>
