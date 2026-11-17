<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData, type MockEntry } from '../../../fixtures.ts';
	import Shelf from '../../shell/Shelf.svelte';
	import State from '../../shell/State.svelte';
	import { stress } from '../../shell/data.ts';
	import Filters from '../Filters.svelte';
	import { LISTS, listEntries, RATINGS, SORTS, type ListEntry } from '../data.ts';
	import ListCard from '../ListCard.svelte';
	import ListEmpty from '../ListEmpty.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const worst = $derived(data.worst);
	const albums = $derived(listEntries(LISTS.albums, data).entries);
	const anime = $derived(listEntries(LISTS.anime, data).entries);
	const samples = $derived(
		stress(
			albums.slice(0, 4).map((e): ListEntry => ({ ...e, cover: e.id === 3 ? null : e.cover })),
			true
		) as ListEntry[]
	);
	const progress = $derived<ListEntry[]>([
		{ ...anime[0], id: 801, status: 'doing', progress: { done: 7, total: 24, unit: 'episodes' } },
		{ ...anime[1], id: 802, status: 'doing', progress: { done: 0, total: 24, unit: 'episodes' } },
		{ ...anime[2], id: 803, status: 'doing', progress: { done: 24, total: 24, unit: 'episodes' } }
	]);
	const twoShelves = $derived<MockEntry[]>(albums.filter((e) => e.status === 'doing' || e.status === 'done'));
</script>

<svelte:head><title>List states · Creative Archive</title></svelte:head>

<Frame world="music" section="music" list="albums">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Music</li><li>Lists</li></ul>
			<h1>List <em class="accent-word">states</em></h1>
			<p class="lede">Every state of a list the main screens do not show: empty, filtered-empty, long titles in any script, quick controls, a shelf view with gaps.</p>
		</div>
	</div>
	<div class="screen-body" data-settle>
		<State label="No entries at all" note="Filters, facts and Select are hidden; one Add action.">
			<ListEmpty def={LISTS.albums} kind="empty" {worst} />
		</State>
		<State label="Filters match nothing" note="The filters stay so they can be changed; Reset filters clears them.">
			<Filters def={LISTS.albums} {worst} status="Dropped" rating="9 and up" actions="none" />
			<ListEmpty def={LISTS.albums} kind="nomatch" {worst} />
		</State>
		<State label="Minimum rating and Sort: option lists" note="Both are the browser's own select, so the list opens in the system picker; this shows its content. One row is checked; Minimum rating starts at Any rating.">
			<div class="pickers">
				{#each [{ name: 'Minimum rating', options: RATINGS, on: 'Any rating' }, { name: 'Sort', options: SORTS(true), on: 'Recently added' }] as p (p.name)}
					<div class="picker" role="listbox" aria-label={p.name}>
						<p class="cap">{p.name}</p>
						{#each p.options as o (o)}<div class="opt" role="option" aria-selected={o === p.on}>{o}</div>{/each}
					</div>
				{/each}
			</div>
		</State>
		<State label="Empty Wardrobe" note="The same empty state, named after the list; Add opens a piece that starts as Owned.">
			<ListEmpty def={LISTS.wardrobe} kind="empty" {worst} />
		</State>
		<State label="Long titles in any script" note="Latin at 180 characters, Japanese, Arabic (right to left), one letter, no cover. Titles clamp to three lines in a list; the entry page shows them in full.">
			<section class="card inner" data-surface="solid" aria-label="Long titles">
				<ul class="grid">{#each samples as e (e.id)}<ListCard entry={e} def={LISTS.albums} {worst} />{/each}</ul>
			</section>
		</State>
		<State label="In-progress anime: quick controls" note="Steps named “Episodes: one less / one more”; one less is disabled at 0, one more at the known total.">
			<section class="card inner" data-surface="solid" aria-label="Quick controls">
				<ul class="grid">{#each progress as e (e.id)}<ListCard entry={e} def={LISTS.anime} {worst} />{/each}</ul>
			</section>
		</State>
		<State label="Shelves with a missing status" note="A status without entries has no shelf; the order is In progress, Want, Done, Dropped, No status.">
			<Shelf title="Listening" count={twoShelves.filter((e) => e.status === 'doing').length} list={twoShelves.filter((e) => e.status === 'doing')} noun={['album', 'albums']} showKind={false} {worst} level="h3" heading="card" />
			<Shelf title="Listened" count={twoShelves.filter((e) => e.status === 'done').length} list={twoShelves.filter((e) => e.status === 'done')} noun={['album', 'albums']} showKind={false} {worst} level="h3" heading="card" />
		</State>
	</div>
</Frame>

<style>
	.inner { padding: var(--space-4); }
	.pickers { display: flex; flex-wrap: wrap; gap: var(--space-4); align-items: start; }
	.picker { display: grid; gap: var(--space-0-5); inline-size: min(100%, 14rem); padding: var(--space-1-5); border-radius: var(--radius-panel); background: var(--surface-raised); box-shadow: var(--elevation-menu); }
	.cap { padding: var(--space-2) var(--space-3) var(--space-1); font-size: var(--type-overline-size); line-height: var(--type-overline-line); letter-spacing: var(--type-overline-tracking); font-weight: var(--type-overline-weight); text-transform: uppercase; color: var(--ink-secondary); }
	.opt { display: flex; align-items: center; min-block-size: max(var(--control-height-s), var(--target)); padding-inline: var(--space-3); border-radius: var(--radius-item); font-size: var(--type-body-s-size); }
	.opt[aria-selected="true"] { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 10rem), 1fr)); gap: var(--space-3); margin: 0; padding: 0; list-style: none; }
	@media (max-width: 767px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-2-5); } }
</style>
