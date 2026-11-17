<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '../shell/Icon.svelte';
	import { href } from '../shell/data.ts';
	import { pill } from '../shell/pill.ts';
	import Glyph from './Glyph.svelte';
	import { nested, RATINGS, SORTS, type ListDef } from './data.ts';

	type Props = {
		def: ListDef;
		worst?: boolean;
		tags?: boolean;
		status?: string;
		tag?: string;
		rating?: string;
		sort?: string;
		view?: 'grid' | 'shelves';
		actions?: 'normal' | 'none' | 'select-only';
	};
	let { def, worst = false, tags = true, status = 'All', tag = 'All tags', rating = 'Any rating', sort = 'Recently added', view = 'grid', actions = 'normal' }: Props = $props();

	const uid = $props.id();
	const brands = $derived(def.slug === 'brands-shops');
	const hasStatus = $derived(def.media || def.piece || brands);
	const statusLabel = $derived(brands ? 'Kind' : 'Status');
	const statusOptions = $derived(brands ? ['All', 'Brand', 'Shop', 'Site'] : ['All', ...def.statuses]);
	const q = $derived(`t=${def.slug}&d=${def.domain}`);
</script>

{#snippet seg(id: string, label: string, options: string[], value: string, icon: 'tag' | 'star' | 'sort' | 'status')}
	<div class="seg filter">
		<span class="glyph" aria-hidden="true">
			{#if icon === 'tag'}<Glyph name="tag" size={18} />{:else if icon === 'star'}<Glyph name="star" size={18} />{:else if icon === 'status'}<Icon name="check" size={18} />{:else}<Glyph name="shelves" size={18} />{/if}
		</span>
		<span class="seg-text">
			<label class="seg-label" for="{uid}-{id}">{label}</label>
			<span class="sel">
				<select id="{uid}-{id}" name={id}>{#each options as o (o)}<option selected={o === value}>{o}</option>{/each}</select>
				<Glyph name="chevron-down" size={14} />
			</span>
		</span>
	</div>
{/snippet}

<div class="seg-bar" role="toolbar" aria-label="Filters">
	{#if hasStatus}{@render seg('status', statusLabel, statusOptions, status, 'status')}{/if}
	{#if tags}{@render seg('tag', 'Tag', ['All tags', 'favourite', 'autumn', 'quiet'], tag, 'tag')}{/if}
	{#if def.media}{@render seg('rating', 'Minimum rating', RATINGS, rating, 'star')}{/if}
	{@render seg('sort', 'Sort', SORTS(def.media), sort, 'sort')}
	{#if def.media}
		<div class="seg view">
			<div class="view-track" role="group" aria-label="View" data-pill use:pill>
				<button type="button" class="btn quiet s" aria-pressed={view === 'grid'} onclick={() => goto(nested('list', worst, q))}><Glyph name="grid" size={16} /><span>Grid</span></button>
				<button type="button" class="btn quiet s" aria-pressed={view === 'shelves'} onclick={() => goto(nested('list/shelves', worst, q))}><Glyph name="shelves" size={16} /><span>Shelves</span></button>
			</div>
		</div>
	{/if}
	{#if actions !== 'none'}
		<div class="seg-actions acts">
			<a class="btn secondary" href={href('select', worst, q)} data-press><Glyph name="select" size={16} />Select</a>
			{#if actions === 'normal'}
				<a class="btn primary arrow" href={href('add', worst, `type=${def.addType}${def.slug === 'wardrobe' ? '&status=owned' : ''}`)} data-press data-focus="halo">Add<span class="circle" aria-hidden="true"><Icon name="arrow" size={18} /></span></a>
			{/if}
		</div>
	{/if}
</div>

<style>
	.seg-bar { background: var(--surface-card); }
	.glyph { display: inline-flex; color: var(--ink); }
	.sel { position: relative; display: grid; align-items: center; }
	select {
		grid-area: 1 / 1;
		min-block-size: max(var(--control-height-xs), var(--target));
		max-inline-size: 12em;
		padding: 0 var(--space-6) 0 0;
		border: 0;
		border-radius: 0;
		background: none;
		box-shadow: var(--rule-below-control);
		color: var(--ink-secondary);
		font-family: inherit;
		font-size: var(--type-caption-size);
		text-overflow: ellipsis;
		appearance: none;
		-webkit-appearance: none;
	}
	.sel :global(svg) { grid-area: 1 / 1; justify-self: end; pointer-events: none; color: var(--ink-secondary); }
	@media (hover: hover) { select:hover { color: var(--ink); } }
	.view-track { display: flex; gap: var(--space-0-5); padding: 0; }
	.view .btn > :global(svg) { color: inherit; }
	.acts { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); }
	@media (max-width: 1099px) {
		.glyph { display: none; }
		select { max-inline-size: 9.5em; }
	}
	@media (max-width: 767px) {
		.seg-bar { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: var(--space-1); }
		.seg { padding: var(--space-2) var(--space-2-5); box-shadow: none; }
		.view, .seg-actions { grid-column: 1 / -1; }
		.view-track { inline-size: 100%; }
		.view-track .btn { flex: 1; }
		select { max-inline-size: none; }
		.acts { display: grid; grid-template-columns: minmax(0, 1fr); }
		.acts .btn { justify-content: center; }
		.acts .btn.arrow { justify-content: space-between; }
	}
</style>
