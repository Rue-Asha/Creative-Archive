<script lang="ts">
	import Cover from './Cover.svelte';
	import Icon from './Icon.svelte';
	import { base, entryHref, type Tone } from './data.ts';

	type Result = { title: string; by: string; year: number | null; exists?: boolean; cover?: boolean };
	type Props = { noun: string; mode?: 'results' | 'searching' | 'unavailable' | 'noresults' | 'empty'; query?: string; results?: Result[]; tone?: Tone };
	let { noun, mode = 'results', query = '', results = [], tone = 'square' }: Props = $props();

	const line = $derived(
		mode === 'searching' ? 'Searching…' : mode === 'unavailable' ? 'Search is unavailable right now' : mode === 'noresults' ? 'No results' : mode === 'results' ? `${results.length} results` : ''
	);
</script>

<section class="card w-form" data-surface="solid" aria-label="Search {noun}">
	<label class="w-field">
		<span class="w-label">Search {noun}</span>
		<input class="w-input" type="search" placeholder="Search {noun}s…" value={query} />
	</label>
	<p class="w-status-line" role="status">
		{#if mode === 'searching'}<Icon name="spinner" size={14} />{:else if mode === 'unavailable'}<Icon name="alert" size={14} />{/if}
		{line}
	</p>
	{#if mode === 'results'}
		<ul class="w-results" aria-label="Search results">
			{#each results as r (r.title)}
				<li>
					{#if r.exists}
						<a class="w-result" href={entryHref} aria-disabled="true">
							<Cover title={r.title} cover={r.cover === false ? null : 'cover'} {tone} />
							<span class="w-result-text"><span class="w-result-title">{r.title}</span><span class="w-result-by">{r.by}{r.year ? ` · ${r.year}` : ''}</span><span class="w-result-by">Already in your archive</span></span>
							<Icon name="link" size={16} />
						</a>
					{:else}
						<a class="w-result" href="{base}/add/picked">
							<Cover title={r.title} cover={r.cover === false ? null : 'cover'} {tone} />
							<span class="w-result-text"><span class="w-result-title">{r.title}</span><span class="w-result-by">{r.by}{r.year ? ` · ${r.year}` : ''}</span></span>
							<Icon name="chevron-right" size={16} />
						</a>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
	{#if mode !== 'empty' && mode !== 'searching'}
		<a class="w-btn" href="{base}/add/manual">Add manually</a>
	{:else}
		<p class="w-hint">Nothing to show until you type. Enter searches at once; typing waits 300 ms.</p>
	{/if}
</section>
