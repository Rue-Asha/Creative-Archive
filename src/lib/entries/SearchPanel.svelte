<script lang="ts">
	import { onDestroy } from 'svelte';
	import Button from '#lib/components/button/Button.svelte';
	import Field from '#lib/components/field/Field.svelte';
	import ListRow from '#lib/components/list-row/ListRow.svelte';
	import { COPY } from '#lib/copy.ts';
	import { TYPES } from '#lib/entries/config.ts';
	import type { SearchResult } from '#lib/server/providers/types.ts';
	import type { MediaType } from '#lib/types.ts';
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

	function change(event: Event & { currentTarget: HTMLInputElement }) {
		query = event.currentTarget.value;
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

<section class="search card" data-surface="solid" aria-label="Search">
	<Field
		label="Search {config.label.toLowerCase()}"
		type="search"
		bind:value={query}
		oninput={change}
		onkeydown={now}
		placeholder="Search {config.label.toLowerCase()}…"
		autocomplete="off"
		autocapitalize="off"
		spellcheck={false}
	/>

	<div class="status" role="status">
		{#if phase === 'loading'}
			<p>Searching…</p>
		{:else if phase === 'error'}
			<p>{COPY.searchFailed}</p>
		{:else if phase === 'done' && results.length === 0}
			<p>{COPY.noResults}</p>
		{/if}
	</div>

	{#if phase === 'done' && results.length > 0}
		<ul class="results" aria-label="Search results">
			{#each results as result (result.externalId)}
				{@const meta = [result.creator, result.year !== null ? String(result.year) : null, result.existingId !== undefined ? COPY.already : null].filter(Boolean).join(' · ')}
				<li>
					{#snippet leading()}
						<span class="cover" class:square>
							{#if result.coverUrl}
								<img src={result.coverUrl} alt="" loading="lazy" referrerpolicy="no-referrer" />
							{:else}
								<ImagePlaceholder title={result.title} />
							{/if}
						</span>
					{/snippet}
					{#if result.existingId !== undefined}
						<ListRow title={result.title} {meta} href="/entries/{result.existingId}" {leading} />
					{:else}
						<ListRow title={result.title} {meta} onclick={() => onpick(result)} {leading} />
					{/if}
				</li>
			{/each}
		</ul>
	{/if}

	<div><Button variant="secondary" href={manualHref}>{COPY.addManually}</Button></div>
</section>

<style>
	.search {
		display: grid;
		gap: var(--space-4);
		padding: var(--space-4);
	}

	.status:empty {
		display: none;
	}

	.status p {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}

	.results {
		display: grid;
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.cover {
		display: block;
		inline-size: 3.5rem;
		aspect-ratio: 2 / 3;
		border-radius: var(--radius-item);
		overflow: hidden;
		background: var(--surface-sunken);
	}

	.cover.square {
		aspect-ratio: 1;
	}

	.cover img {
		display: block;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	@media (min-width: 768px) {
		.search {
			padding: var(--space-5);
		}
	}
</style>
