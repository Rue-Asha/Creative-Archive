<script lang="ts">
	import { base, entries as entriesText, fmt, link } from '../shell/data.ts';
	import Icon from '../shell/Icon.svelte';
	import Shelf from '../shell/Shelf.svelte';
	import Collage from './Collage.svelte';
	import type { HomeView } from './data.ts';

	type Part = 'tiles' | 'progress' | 'recent' | 'collections' | 'welcome';
	type Props = { view: HomeView; parts?: Part[]; noImages?: boolean; recentMode?: 'shelves' | 'switch'; limit?: number };
	let { view, parts = ['tiles', 'progress', 'recent', 'collections'], noImages = false, recentMode = 'shelves', limit = 12 }: Props = $props();

	const worst = $derived(view.worst);
	const withEntries = $derived(view.recent.filter((r) => r.count > 0));
	let picked = $state<string | null>(null);
	const active = $derived(withEntries.find((r) => r.domain === picked) ?? withEntries[0]);
	const welcome = [
		['Music', 'Albums, artists and songs you love or want to hear.', 'Add your first album'],
		['Animanga', 'What you watch and read, episode by episode.', 'Add your first anime'],
		['Books', 'The shelf you are in the middle of, and the one waiting.', 'Add your first book'],
		['Fashion', 'Brands, shops, pieces you own and looks you keep.', 'Add your first piece']
	];
</script>

<div class="body">
	{#each parts as part (part)}
		{#if part === 'welcome'}
			<section class="fw-card welcome" aria-labelledby="welcome-h">
				<div class="fw-card-head"><h2 id="welcome-h">Your archive starts here</h2></div>
				<ul>
					{#each welcome as [name, line, cta] (name)}
						<li>
							<h3>{name}</h3>
							<p>{line}</p>
							<a class="fw-chip" href="{base}/wire/add">{cta}<Icon name="arrow" size={16} /></a>
						</li>
					{/each}
				</ul>
				<p class="fw-note">The round + in the phone bar and Add on the desktop open every type.</p>
			</section>
		{:else if part === 'tiles'}
			<section aria-labelledby="tiles-h" class="tiles-section">
				<h2 id="tiles-h" class="sr-only">Domains</h2>
				<ul class="tiles">
					{#each view.tiles as tile (tile.id)}
						<li>
							<a class="tile" href={link('wire/domain', worst, `d=${tile.id}`)} data-hero={tile.hero}>
								<span class="photo" aria-hidden="true">{#if tile.hero}<Icon name="image" size={24} />{/if}</span>
								<span class="foot">
									<span class="name">{tile.label}</span>
									<span class="fw-note count">{tile.count === 0 ? 'No entries yet' : entriesText(tile.count)}</span>
									<span class="go" aria-hidden="true"><Icon name="arrow" size={18} /></span>
								</span>
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{:else if part === 'progress' && view.inProgress.length}
			<section class="fw-card">
				<Shelf title="In progress" count={view.inProgressCount} list={view.inProgress.slice(0, limit)} steps {noImages} />
			</section>
		{:else if part === 'recent' && withEntries.length}
			<section class="fw-card" aria-labelledby="recent-h">
				<div class="fw-card-head"><h2 id="recent-h">Recently added</h2></div>
				{#if recentMode === 'shelves'}
					{#each withEntries as r (r.domain)}
						<Shelf title={r.label} count={r.count} list={r.list.slice(0, limit)} seeAll="wire/domain?d={r.domain}" level="h3" {noImages} />
					{/each}
				{:else if active}
					<div class="switch" role="group" aria-label="Domain">
						{#each withEntries as r (r.domain)}
							<button type="button" class="fw-chip" aria-pressed={r.domain === active.domain} onclick={() => (picked = r.domain)}>{r.label}<span class="n">{fmt(r.count)}</span></button>
						{/each}
					</div>
					<Shelf title={active.label} count={active.count} list={active.list.slice(0, limit)} seeAll="wire/domain?d={active.domain}" level="h3" {noImages} />
				{/if}
			</section>
		{:else if part === 'collections'}
			<section class="fw-card" aria-labelledby="col-h">
				<div class="fw-card-head">
					<h2 id="col-h">Collections</h2>
					{#if view.collections.length}<a class="fw-chip" href={link('wire/collections', worst)}>All collections<Icon name="arrow" size={16} /></a>{/if}
				</div>
				{#if view.collections.length}
					<ul class="collections">
						{#each view.collections as c (c.id)}
							<li>
								<a class="collection" href={link('wire/collection', worst)}>
									<Collage name={c.name} covers={noImages ? [] : c.covers} />
									<span class="cname" dir="auto">{c.name}</span>
									<span class="fw-note">{entriesText(c.count)}</span>
								</a>
							</li>
						{/each}
					</ul>
				{:else}
					<div class="fw-empty">
						<h3>No collections yet</h3>
						<p>Group entries of any kind into one place.</p>
						<a class="fw-btn" href={link('wire/collections', worst)}><Icon name="plus" size={18} />New collection</a>
					</div>
				{/if}
			</section>
		{/if}
	{/each}
</div>

<style>
	.body { display: grid; gap: var(--space-5); min-inline-size: 0; }
	.sr-only { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
	.tiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-3); margin: 0; padding: 0; list-style: none; }
	@media (min-width: 768px) { .tiles { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-4); } }
	.tile { display: grid; gap: var(--space-2); padding: var(--space-2) var(--space-2) var(--space-3); min-inline-size: 0; border-radius: var(--radius-card-s); background: var(--surface-card); border: var(--stroke-hairline) solid var(--hairline); color: var(--ink); text-decoration: none; }
	.photo { display: grid; place-items: center; aspect-ratio: 16 / 10; border-radius: var(--radius-panel); background: var(--surface-field); color: var(--ink-muted); }
	.tile[data-hero="true"] .photo { background: var(--surface-plate-2); }
	.foot { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: 'name name' 'count go'; align-items: center; gap: var(--space-1) var(--space-2); padding-inline: var(--space-2) var(--space-1); }
	.name { grid-area: name; }
	.count { grid-area: count; }
	.go { grid-area: go; }
	.name { font-family: var(--font-display); font-weight: var(--weight-display); font-size: var(--type-display-s-size); line-height: var(--type-display-s-line); overflow-wrap: anywhere; }
	.go { display: grid; place-items: center; inline-size: var(--control-height-s); block-size: var(--control-height-s); border-radius: var(--radius-round); background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.collections { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr)); gap: var(--space-4); margin: 0; padding: 0; list-style: none; }
	.collection { display: grid; gap: var(--space-1); color: inherit; text-decoration: none; min-inline-size: 0; }
	.collection :global(.collage) { margin-block-end: var(--space-1); }
	.cname { font-size: var(--type-title-size); line-height: var(--type-title-line); font-weight: var(--type-title-weight); overflow-wrap: anywhere; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; }
	.welcome ul { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr)); gap: var(--space-4); margin: 0; padding: 0; list-style: none; }
	.welcome li { display: grid; gap: var(--space-2); justify-items: start; padding: var(--space-4); border-radius: var(--radius-panel); background: var(--surface-sunken); min-inline-size: 0; }
	.welcome h3 { font-size: var(--type-title-size); font-weight: var(--type-title-weight); }
	.welcome p { color: var(--ink-secondary); }
	.switch { display: flex; flex-wrap: wrap; gap: var(--space-2); }
</style>
