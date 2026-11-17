<script lang="ts">
	import { DOMAIN_LABEL, type Domain } from '#lib/domains.ts';
	import AddMenu from '#lib/domains/AddMenu.svelte';
	import SubTabs from '#lib/domains/SubTabs.svelte';
	import { LISTS } from '#lib/entries/config.ts';
	import Shelf from '#lib/entries/Shelf.svelte';
	import EmptyState from '#lib/components/empty-state/EmptyState.svelte';
	import Button from '#lib/components/button/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const LEDE: Record<Domain, string> = {
		music: 'Albums, artists and songs you love or want to hear.',
		animanga: 'What you watch and read, episode by episode.',
		books: 'The shelf you are in the middle of, and the one waiting.',
		fashion: 'Brands, shops, pieces you own and looks you keep.'
	};
	const FIRST: Record<Domain, { label: string; href: string }> = {
		music: { label: 'Add an album', href: '/add/album' },
		animanga: { label: 'Add an anime', href: '/add/anime' },
		books: { label: 'Add a book', href: '/add/book' },
		fashion: { label: 'Add a piece', href: '/add/piece' }
	};

	const domain = $derived(data.world as Domain);
	const label = $derived(DOMAIN_LABEL[domain]);
	const entries = $derived(data.shelves.filter((s) => s.key !== 'progress').reduce((n, s) => n + s.count, 0));
	const progress = $derived(data.shelves.find((s) => s.key === 'progress')?.count ?? 0);
	const listCounts = $derived(Object.fromEntries(data.shelves.flatMap((s) => (s.href ? [[s.href.split('/').pop()!, s.count]] : []))));
	const subTypes = $derived(LISTS[domain].length);
	const media = $derived(domain !== 'fashion');
</script>

<svelte:head><title>{label} · Creative Archive</title></svelte:head>

{#snippet facts(place: 'head' | 'after')}
	<ul class="screen-facts" class:after={place === 'after'} class:head={place === 'head'} data-surface="inverse" aria-label="{label} key facts">
		<li class="facts-caption">Whole domain</li>
		<li><span class="n">{entries}</span>{entries === 1 ? 'Entry' : 'Entries'}</li>
		{#if media}<li><span class="n">{progress}</span>In progress</li>{/if}
		<li><span class="n">{subTypes}</span>{subTypes === 1 ? 'Sub-type' : 'Sub-types'}</li>
	</ul>
{/snippet}

<div class="screen-head">
	<div class="screen-lead">
		<h1><em class="accent-word">{label}</em></h1>
		<p class="lede">{LEDE[domain]}</p>
		<SubTabs {domain} counts={listCounts} />
		<div class="actions"><AddMenu {domain} /></div>
	</div>
	{#if entries > 0}{@render facts('head')}{/if}
</div>

<div class="screen-body" data-settle>
	{#if entries === 0}
		<EmptyState title="No {label.toLowerCase()} yet" body="Add the first one to start the list.">
			{#snippet action()}
				<Button variant="secondary" href={FIRST[domain].href}><Icon name="plus" size={18} />{FIRST[domain].label}</Button>
			{/snippet}
		</EmptyState>
	{:else}
		{#each data.shelves as shelf (shelf.key)}
			<Shelf {shelf} typed={shelf.key === 'progress'} />
		{/each}
		{@render facts('after')}
	{/if}
</div>

<style>
	/* the lead grows up to the facts card */
	.screen-lead {
		max-inline-size: none;
	}

	@media (min-width: 768px) {
		.after {
			display: none;
		}
	}

	@media (max-width: 767px) {
		.head {
			display: none;
		}

		.after {
			grid-column: 1;
			grid-row: auto;
			justify-self: stretch;
			max-inline-size: none;
			margin-block-start: 0;
		}
	}
</style>
