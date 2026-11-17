<script lang="ts">
	import { page } from '$app/state';
	import { photo, type PhotoWorld } from '../../fixtures.ts';
	import Collage from '../shell/Collage.svelte';
	import Icon from '../shell/Icon.svelte';
	import Shelf from '../shell/Shelf.svelte';
	import { DOMAIN_LABEL, entries as entriesText, fmt, href, langOf, sectionHref, sections } from '../shell/data.ts';
	import { WELCOME, type HomeView } from './data.ts';

	type Part = 'tiles' | 'progress' | 'recent' | 'collections' | 'welcome';
	type Props = { view: HomeView; parts?: Part[]; noImages?: boolean; limit?: number; settle?: boolean };
	let { view, parts = ['tiles', 'progress', 'recent', 'collections'], noImages = false, limit = 12, settle = false }: Props = $props();

	const worst = $derived(view.worst);
	const withEntries = $derived(view.recent.filter((r) => r.count > 0));
	const photos = $derived((page.data as { photos?: Record<PhotoWorld, string> }).photos);
	const domainLink = (id: string) => sectionHref(sections.find((s) => s.id === id)!, worst);
</script>

<div class="screen-body" data-settle={settle ? '' : undefined}>
	{#each parts as part (part)}
		{#if part === 'welcome'}
			<section class="card welcome" data-surface="solid" aria-labelledby="welcome-h">
				<div class="card-head"><h2 id="welcome-h">Your archive starts here</h2></div>
				<ul>
					{#each WELCOME as [id, line, cta] (id)}
						<li>
							<h3 class="ruled">{DOMAIN_LABEL[id]}</h3>
							<p>{line}</p>
							<a class="btn secondary s" href={href('add', worst, `type=${id === 'music' ? 'album' : id === 'animanga' ? 'anime' : id === 'books' ? 'book' : 'piece'}`)} data-press>{cta}<Icon name="arrow" size={16} /></a>
						</li>
					{/each}
				</ul>
			</section>
		{:else if part === 'tiles'}
			<section aria-labelledby="tiles-h">
				<h2 id="tiles-h" class="sr-only">Domains</h2>
				<ul class="tiles">
					{#each view.tiles as tile (tile.id)}
						<li>
							<a class="tile" href={domainLink(tile.id)} data-hover data-hero={tile.hero}>
								{#if tile.hero && photos?.[tile.id]}<img src={photo(photos[tile.id])} alt="" />{/if}
								<span class="foot">
									<span class="name">{tile.label}</span>
									<span class="fact">{tile.count === 0 ? 'No entries yet' : entriesText(tile.count)}</span>
									<span class="go" aria-hidden="true"><Icon name="arrow" size={18} /></span>
								</span>
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{:else if part === 'progress' && view.inProgress.length}
			<Shelf title="In progress" count={view.inProgressCount} list={view.inProgress.slice(0, limit)} steps {noImages} {worst} level="h2" heading="card" />
		{:else if part === 'recent' && withEntries.length}
			<section class="card recent" data-surface="solid" aria-labelledby="recent-h">
				<div class="card-head"><h2 id="recent-h">Recently added</h2></div>
				{#each withEntries as r (r.domain)}
					<Shelf title={r.label} count={r.count} list={r.list.slice(0, limit)} seeAll={domainLink(r.domain)} ratio={r.domain === 'music' ? '1 / 1' : '3 / 4'} {noImages} {worst} />
				{/each}
			</section>
		{:else if part === 'collections'}
			<section class="card" data-surface="solid" aria-labelledby="col-h">
				<div class="card-head">
					<h2 id="col-h">Collections</h2>
					{#if view.collections.length}<a class="btn secondary s" href={href('collections', worst)} data-press>All collections<Icon name="arrow" size={16} /></a>{/if}
				</div>
				{#if view.collections.length}
					<ul class="collections">
						{#each view.collections as c, i (c.id)}
							<li>
								<a class="collection" href={href('collection', worst)} data-hover>
									<Collage name={c.name} covers={noImages ? [] : c.covers} />
									<span class="cname" lang={langOf(c.name)}>{c.name}</span>
									<span class="note">{entriesText(c.count)}</span>
									{#if i === 0 && c.description}<span class="desc">{c.description}</span>{/if}
								</a>
							</li>
						{/each}
					</ul>
				{:else}
					<div class="empty" data-surface="solid">
						<h3 class="title">No collections yet</h3>
						<p class="body">Group entries of any kind into one place.</p>
						<div class="action"><a class="btn secondary" href={href('collections', worst)} data-press><Icon name="plus" />New collection</a></div>
					</div>
				{/if}
			</section>
		{/if}
	{/each}
</div>

<style>
	.card { display: grid; gap: var(--space-5); padding: var(--space-5); min-inline-size: 0; }
	.card-head { align-items: center; }
	.sr-only { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

	.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 9.5rem), 1fr)); gap: var(--space-3); margin: 0; padding: 0; list-style: none; }
	@media (min-width: 768px) { .tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-4); } .tiles .tile { aspect-ratio: 16 / 7; } }
	@media (min-width: 1024px) { .tiles .tile { aspect-ratio: 4 / 4.4; } .tiles { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-4); } }
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
	.tile img { position: absolute; inset: 0; z-index: -1; inline-size: 100%; block-size: 100%; object-fit: cover; }
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
	.name { grid-area: name; min-inline-size: 0; font-family: var(--font-display); font-weight: var(--weight-display); font-size: var(--type-display-s-size); line-height: var(--type-display-s-line); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.fact { grid-area: fact; justify-self: start; max-inline-size: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-inline-start: var(--space-2); box-shadow: var(--rule-start); font-size: var(--type-overline-size); line-height: var(--type-overline-line); letter-spacing: var(--type-overline-tracking); font-weight: var(--weight-medium); text-transform: uppercase; font-variant-numeric: var(--numeric-figures); color: var(--ink-secondary); }
	.go { grid-area: go; display: grid; place-items: center; inline-size: var(--control-height-s); block-size: var(--control-height-s); border-radius: var(--radius-round); background: var(--surface-inverse); color: var(--ink-on-inverse); }
	@media (max-width: 767px) {
		.foot { grid-template-areas: 'name go' 'fact fact'; margin: var(--space-1-5); padding: var(--space-2-5) var(--space-2) var(--space-2-5) var(--space-3); }
		.fact { letter-spacing: 0.04em; }
		.name { font-size: var(--type-body-size); }
	}
	@media (hover: hover) {
		.tile:hover .foot { background: var(--surface-raised); }
	}

	.recent > :global(.shelf + .shelf) { padding-block-start: var(--space-5); box-shadow: var(--rule-above); }
	.collections { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr)); gap: var(--space-5) var(--space-4); margin: 0; padding: 0; list-style: none; }
	.collection { display: grid; align-content: start; gap: var(--space-1); color: inherit; text-decoration: none; min-inline-size: 0; }
	.collection :global(.collage) { margin-block-end: var(--space-1); }
	.cname { font-size: var(--type-title-size); line-height: var(--type-title-line); font-weight: var(--type-title-weight); overflow-wrap: anywhere; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; }
	.note { font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-secondary); font-variant-numeric: var(--numeric-figures); }
	.desc { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; line-clamp: 3; overflow: hidden; overflow-wrap: anywhere; font-size: var(--type-body-s-size); line-height: var(--type-body-s-line); color: var(--ink-secondary); }
	@media (hover: hover) {
		.collection:hover .cname { text-decoration: underline; text-underline-offset: 0.2em; }
	}

	.welcome ul { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: var(--space-4); margin: 0; padding: 0; list-style: none; }
	.welcome li { display: grid; align-content: start; gap: var(--space-2-5); justify-items: start; padding: var(--space-4); border-radius: var(--radius-panel); background: var(--surface-sunken); min-inline-size: 0; }
	.welcome p { color: var(--ink-secondary); }
</style>
