<script lang="ts">
	import Icon from '../shell/Icon.svelte';
	import { href } from '../shell/data.ts';
	import { nested, type ListDef } from './data.ts';

	let { def, kind, worst = false }: { def: ListDef; kind: 'empty' | 'nomatch'; worst?: boolean } = $props();
	const id = $props.id();
</script>

<section class="card pad" data-surface="solid" aria-labelledby="{id}-h">
	<div class="empty">
		{#if kind === 'empty'}
			<h2 class="title" id="{id}-h">No {def.many} yet</h2>
			<p class="body">Add the first one to start the list.</p>
			<div class="action"><a class="btn primary arrow" href={href('add', worst, `type=${def.addType}${def.slug === 'wardrobe' ? '&status=owned' : ''}`)} data-press data-focus="halo">Add<span class="circle" aria-hidden="true"><Icon name="arrow" size={18} /></span></a></div>
		{:else}
			<h2 class="title" id="{id}-h">Nothing matches</h2>
			<p class="body">No {def.one} fits these filters.</p>
			<div class="action"><a class="btn secondary" href={nested('list', worst, `d=${def.domain}&t=${def.slug}`)} data-press>Reset filters</a></div>
		{/if}
	</div>
</section>

<style>
	.pad { display: grid; padding: var(--space-5); }
</style>
