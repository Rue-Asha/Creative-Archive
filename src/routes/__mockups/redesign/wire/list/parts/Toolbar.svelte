<script lang="ts">
	import Icon from './Icon.svelte';
	import { base, type ListDef } from './data.ts';

	type Props = {
		def: ListDef;
		tags?: boolean;
		status?: string;
		tag?: string;
		rating?: string;
		sort?: string;
		view?: 'grid' | 'shelves';
		actions?: 'normal' | 'none';
	};
	let { def, tags = true, status = 'All', tag = 'All tags', rating = 'Any rating', sort = 'Recently added', view = 'grid', actions = 'normal' }: Props = $props();

	const isBrands = $derived(def.slug === 'brands-shops');
	const hasStatus = $derived(def.media || isBrands);
	const statusLabel = $derived(isBrands ? 'Kind' : 'Status');
	const statusOptions = $derived(isBrands ? ['All', 'Brand', 'Shop', 'Site'] : ['All', ...def.statuses]);
	const sorts = $derived(def.media ? ['Recently added', 'Rating', 'Title'] : ['Recently added', 'Title']);
	const ratings = ['Any rating', '9 and up', '8 and up', '7 and up', '6 and up', '5 and up'];
</script>

<div class="seg-bar" role="toolbar" aria-label="Filters">
	{#if hasStatus}
		<label class="seg">
			<span class="seg-text"><span class="seg-label">{statusLabel}</span>
				<span class="w-sel"><select>{#each statusOptions as o (o)}<option selected={o === status}>{o}</option>{/each}</select><Icon name="chevron-down" size={14} /></span>
			</span>
		</label>
	{/if}
	{#if tags}
		<label class="seg">
			<span class="seg-text"><span class="seg-label">Tag</span>
				<span class="w-sel"><select><option>All tags</option><option selected={tag !== 'All tags'}>{tag === 'All tags' ? 'favourite' : tag}</option></select><Icon name="chevron-down" size={14} /></span>
			</span>
		</label>
	{/if}
	{#if def.media}
		<label class="seg">
			<span class="seg-text"><span class="seg-label">Minimum rating</span>
				<span class="w-sel"><select>{#each ratings as o (o)}<option selected={o === rating}>{o}</option>{/each}</select><Icon name="chevron-down" size={14} /></span>
			</span>
		</label>
	{/if}
	<label class="seg">
		<span class="seg-text"><span class="seg-label">Sort</span>
			<span class="w-sel"><select>{#each sorts as o (o)}<option selected={o === sort}>{o}</option>{/each}</select><Icon name="chevron-down" size={14} /></span>
		</span>
	</label>
	{#if def.media}
		<div class="seg">
			<span class="seg-text"><span class="seg-label">View</span>
				<span class="w-pillgroup" role="group" aria-label="View">
					<button type="button" class="w-pill" aria-pressed={view === 'grid'}><Icon name="grid" size={14} />Grid</button>
					<button type="button" class="w-pill" aria-pressed={view === 'shelves'}><Icon name="shelves" size={14} />Shelves</button>
				</span>
			</span>
		</div>
	{/if}
	{#if actions === 'normal'}
		<div class="seg-actions w-actions-cell">
			<a class="w-btn" href="{base}/select"><Icon name="select" size={16} />Select</a>
			<a class="w-btn primary" href={def.addHref}>Add<span class="circle" aria-hidden="true"><Icon name="arrow" size={14} /></span></a>
		</div>
	{/if}
</div>
