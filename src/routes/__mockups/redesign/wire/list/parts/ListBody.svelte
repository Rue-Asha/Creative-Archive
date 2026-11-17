<script lang="ts">
	import Results from './Results.svelte';
	import SelectionBar from './SelectionBar.svelte';
	import Toolbar from './Toolbar.svelte';
	import { base, domainLabel, plural, type ListDef, type ListEntry } from './data.ts';

	type Props = {
		def: ListDef;
		entries: ListEntry[];
		total: number;
		view?: 'grid' | 'shelves';
		state?: 'normal' | 'empty' | 'nomatch';
		select?: { selected: number[]; canStatus?: boolean; canRemoveTag?: boolean; note?: string } | null;
	};
	let { def, entries, total, view = 'grid', state = 'normal', select = null }: Props = $props();

	const shownTotal = $derived(state === 'normal' ? total : 0);
	const word = $derived(def.noun);
	const hasTags = $derived(entries.some((e) => e.tags.length));
	const counts = $derived.by(() => {
		const scale = total / Math.max(entries.length, 1);
		const rows = def.slug === 'brands-shops'
			? ['Brand', 'Shop', 'Site'].map((k) => [k, entries.filter((e) => e.kindLabel === k).length] as const)
			: def.media
				? [
						[def.statuses[1], entries.filter((e) => e.status === 'doing').length],
						[def.statuses[0], entries.filter((e) => e.status === 'want').length],
						[def.statuses[2], entries.filter((e) => e.status === 'done').length],
						[def.statuses[3], entries.filter((e) => e.status === 'dropped').length],
						['No status', entries.filter((e) => e.status === null).length]
					] as const
				: [[def.name, entries.length]] as const;
		return rows.filter(([, n]) => n).map(([label, n]) => [label, Math.round(n * scale)] as const);
	});
</script>

<div class="screen-head">
	<div class="screen-lead">
		<nav aria-label="Sub-types">
			<ul class="kicker">
				<li><a href="{base}/domain">{domainLabel[def.domain]}</a></li>
				{#each def.subTypes as s (s)}<li><a href="{base}/list" aria-current={s === def.name ? 'page' : undefined}>{s}</a></li>{/each}
			</ul>
		</nav>
		<h1>{def.name} <em class="accent-word">{plural(shownTotal, word[0], word[1])}</em></h1>
		<p class="lede">{def.lede}</p>
	</div>
	{#if state !== 'empty'}
		<Toolbar {def} tags={hasTags} actions={select ? 'none' : 'normal'} {view} status={state === 'nomatch' ? (def.statuses[3] ?? 'Brand') : 'All'} rating={state === 'nomatch' ? '9 and up' : 'Any rating'} />
		<ul class="screen-facts" data-surface="inverse" aria-label="{def.name} by status">
			{#if state === 'nomatch' || def.media || def.slug === 'brands-shops'}
				<li class="facts-caption">Whole list · {plural(total, def.name.toLowerCase().replace(/s$/, ''), def.name.toLowerCase())}</li>
			{/if}
			{#each counts as [label, n] (label)}<li><span class="n figures">{n.toLocaleString('en-GB')}</span>{label}</li>{/each}
		</ul>
	{/if}
</div>
<div class="screen-body" data-settle>
	{#if select}
		<SelectionBar count={select.selected.length} canStatus={select.canStatus ?? true} canRemoveTag={select.canRemoveTag ?? true} />
		{#if select.note}<p class="w-wirenote">{select.note}</p>{/if}
	{/if}
	<Results {def} {entries} {total} {view} {state} selectable={!!select} selected={select?.selected ?? []} />
</div>
