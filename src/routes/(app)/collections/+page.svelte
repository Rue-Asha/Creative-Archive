<script lang="ts">
	import { tick } from 'svelte';
	import Button from '#lib/components/button/Button.svelte';
	import EmptyState from '#lib/components/empty-state/EmptyState.svelte';
	import CollectionForm from '#lib/collections/CollectionForm.svelte';
	import { appear, glide, rise, shift } from '#lib/motion.ts';
	import Collage from '#lib/ui/Collage.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let creating = $state(false);
	// the form is fading out; "New collection" comes back once it is gone, so the head changes only once
	let leaving = $state(false);
	let list = $state<HTMLElement>();
	const error = $derived(creating ? form?.errors?.name : undefined);

	const fmt = (n: number) => n.toLocaleString('en-GB');
	const plural = (n: number, one: string, other: string) => `${fmt(n)} ${n === 1 ? one : other}`;
	const total = $derived(data.collections.reduce((sum, c) => sum + c.count, 0));

	// the cards below the form glide from where they were when it comes or goes, so nothing jumps
	async function reflow(change: () => void) {
		const before = list?.getBoundingClientRect().top;
		change();
		await tick();
		if (list && before !== undefined) shift(list, before - list.getBoundingClientRect().top);
	}

	function close() {
		leaving = true;
		creating = false;
	}

	async function gone() {
		await reflow(() => (leaving = false));
		(document.querySelector('main [data-new]') as HTMLElement | null)?.focus();
	}
	// the new-collection form takes focus itself; the shown button lives in the head or in the empty state
</script>

<svelte:head><title>Collections · Creative Archive</title></svelte:head>

{#snippet add()}
	<Button variant="primary" arrow data-new aria-expanded={creating} aria-controls="new-collection" onclick={() => reflow(() => (creating = true))}>New collection</Button>
{/snippet}

<div class="screen-head">
	<div class="screen-lead">
		<ul class="kicker">
			<li>Archive</li>
			<li>{plural(data.collections.length, 'collection', 'collections')}</li>
		</ul>
		<h1>All <em class="accent-word">collections</em></h1>
		<p class="lede">Group entries of any kind into one place, in the order you choose.</p>
		{#if !creating && !leaving && data.collections.length}<div class="actions">{@render add()}</div>{/if}
	</div>
	{#if data.collections.length}
		<ul class="screen-facts" data-surface="inverse" aria-label="Collections at a glance">
			<li class="facts-caption">Whole archive</li>
			<li><span class="n figures">{fmt(data.collections.length)}</span>{data.collections.length === 1 ? 'Collection' : 'Collections'}</li>
			<li><span class="n figures">{fmt(total)}</span>Entries inside</li>
		</ul>
	{/if}
</div>

<div class="screen-body" data-settle>
	{#if creating}
		<div id="new-collection" transition:appear onoutrostart={(e) => e.currentTarget.setAttribute('aria-hidden', 'true')} onoutroend={gone}>
			<CollectionForm heading="New collection" note="Name and description" action="?/create" submit="Create" {error} oncancel={close} onsaved={close} />
		</div>
	{/if}

	{#if data.collections.length}
		<ul class="list" aria-label="Collections" bind:this={list}>
			{#each data.collections as collection (collection.id)}
				<li in:rise animate:glide>
					<article class="card item" data-surface="solid" data-collection-card data-press>
						<div class="collage"><Collage images={collection.collage} name={collection.name} label="{collection.name} collage" /></div>
						<div class="info">
							<h2 class="name"><a href="/collections/{collection.id}">{collection.name}</a></h2>
							{#if collection.description}<p class="desc selectable">{collection.description}</p>{/if}
							<p class="count figures" data-count data-unit={collection.count === 1 ? 'entry' : 'entries'} aria-label="{collection.count} {collection.count === 1 ? 'entry' : 'entries'}">{collection.count}</p>
						</div>
					</article>
				</li>
			{/each}
		</ul>
	{:else if !creating && !leaving}
		<EmptyState title="No collections yet" body="Group entries of any kind into one place.">
			{#snippet action()}{@render add()}{/snippet}
		</EmptyState>
	{/if}
</div>

<style>
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
	}
	.list {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-4);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.item {
		position: relative;
		display: grid;
		align-content: start;
		gap: var(--space-4);
		padding: var(--space-4);
		min-inline-size: 0;
		block-size: 100%;
	}
	.collage :global(.collage) {
		aspect-ratio: 16 / 10;
	}
	.info {
		display: grid;
		gap: var(--space-2);
		align-content: start;
		min-inline-size: 0;
		padding-inline: var(--space-1);
	}
	.name {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}
	.name a {
		color: var(--ink);
		text-decoration: none;
	}
	.name a::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: var(--radius-card);
	}
	.name a:focus-visible {
		outline: 0;
	}
	.name a:focus-visible::after {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}
	.desc {
		color: var(--ink-secondary);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}
	.count {
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
	}
	.count::after {
		content: ' ' attr(data-unit);
	}
	@media (hover: hover) {
		.item:has(.name a:hover) {
			background: var(--surface-raised);
		}
	}
	@media (min-width: 640px) {
		.list {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (min-width: 1100px) {
		.list {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
</style>
