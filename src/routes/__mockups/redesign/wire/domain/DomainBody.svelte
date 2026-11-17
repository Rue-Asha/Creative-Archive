<script lang="ts">
	import { entries, fmt, link } from '../shell/data.ts';
	import Icon from '../shell/Icon.svelte';
	import Shelf from '../shell/Shelf.svelte';
	import type { DomainView } from './data.ts';

	type Props = { view: DomainView; part?: 'all' | 'nav' | 'shelves' };
	let { view, part = 'all' }: Props = $props();
	const empty = $derived(view.total === 0);
	const singular = $derived(view.label === 'Music' ? 'album' : view.label === 'Animanga' ? 'anime' : view.label === 'Books' ? 'book' : 'piece');
</script>

<div class="body">
	{#if part !== 'shelves'}
		<nav class="sub" aria-label="Sub-types">
			<ul>
				{#each view.subTypes as s (s.slug)}
					<li><a class="fw-chip" href={link('wire/list', view.worst, `d=${view.d}&t=${s.slug}`)}>{s.label}<span class="n">{fmt(s.count)}</span></a></li>
				{/each}
			</ul>
		</nav>
	{/if}
	{#if part !== 'nav'}
		{#if empty}
			<section class="fw-card" aria-labelledby="empty-h">
				<div class="fw-empty">
					<h2 id="empty-h">No {view.label.toLowerCase()} yet</h2>
					<p>Add the first one to start the list.</p>
					<a class="fw-btn" href={link('wire/add', view.worst)}><Icon name="plus" size={18} />Add {singular === 'anime' ? 'an' : 'a'} {singular}</a>
				</div>
			</section>
		{:else}
			{#if view.inProgress.length}
				<section class="fw-card"><Shelf title="In progress" count={view.inProgressCount} list={view.inProgress} steps /></section>
			{/if}
			{#each view.shelves as shelf (shelf.slug)}
				<section class="fw-card"><Shelf title={shelf.label} count={shelf.count} list={shelf.list} seeAll="wire/list?d={view.d}&t={shelf.slug}" /></section>
			{/each}
		{/if}
	{/if}
</div>

<style>
	.body { display: grid; gap: var(--space-5); min-inline-size: 0; }
	.sub ul { display: flex; flex-wrap: wrap; gap: var(--space-2); margin: 0; padding: 0; list-style: none; }
</style>
