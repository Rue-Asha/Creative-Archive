<script lang="ts">
	import Cover from '../shell/Cover.svelte';
	import Icon from '../shell/Icon.svelte';
	import Glyph from '../list/Glyph.svelte';
	import { href, langOf } from '../shell/data.ts';
	import { photo } from '../../fixtures.ts';
	import { nested } from '../list/data.ts';

	type Result = { title: string; by: string; year: number | null; exists?: boolean; cover?: boolean };
	type Props = { noun: string; type?: string; mode?: 'results' | 'searching' | 'unavailable' | 'noresults' | 'empty'; query?: string; results?: Result[]; worst?: boolean; ratio?: string };
	let { noun, type = 'album', mode = 'results', query = '', results = [], worst = false, ratio = '1 / 1' }: Props = $props();

	const id = $props.id();
	const line = $derived(mode === 'searching' ? 'Searching…' : mode === 'unavailable' ? 'Search is unavailable right now' : mode === 'noresults' ? 'No results' : mode === 'results' ? `${results.length} results` : '');
	const COVERS = ['cover-ember', 'cover-violet', 'cover-moss', 'cover-dusk'];
</script>

<section class="card step" data-surface="solid" aria-label="Search {noun}">
	<div class="field pill">
		<label for="{id}-q">Search {noun}</label>
		<div class="control"><input id="{id}-q" type="search" placeholder="Search {noun}…" value={query} autocomplete="off" aria-describedby="{id}-s" /></div>
	</div>
	<p class="status" id="{id}-s" role="status">
		{#if mode === 'searching'}<span class="spin"><Glyph name="spinner" size={14} /></span>{:else if mode === 'unavailable'}<Icon name="alert" size={14} />{/if}
		{line}
	</p>
	{#if mode === 'results'}
		<ul class="results" aria-label="Search results">
			{#each results as r, i (r.title)}
				<li>
					{#if r.exists}
						<a class="row exists" href={href('entry', worst)} aria-label="{r.title}, already in your archive. Open it">
							<span class="main">
								<span class="leading"><Cover title={r.title} src={r.cover === false ? null : photo(COVERS[i % 4])} {ratio} /></span>
								<span class="text"><span class="title" lang={langOf(r.title)}>{r.title}</span><span class="meta">{r.by}{r.year ? ` · ${r.year}` : ''}</span><span class="meta had">Already in your archive</span></span>
								<Glyph name="link" size={16} />
							</span>
						</a>
					{:else}
						<a class="row interactive" href={nested('add/picked', worst, `type=${type}`)}>
							<span class="main">
								<span class="leading"><Cover title={r.title} src={r.cover === false ? null : photo(COVERS[i % 4])} {ratio} /></span>
								<span class="text"><span class="title" lang={langOf(r.title)} dir={langOf(r.title) === 'ar' ? 'rtl' : undefined}>{r.title}</span><span class="meta" lang={langOf(r.by)}>{r.by}{r.year ? ` · ${r.year}` : ''}</span></span>
								<Icon name="right" size={16} />
							</span>
						</a>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
	{#if mode !== 'empty' && mode !== 'searching'}
		<div><a class="btn secondary" href={nested('add/manual', worst, `type=${type}`)} data-press>Add manually</a></div>
	{:else if mode === 'empty'}
		<p class="hint">Nothing to show until you type. Enter searches at once; typing waits 300 ms.</p>
	{/if}
</section>

<style>
	.step { display: grid; gap: var(--space-4); padding: var(--space-5); }
	.status { display: flex; align-items: center; gap: var(--space-2); min-block-size: 1.4em; font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-secondary); }
	.status:empty { display: none; }
	.hint { font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-secondary); }
	.results { display: grid; gap: var(--space-2); margin: 0; padding: 0; list-style: none; }
	.row { background: var(--surface-sunken); box-shadow: none; text-decoration: none; }
	.row .leading { inline-size: 3.5rem; }
	.row .leading :global(.mono) { font-size: var(--type-display-s-size); }
	.row .leading :global(.year) { display: none; }
	.row .leading :global(.plate) { gap: 0; }
	.row .leading :global(.plate::before) { inset: var(--space-1); }
	.row .main { padding: var(--space-2) var(--space-3) var(--space-2) var(--space-2); }
	.row.exists { color: var(--ink-secondary); }
	.had { font-weight: var(--weight-semibold); color: var(--ink); }
	.row .title { overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
	
	@media (hover: hover) { .row.interactive:hover { background: var(--surface-control-solid); } }
	@media (max-width: 767px) { .step { padding: var(--space-4); } }
</style>
