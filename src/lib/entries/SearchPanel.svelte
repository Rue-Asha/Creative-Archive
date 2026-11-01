<script lang="ts">
	import { onDestroy } from 'svelte';
	import { COPY } from '#lib/copy.ts';
	import { TYPES } from '#lib/entries/config.ts';
	import type { SearchResult } from '#lib/server/providers/types.ts';
	import type { MediaType } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';

	const DEBOUNCE_MS = 300;

	let { type, onpick }: { type: MediaType; onpick: (result: SearchResult) => void } = $props();

	const config = $derived(TYPES[type]);
	const square = $derived(config.domain === 'music');

	let query = $state('');
	let phase = $state<'idle' | 'loading' | 'done' | 'error'>('idle');
	let results = $state<SearchResult[]>([]);
	let timer: ReturnType<typeof setTimeout> | undefined;
	let controller: AbortController | undefined;

	const manualHref = $derived(`?manual=1${query.trim() ? `&title=${encodeURIComponent(query.trim())}` : ''}`);

	async function run(q: string) {
		controller = new AbortController();
		try {
			const res = await fetch(`/add/${type}/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
			const body: { results: SearchResult[] } | { error: string } = await res.json();
			if ('error' in body) {
				phase = 'error';
			} else {
				results = body.results;
				phase = 'done';
			}
		} catch (e) {
			if (e instanceof DOMException && e.name === 'AbortError') return;
			phase = 'error';
		}
	}

	function change() {
		clearTimeout(timer);
		controller?.abort();
		const q = query.trim();
		if (!q) {
			phase = 'idle';
			return;
		}
		phase = 'loading';
		timer = setTimeout(() => run(q), DEBOUNCE_MS);
	}

	function now(event: KeyboardEvent) {
		const q = query.trim();
		if (event.key !== 'Enter' || !q) return;
		event.preventDefault();
		clearTimeout(timer);
		controller?.abort();
		phase = 'loading';
		void run(q);
	}

	onDestroy(() => {
		clearTimeout(timer);
		controller?.abort();
	});
</script>

<section class="search liquid" aria-label="Search">
	<div class="box">
		<label class="visually-hidden" for="search-q">Search {config.label.toLowerCase()}</label>
		<span class="icon" aria-hidden="true"><Icon name="search" size={20} /></span>
		<input
			id="search-q"
			type="search"
			bind:value={query}
			oninput={change}
			onkeydown={now}
			placeholder="Search {config.label.toLowerCase()}…"
			autocomplete="off"
			autocapitalize="off"
			spellcheck="false"
		/>
	</div>

	<div class="status" role="status">
		{#if phase === 'loading'}
			<p class="note">Searching…</p>
		{:else if phase === 'error'}
			<p class="note">{COPY.searchFailed}</p>
		{:else if phase === 'done' && results.length === 0}
			<p class="note">{COPY.noResults}</p>
		{/if}
	</div>

	{#if phase === 'done' && results.length > 0}
		<ul class="results" aria-label="Search results">
			{#each results as result (result.externalId)}
				<li>
					{#snippet row()}
						<span class="cover" class:square>
							{#if result.coverUrl}
								<img src={result.coverUrl} alt="" loading="lazy" referrerpolicy="no-referrer" />
							{:else}
								<ImagePlaceholder title={result.title} tint={null} />
							{/if}
						</span>
						<span class="text">
							<span class="title">{result.title}</span>
							{#if result.creator}<span class="meta">{result.creator}</span>{/if}
							{#if result.year !== null}<span class="meta tnum">{result.year}</span>{/if}
							{#if result.existingId !== undefined}<span class="already">{COPY.already}</span>{/if}
						</span>
					{/snippet}
					{#if result.existingId !== undefined}
						<a class="row" href="/entries/{result.existingId}">{@render row()}</a>
					{:else}
						<button type="button" class="row" onclick={() => onpick(result)}>{@render row()}</button>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}

	<p class="manual"><a href={manualHref}>{COPY.addManually}</a></p>
</section>

<style>
	.search {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		padding: var(--s-6);
		border-radius: var(--r-panel);
	}

	.box {
		position: relative;
	}

	.icon {
		position: absolute;
		inset-inline-start: var(--s-4);
		inset-block: 0;
		display: grid;
		place-items: center;
		color: var(--ink-2);
		pointer-events: none;
	}

	input {
		inline-size: 100%;
		min-block-size: 52px;
		padding: 0 var(--s-5) 0 calc(var(--s-4) + 28px);
		border-radius: var(--r-pill);
		border: 1px solid var(--line);
		background: var(--glass-thin);
		font-size: 16px;
		transition: border-color var(--d-fast) var(--ease-out);
	}

	input::placeholder {
		color: var(--ink-2);
	}

	input:focus-visible {
		border-color: var(--accent);
	}

	.status:empty {
		display: none;
	}

	.note {
		margin: 0;
		color: var(--ink-2);
		font-size: var(--t-small);
		padding-inline: var(--s-2);
	}

	.results {
		display: grid;
		gap: var(--s-2);
	}

	.row {
		display: flex;
		align-items: center;
		gap: var(--s-4);
		inline-size: 100%;
		min-block-size: 64px;
		padding: var(--s-2) var(--s-3);
		border: 1px solid transparent;
		border-radius: var(--r-md);
		background: transparent;
		color: var(--ink);
		text-align: start;
		font: inherit;
		cursor: pointer;
		transition:
			background var(--d-fast) var(--ease-out),
			border-color var(--d-fast) var(--ease-out);
	}

	.row:hover {
		background: var(--accent-soft);
		border-color: var(--line);
	}

	.cover {
		flex: none;
		inline-size: 48px;
		aspect-ratio: 2 / 3;
		border-radius: var(--r-xs);
		overflow: hidden;
		background: var(--surface-2);
	}

	.cover.square {
		aspect-ratio: 1;
	}

	.cover img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.text {
		display: flex;
		flex-direction: column;
		min-inline-size: 0;
	}

	.title {
		font-weight: 600;
		overflow-wrap: anywhere;
	}

	.meta {
		color: var(--ink-2);
		font-size: var(--t-small);
	}

	.already {
		margin-block-start: 2px;
		color: var(--accent);
		font-size: var(--t-small);
		font-weight: 600;
	}

	.manual {
		margin: 0;
		padding-inline: var(--s-2);
		font-size: var(--t-small);
	}

	.manual a {
		color: var(--ink);
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
