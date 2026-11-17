<script lang="ts">
	import type { Snippet } from 'svelte';
	import Shelf from '../shell/Shelf.svelte';
	import { fmt, href, plural } from '../shell/data.ts';
	import Filters from './Filters.svelte';
	import ListCard from './ListCard.svelte';
	import ListEmpty from './ListEmpty.svelte';
	import { domainName, LISTS, nested, PIECE, SUBTYPES, type ListDef, type ListEntry } from './data.ts';

	type Props = {
		def: ListDef;
		entries: ListEntry[];
		total: number;
		worst?: boolean;
		view?: 'grid' | 'shelves';
		state?: 'normal' | 'empty' | 'nomatch';
		filters?: { status?: string; tag?: string; rating?: string };
		select?: { selected: number[]; ontoggle?: (id: number, e: MouseEvent) => void } | null;
		bar?: Snippet;
		settle?: boolean;
	};
	let { def, entries, total, worst = false, view = 'grid', state = 'normal', filters = {}, select = null, bar, settle = true }: Props = $props();

	const shown = $derived(state === 'normal' ? total : 0);
	const phrase = $derived(def.media || def.piece ? plural(shown, 'title', 'titles') : plural(shown, def.one, def.many));
	const scale = $derived(total / Math.max(entries.length, 1));
	const hasTags = $derived(entries.some((e) => e.tags.length));
	const facts = $derived.by((): [string, number][] => {
		const by = (key: string | null) => entries.filter((e) => (e.status ?? null) === key).length;
		const rows: [string, number][] = def.slug === 'brands-shops'
			? ['Brand', 'Shop', 'Site'].map((k): [string, number] => [k, entries.filter((e) => e.kindText === k).length])
			: def.media
				? [[def.statuses[1], by('doing')], [def.statuses[0], by('want')], [def.statuses[2], by('done')], [def.statuses[3], by('dropped')], ['No status', by(null)]]
				: def.piece
					? [['Wishlist', by('wishlist')], ['Owned', by('owned')], ['Gone', by('gone')]]
					: [[def.name, entries.length]];
		return rows.filter(([, n]) => n).map(([l, n]) => [l, Math.round(n * scale)]);
	});
	const q = $derived(`d=${def.domain}&t=${def.slug}`);
	const shelves = $derived(
		[
			{ label: def.statuses[1], key: 'doing' },
			{ label: def.statuses[0], key: 'want' },
			{ label: def.statuses[2], key: 'done' },
			{ label: def.statuses[3], key: 'dropped' },
			{ label: 'No status', key: null }
		]
			.map((s) => ({ ...s, items: entries.filter((e) => (e.status ?? null) === s.key) }))
			.filter((s) => s.items.length)
	);
	const isSel = (id: number) => !!select?.selected.includes(id);
</script>

<div class="screen-head">
	<div class="screen-lead">
		<nav aria-label="Sub-types">
			<ul class="kicker">
				<li><a href={href('domain', worst, `d=${def.domain}`)}>{domainName(def.domain)}</a></li>
				{#each SUBTYPES[def.domain] as s (s)}
					<li><a href={nested('list', worst, `d=${def.domain}&t=${s}`)} aria-current={s === def.slug ? 'page' : undefined}>{LISTS[s].name}</a></li>
				{/each}
			</ul>
		</nav>
		<h1>{def.name} <em class="accent-word">{phrase}</em></h1>
		<p class="lede">{def.lede}</p>
	</div>
	{#if state !== 'empty'}
		<Filters {def} {worst} tags={hasTags} actions={select ? 'none' : 'normal'} {view} {...filters} />
		<ul class="screen-facts" data-surface="inverse" aria-label="{def.name} by status">
			<li class="facts-caption">Whole list · {plural(total, def.one, def.many)}</li>
			{#each facts as [label, n] (label)}<li><span class="n figures">{fmt(n)}</span>{label}</li>{/each}
		</ul>
	{/if}
</div>

<div class="screen-body" data-settle={settle ? '' : undefined}>
	{#if select && bar}{@render bar()}{/if}
	{#if state === 'empty' || state === 'nomatch'}
		<ListEmpty {def} kind={state} {worst} />
	{:else if view === 'shelves'}
		<h2 class="sr-only">{def.name} by status</h2>
		{#each shelves as shelf (shelf.label)}
			<Shelf title={shelf.label} count={Math.round(shelf.items.length * scale)} list={shelf.items} noun={[def.one, def.many]} steps={shelf.key === 'doing'} ratio={def.ratio} showKind={false} {worst} level="h3" heading="card" />
		{/each}
	{:else}
		<section class="card pad" data-surface="solid" aria-label="All {def.many}">
			<h2 class="sr-only">All {def.many}</h2>
			<ul class="grid" style:--ratio={def.ratio}>
				{#each entries as e (e.id)}
					<ListCard entry={e} {def} {worst} selectable={!!select} selected={isSel(e.id)} ontoggle={(ev) => select?.ontoggle?.(e.id, ev)} />
				{/each}
			</ul>
			{#if total > entries.length}<p class="note">Showing the first {fmt(entries.length)} of {fmt(total)}; the app lists the whole list, no pages.</p>{/if}
		</section>
	{/if}
</div>

<style>
	.pad { display: grid; gap: var(--space-4); padding: var(--space-5); }
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 10rem), 1fr)); gap: var(--space-3); margin: 0; padding: 0; list-style: none; align-items: stretch; }
	.kicker a { min-block-size: var(--target); }
	.note { font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-secondary); }
	@media (max-width: 767px) {
		.pad { padding: var(--space-3); }
		.grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-2-5); }
	}
</style>
