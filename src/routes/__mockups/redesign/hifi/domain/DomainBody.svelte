<script lang="ts">
	import Icon from '../shell/Icon.svelte';
	import Shelf from '../shell/Shelf.svelte';
	import { href } from '../shell/data.ts';
	import type { DomainView } from './data.ts';

	type Props = { view: DomainView; settle?: boolean };
	let { view, settle = false }: Props = $props();
	const singular = $derived(view.label === 'Music' ? 'album' : view.label === 'Animanga' ? 'anime' : view.label === 'Books' ? 'book' : 'piece');
	const NOUN: Record<string, [string, string]> = { albums: ['album', 'albums'], artists: ['artist', 'artists'], songs: ['song', 'songs'] };
	const noun = (slug: string): [string, string] => NOUN[slug] ?? ['entry', 'entries'];
	const ratio = (slug: string) => (['albums', 'artists', 'songs', 'brands-shops', 'influencers', 'magazines'].includes(slug) ? '1 / 1' : '3 / 4');
</script>

<div class="screen-body" data-settle={settle ? '' : undefined}>
	{#if view.total === 0}
		<section class="card" data-surface="solid" aria-labelledby="empty-h">
			<div class="empty">
				<h2 class="title" id="empty-h">No {view.label.toLowerCase()} yet</h2>
				<p class="body">Add the first one to start the list.</p>
				<div class="action"><a class="btn secondary" href={href('add', view.worst)} data-press><Icon name="plus" />Add {singular === 'anime' ? 'an' : 'a'} {singular}</a></div>
			</div>
		</section>
	{:else}
		{#if view.inProgress.length}
			<Shelf title="In progress" count={view.inProgressCount} list={view.inProgress} steps worst={view.worst} level="h2" heading="card" />
		{/if}
		{#each view.shelves as shelf (shelf.slug)}
			<Shelf title={shelf.label} count={shelf.count} list={shelf.list} noun={noun(shelf.slug)} seeAll={href('list', view.worst, `d=${view.d}&t=${shelf.slug}`)} ratio={ratio(shelf.slug)} showKind={false} worst={view.worst} level="h2" heading="card" />
		{/each}
	{/if}
</div>

<style>
	.card { display: grid; padding: var(--space-5); }
</style>
