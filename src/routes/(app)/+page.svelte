<script lang="ts">
	import { pushState } from '$app/navigation';
	import Button from '#lib/components/button/Button.svelte';
	import EmptyState from '#lib/components/empty-state/EmptyState.svelte';
	import { DOMAIN_LABEL, DOMAINS } from '#lib/domains.ts';
	import Shelf from '#lib/entries/Shelf.svelte';
	import Welcome from '#lib/home/Welcome.svelte';
	import PlusSheet from '#lib/shell/PlusSheet.svelte';
	import Collage from '#lib/ui/Collage.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const fmt = (n: number) => n.toLocaleString('en-US');
	const entries = (n: number) => `${fmt(n)} ${n === 1 ? 'entry' : 'entries'}`;

	const progress = $derived(data.shelves.find((s) => s.key === 'progress'));
	const recent = $derived(data.shelves.filter((s) => s.key.startsWith('recent-')));
	const counts = $derived(DOMAINS.map((domain) => ({ domain, count: recent.find((s) => s.key === `recent-${domain}`)?.count ?? 0 })));
	const total = $derived(counts.reduce((n, c) => n + c.count, 0));
	// the first collection with images leads
	const collections = $derived.by(() => {
		const lead = data.collections.find((c) => c.collage.length);
		return lead ? [lead, ...data.collections.filter((c) => c !== lead)] : data.collections;
	});
	const empty = $derived(total === 0);
	const facts = $derived(!empty || data.collections.length > 0);

	let sheet = $state(false);
	function openSheet() {
		pushState('', { plus: true } as App.PageState);
		sheet = true;
	}
</script>

<svelte:head><title>Creative Archive</title></svelte:head>

<div class="screen-head">
	<div class="screen-lead">
		<ul class="kicker"><li>Home</li><li>Your archive</li></ul>
		<h1>Everything you <em class="accent-word">love</em>, kept close</h1>
		<p class="lede">Music, anime and manga, books and fashion: what you want next, what you are in the middle of, and what stayed.</p>
		<div class="actions">
			<Button variant="primary" arrow class="add" aria-haspopup="dialog" aria-expanded={sheet} onclick={openSheet}>Add</Button>
			<Button href="/settings"><Icon name="settings" />Settings</Button>
		</div>
	</div>
	{#if facts}
		<ul class="screen-facts" data-surface="inverse" aria-label="Archive key facts">
			<li class="facts-caption">Whole archive</li>
			<li><span class="n">{fmt(total)}</span>{total === 1 ? 'Entry' : 'Entries'}</li>
			<li><span class="n">{fmt(progress?.count ?? 0)}</span>In progress</li>
			<li><span class="n">{fmt(data.collections.length)}</span>{data.collections.length === 1 ? 'Collection' : 'Collections'}</li>
		</ul>
	{/if}
</div>

<div class="screen-body">
	{#if empty}
		<Welcome />
	{:else}
		<section aria-labelledby="tiles-title">
			<h2 id="tiles-title" class="sr-only">Domains</h2>
			<ul class="tiles">
				{#each counts as { domain, count } (domain)}
					{@const hero = data.heroes?.[domain]}
					<li>
						<a class="tile" href="/{domain}" data-press>
							{#if hero != null}<img src="/images/{hero}" alt="" />{/if}
							<span class="foot">
								<span class="name">{DOMAIN_LABEL[domain]}</span>
								<span class="fact">{count === 0 ? 'No entries yet' : entries(count)}</span>
								<span class="go" aria-hidden="true"><Icon name="arrow-right" size={18} /></span>
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>

		{#if progress}<Shelf shelf={progress} typed />{/if}

		{#if recent.length}
			<section class="card recent" data-surface="solid" aria-labelledby="recent-title">
				<div class="card-head"><h2 id="recent-title">Recently added</h2></div>
				{#each recent as shelf (shelf.key)}
					<Shelf shelf={{ ...shelf, title: DOMAIN_LABEL[shelf.key.slice(7) as (typeof DOMAINS)[number]] }} variant="ruled" level={3} typed />
				{/each}
			</section>
		{/if}

		<section class="card" data-surface="solid" aria-labelledby="collections-title">
			<div class="card-head">
				<h2 id="collections-title">Collections</h2>
				<Button size="xs" href="/collections">All collections<Icon name="arrow-right" size={16} /></Button>
			</div>
			{#if collections.length}
				<ul class="collections">
					{#each collections as c, i (c.id)}
						<li>
							<a class="collection" href="/collections/{c.id}">
								<Collage images={c.collage} name={c.name} label="{c.name} collage" />
								<span class="cname">{c.name}</span>
								<span class="note">{entries(c.count)}</span>
								{#if i === 0 && c.description}<span class="desc">{c.description}</span>{/if}
							</a>
						</li>
					{/each}
				</ul>
			{:else}
				<EmptyState title="No collections yet" body="Group entries of any kind into one place.">
					{#snippet action()}<Button href="/collections"><Icon name="plus" />New collection</Button>{/snippet}
				</EmptyState>
			{/if}
		</section>
	{/if}
</div>

<PlusSheet scope="all" bind:open={sheet} />

<style>
	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3);
	}

	.actions :global(.add) {
		display: none;
	}

	@media (min-width: 1024px) {
		.actions :global(.add) {
			display: inline-flex;
		}
	}

	/* beside the facts card the lead column grows up to it instead of stopping at --lead-max */
	@media (min-width: 1100px) {
		:global(.screen-head:has(> .screen-facts) > .screen-lead) {
			max-inline-size: none;
		}
	}

	.card {
		display: grid;
		gap: var(--space-5);
		padding: var(--space-5);
		min-inline-size: 0;
	}

	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.tiles {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 9.5rem), 1fr));
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.tile {
		position: relative;
		display: grid;
		align-items: end;
		aspect-ratio: 4 / 4.4;
		min-inline-size: 0;
		overflow: hidden;
		isolation: isolate;
		border-radius: var(--radius-card-s);
		background: var(--surface-field);
		box-shadow: var(--elevation-card);
		color: var(--ink);
		text-decoration: none;
	}

	.tile img {
		position: absolute;
		inset: 0;
		z-index: -1;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.foot {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-areas: 'name go' 'fact go';
		align-items: center;
		gap: var(--space-1) var(--space-2);
		margin: var(--space-2);
		padding: var(--space-3) var(--space-2) var(--space-3) var(--space-4);
		border-radius: var(--radius-panel);
		background: var(--surface-glass-strong);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--shadow-rim);
	}

	.name {
		grid-area: name;
		min-inline-size: 0;
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.fact {
		grid-area: fact;
		justify-self: start;
		max-inline-size: 100%;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		padding-inline-start: var(--space-2);
		box-shadow: var(--rule-start);
		font-size: var(--type-overline-size);
		line-height: var(--type-overline-line);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--weight-medium);
		text-transform: uppercase;
		font-variant-numeric: var(--numeric-figures);
		color: var(--ink-secondary);
	}

	.go {
		grid-area: go;
		display: grid;
		place-items: center;
		inline-size: var(--control-height-s);
		block-size: var(--control-height-s);
		border-radius: var(--radius-round);
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}

	@media (min-width: 768px) {
		.tiles {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--space-4);
		}

		.tile {
			aspect-ratio: 16 / 7;
		}
	}

	@media (min-width: 1024px) {
		.tiles {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}

		.tile {
			aspect-ratio: 4 / 4.4;
		}
	}

	@media (max-width: 767px) {
		.foot {
			grid-template-areas: 'name go' 'fact fact';
			margin: var(--space-1-5);
			padding: var(--space-2-5) var(--space-2) var(--space-2-5) var(--space-3);
		}

		.fact {
			letter-spacing: 0.04em;
		}

		.name {
			font-size: var(--type-body-size);
		}
	}

	@media (hover: hover) {
		.tile:hover .foot {
			background: var(--surface-raised);
		}
	}

	.recent > :global(.shelf + .shelf) {
		padding-block-start: var(--space-5);
		box-shadow: var(--rule-above);
	}

	.collections {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr));
		gap: var(--space-5) var(--space-4);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.collection {
		display: grid;
		align-content: start;
		gap: var(--space-1);
		min-inline-size: 0;
		color: inherit;
		text-decoration: none;
	}

	.collection :global(.collage) {
		aspect-ratio: 4 / 3;
		margin-block-end: var(--space-1);
	}

	.cname {
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		font-weight: var(--type-title-weight);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
	}

	.note {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
		font-variant-numeric: var(--numeric-figures);
	}

	.desc {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
		overflow-wrap: anywhere;
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		color: var(--ink-secondary);
	}

	@media (hover: hover) {
		.collection:hover .cname {
			text-decoration: underline;
			text-underline-offset: 0.2em;
		}
	}
</style>
