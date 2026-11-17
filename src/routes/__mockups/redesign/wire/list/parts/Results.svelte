<script lang="ts">
	import EntryCard from './EntryCard.svelte';
	import Icon from './Icon.svelte';
	import { base, plural, type ListDef, type ListEntry } from './data.ts';

	type Props = {
		def: ListDef;
		entries: ListEntry[];
		total: number;
		view?: 'grid' | 'shelves';
		state?: 'normal' | 'empty' | 'nomatch';
		selectable?: boolean;
		selected?: number[];
		hint?: boolean;
	};
	let { def, entries, total, view = 'grid', state = 'normal', selectable = false, selected = [], hint = true }: Props = $props();

	const lower = $derived(def.noun[1] === 'entries' ? 'entries' : def.name.toLowerCase());
	const single = $derived(def.slug === 'brands-shops' ? 'entry' : def.name.toLowerCase().replace(/s$/, ''));
	// shelves run In progress, Want, Done, Dropped, No status, one shelf per status that has entries
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
	const scale = $derived(total / Math.max(entries.length, 1));
	const isSel = (id: number) => selected.includes(id);
</script>

{#if state === 'empty'}
	<section class="card w-empty" data-surface="solid" aria-labelledby="w-empty-h">
		<h2 id="w-empty-h">No {lower} yet</h2>
		<p>Add the first one to start the list.</p>
		<a class="w-btn primary" href={def.addHref}>Add<span class="circle" aria-hidden="true"><Icon name="arrow" size={14} /></span></a>
	</section>
{:else if state === 'nomatch'}
	<section class="card w-empty" data-surface="solid" aria-labelledby="w-empty-h">
		<h2 id="w-empty-h">Nothing matches</h2>
		<p>No {single} fits these filters.</p>
		<a class="w-btn" href="{base}/list">Reset filters</a>
	</section>
{:else if view === 'shelves'}
	<h2 class="sr-only">{def.name} by status</h2>
	{#each shelves as shelf (shelf.label)}
		<section class="card w-shelf" data-surface="solid" aria-labelledby="shelf-{shelf.key ?? 'none'}">
			<div class="w-shelf-head">
				<h3 class="ruled" id="shelf-{shelf.key ?? 'none'}">{shelf.label}</h3>
				<span class="card-note">{plural(Math.round(shelf.items.length * scale), single, lower)}</span>
				<span class="w-steps">
					<button type="button" class="w-btn icon s" aria-label="Scroll left" disabled><Icon name="chevron-left" size={16} /></button>
					<button type="button" class="w-btn icon s" aria-label="Scroll right"><Icon name="chevron-right" size={16} /></button>
				</span>
			</div>
			<ul class="w-row" aria-label={shelf.label}>
				{#each shelf.items as e (e.id)}<EntryCard entry={e} tone={def.tone} {selectable} selected={isSel(e.id)} />{/each}
			</ul>
		</section>
	{/each}
{:else}
	<section class="card w-list" data-surface="solid" aria-label="All {lower}">
		<h2 class="sr-only">All {lower}</h2>
		<ul class="w-grid" data-tone={def.tone}>
			{#each entries as e (e.id)}<EntryCard entry={e} tone={def.tone} {selectable} selected={isSel(e.id)} />{/each}
		</ul>
		{#if hint && total > entries.length}
			<p class="w-wirenote">Wireframe draws the first {entries.length} of {total.toLocaleString('en-GB')}; the app lists the whole list (no pagination).</p>
		{/if}
	</section>
{/if}
