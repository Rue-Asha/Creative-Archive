<script lang="ts">
	import { deserialize } from '$app/forms';
	import { untrack } from 'svelte';
	import { afterNavigate, goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import Button from '#lib/components/button/Button.svelte';
	import EmptyState from '#lib/components/empty-state/EmptyState.svelte';
	import Sheet from '#lib/components/sheet/Sheet.svelte';
	import { COPY, withCount } from '#lib/copy.ts';
	import { DOMAIN_LABEL } from '#lib/domains.ts';
	import { LISTS, TYPES } from '#lib/entries/config.ts';
	import { statusLabel } from '#lib/entries/derive.ts';
	import EntryCard from '#lib/entries/EntryCard.svelte';
	import FilterBar from '#lib/entries/FilterBar.svelte';
	import { MEDIA_STATUSES, PIECE_STATUSES, statusShelves, toSearchParams, type ListState } from '#lib/entries/query.ts';
	import Shelf from '#lib/entries/Shelf.svelte';
	import { createSelection } from '#lib/select/selection.svelte.ts';
	import SelectionBar from '#lib/select/SelectionBar.svelte';
	import TagPicker from '#lib/select/TagPicker.svelte';
	import { toast } from '#lib/shell/toast.ts';
	import type { Status, Tag } from '#lib/types.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const config = $derived(TYPES[data.type]);
	const slug = $derived(page.params.list ?? '');

	// the list's one line under its title
	const LEDE: Record<string, string> = {
		albums: 'Music · rated from 0 to 10',
		artists: 'Music · the people behind the records',
		songs: 'Music · single tracks worth keeping',
		anime: 'Animanga · episode by episode',
		manga: 'Animanga · chapter by chapter',
		books: 'Books · the shelf you are in, and the one waiting',
		'brands-shops': 'Fashion · brands, shops and sites in one list',
		influencers: 'Fashion · voices whose taste you follow',
		magazines: 'Fashion · magazines worth keeping',
		pieces: 'Fashion · everything you own or want',
		wardrobe: 'Fashion · every piece you own',
		looks: 'Fashion · outfits to come back to'
	};

	const fmt = (n: number) => n.toLocaleString('en-GB');
	const one = $derived(slug === 'brands-shops' ? 'entry' : slug === 'wardrobe' ? 'piece' : config.label.toLowerCase());
	const many = $derived(slug === 'brands-shops' ? 'entries' : slug === 'wardrobe' ? 'pieces' : config.plural.toLowerCase());
	const plural = (n: number, singular: string, other: string) => `${fmt(n)} ${n === 1 ? singular : other}`;
	const phrase = $derived(config.status !== null ? plural(data.entries.length, 'title', 'titles') : plural(data.entries.length, one, many));
	const filtered = $derived(data.entries.length !== data.total);

	// The charcoal card counts what the list shows; with filters on, the caption says so.
	const facts = $derived.by((): [string, number][] => {
		const by = (status: string) => data.entries.filter((e) => e.status === status).length;
		const rows: [string, number][] =
			slug === 'brands-shops'
				? (['brand', 'shop', 'site'] as const).map((kind) => [kind[0].toUpperCase() + kind.slice(1), data.entries.filter((e) => e.kind === kind).length])
				: config.status === 'media'
					? (['progress', 'want', 'done', 'dropped', 'none'] as const).map((s) => [statusLabel(data.type, s)!, by(s)])
					: config.status === 'piece'
						? PIECE_STATUSES.map((s) => [statusLabel(data.type, s)!, by(s)])
						: [[data.label, data.entries.length]];
		return rows.filter(([, n]) => n);
	});

	// every filter change is a history entry, so Back steps through the filter sets
	function apply(next: ListState) {
		const query = toSearchParams(next).toString();
		goto(query ? `?${query}` : page.url.pathname, { reset: false });
	}

	const addHref = $derived(slug === 'wardrobe' ? '/add/piece?status=owned' : `/add/${data.type}`);
	// Select mode lists the grid whatever the view is: shelves have no toggles
	const selection = createSelection(() => data.entries);
	// The page stays mounted from one list to the next: another list leaves Select mode, and a filter or a bulk change
	// that hides picked entries drops them, so an action never reaches an entry the grid no longer shows.
	afterNavigate(({ from, to }) => {
		if (from?.url.pathname !== to?.url.pathname) selection.leave();
	});
	$effect.pre(() => {
		void data.entries;
		untrack(() => selection.prune());
	});
	const shelves = $derived(data.state.view === 'shelves' && !selection.active ? statusShelves(data.type, data.entries) : null);

	const picked = $derived(data.entries.filter((e) => selection.ids.has(e.id)));
	// "Set status" only when every selected entry has the same status set (all media, or all pieces); with nothing picked the list's own
	const statusKinds = $derived(new Set((picked.length ? picked : data.entries.slice(0, 1)).map((e) => TYPES[e.type].status)));
	const statusKind = $derived(statusKinds.size === 1 ? [...statusKinds][0] : null);
	const statusType = $derived(picked[0]?.type ?? data.type);
	const statusOptions = $derived(statusKind === 'piece' ? [...PIECE_STATUSES] : statusKind === 'media' ? [...MEDIA_STATUSES] : []);

	const tagCounts = (entries: typeof data.entries): Tag[] => {
		const counts = new Map<number, Tag>();
		for (const e of entries) for (const t of e.tags) counts.set(t.id, { id: t.id, name: t.name, count: (counts.get(t.id)?.count ?? 0) + 1 });
		return [...counts.values()];
	};
	const allTags = $derived(tagCounts(data.entries));
	const selectedTags = $derived(tagCounts(picked));

	let statusOpen = $state(false);
	let tagOpen = $state(false);
	let tagMode = $state<'add' | 'remove'>('add');
	const actions = $derived([
		...(statusOptions.length ? [{ id: 'status', label: COPY.setStatus, onrun: () => (statusOpen = true) }] : []),
		{ id: 'tag-add', label: COPY.addTag, onrun: () => ((tagMode = 'add'), (tagOpen = true)) },
		{ id: 'tag-remove', label: COPY.removeTag, onrun: () => ((tagMode = 'remove'), (tagOpen = true)) }
	]);

	// one request for the whole selection; a failure keeps the selection so the action can be repeated
	async function bulk(action: 'bulkStatus' | 'bulkTag', fields: Record<string, string>, done: string) {
		const ids = [...selection.ids];
		const body = new FormData();
		body.set('ids', ids.join(','));
		for (const [name, value] of Object.entries(fields)) body.set(name, value);
		let ok = false;
		try {
			const res = await fetch(`${page.url.pathname}?/${action}`, { method: 'POST', body, headers: { accept: 'application/json', 'x-sveltekit-action': 'true' } });
			ok = deserialize(await res.text()).type === 'success';
		} catch {
			ok = false;
		}
		if (!ok) return toast(withCount(COPY.bulkFailed, ids.length));
		toast(withCount(done, ids.length));
		await invalidateAll();
	}
	// the cards settle on a full page load only, never on in-app navigation
	const settle = typeof document === 'undefined' || !document.documentElement.hasAttribute('data-hydrated');
</script>

<svelte:head><title>{data.label} · {DOMAIN_LABEL[data.world]} · Creative Archive</title></svelte:head>

{#snippet factsCard(where: 'head' | 'after')}
	{#if facts.length}
		<ul class="screen-facts {where}" data-surface="inverse" aria-label="{data.label} by status">
			<li class="facts-caption">{filtered ? `Shown · ${fmt(data.entries.length)} of ${fmt(data.total)}` : `Whole list · ${plural(data.total, one, many)}`}</li>
			{#each facts as [label, n] (label)}<li><span class="n figures">{fmt(n)}</span>{label}</li>{/each}
		</ul>
	{/if}
{/snippet}

<div class="screen-head">
	<div class="screen-lead">
		<h1>{data.label} <em class="accent-word">{phrase}</em></h1>
		<p class="lede">{LEDE[slug]}</p>
		<nav aria-label="Sub-types">
			<ul class="kicker">
				<li><a href="/{data.world}">{DOMAIN_LABEL[data.world]}</a></li>
				{#each LISTS[data.world] as l (l.slug)}
					<li><a href="/{data.world}/{l.slug}" aria-current={l.slug === slug ? 'page' : undefined}>{l.label}</a></li>
				{/each}
			</ul>
		</nav>
	</div>
	{#if data.total}
		<FilterBar {config} state={data.state} tags={data.tags} fixedStatus={data.fixedStatus} onchange={apply} {addHref} selecting={selection.active} onselect={data.entries.length ? () => selection.enter() : undefined} />
		{@render factsCard('head')}
	{/if}
</div>

<div class="screen-body" data-settle={settle ? '' : undefined}>
	{#if selection.active}
		<SelectionBar {selection} label="Selection" {actions} />
	{/if}
	{#if shelves && data.entries.length}
		{#each shelves as shelf (shelf.key)}<Shelf {shelf} />{/each}
	{:else if data.entries.length}
		<section class="card pad" data-surface="solid" aria-label="{data.label} list">
			<h2 class="sr-only">{data.label} list</h2>
			<ul class="grid">
				{#each data.entries as entry (entry.id)}
					<li>
						<EntryCard
							{entry}
							selectable={selection.active ? { selected: selection.ids.has(entry.id), ontoggle: (e) => selection.toggle(entry.id, { range: e.shiftKey }) } : undefined}
						/>
					</li>
				{/each}
			</ul>
		</section>
	{:else if data.total}
		<EmptyState title={COPY.nothingMatches} body="No {one} fits these filters.">
			{#snippet action()}<Button variant="secondary" onclick={() => goto(page.url.pathname, { reset: false })}>{COPY.resetFilters}</Button>{/snippet}
		</EmptyState>
	{:else}
		<EmptyState title="No {many} yet" body="Add the first one to start the list.">
			{#snippet action()}<Button variant="primary" arrow href={addHref}>Add</Button>{/snippet}
		</EmptyState>
	{/if}
	{#if data.entries.length}{@render factsCard('after')}{/if}
</div>

<Sheet bind:open={statusOpen} mode="sheet" kicker="Selection" title={COPY.setStatus}>
	<ul class="status-rows" aria-label="Status">
		{#each statusOptions as status (status)}
			<li>
				<button
					type="button"
					onclick={() => {
						statusOpen = false;
						bulk('bulkStatus', { status }, COPY.statusSet.replace('{status}', statusLabel(statusType, status as Status)!));
					}}>{statusLabel(statusType, status as Status)}</button
				>
			</li>
		{/each}
	</ul>
	{#snippet actions()}<Button variant="secondary" onclick={() => (statusOpen = false)}>Cancel</Button>{/snippet}
</Sheet>

<TagPicker
	bind:open={tagOpen}
	mode={tagMode}
	tags={tagMode === 'add' ? allTags : selectedTags}
	onpick={(name) => bulk('bulkTag', { tag: name, op: tagMode }, tagMode === 'add' ? COPY.tagAdded : COPY.tagRemoved)}
/>

<style>
	.status-rows {
		display: grid;
		gap: var(--space-0-5);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.status-rows button {
		display: flex;
		align-items: center;
		inline-size: 100%;
		min-block-size: max(var(--control-height-s), var(--target));
		padding: 0 var(--space-3-5) 0 var(--space-3);
		border: 0;
		border-radius: var(--radius-item);
		background: none;
		color: var(--ink);
		font-size: var(--type-body-s-size);
		text-align: start;
	}
	@media (hover: hover) {
		.status-rows button:hover {
			background: var(--surface-sunken);
		}
	}
	.pad {
		display: grid;
		padding: var(--space-5);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 12rem), 1fr));
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
		align-items: stretch;
	}
	.kicker a {
		min-block-size: var(--target);
	}
	/* the facts card sits in the head and, on the phone, after the grid instead */
	.screen-facts.after {
		display: none;
	}
	@media (max-width: 767px) {
		.pad {
			padding: var(--space-3);
		}
		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--space-2-5);
		}
		.screen-facts.head {
			display: none;
		}
		.screen-facts.after {
			display: grid;
		}
	}
</style>
