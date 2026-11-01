<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { COPY } from '#lib/copy.ts';
	import { DOMAIN_LABEL } from '#lib/domains.ts';
	import { listHref } from '#lib/entries/derive.ts';
	import { TYPES } from '#lib/entries/config.ts';
	import EntryForm from '#lib/entries/EntryForm.svelte';
	import PreviewPanel from '#lib/entries/PreviewPanel.svelte';
	import SearchPanel from '#lib/entries/SearchPanel.svelte';
	import type { SearchResult } from '#lib/server/providers/types.ts';
	import { toast } from '#lib/shell/toast.ts';
	import type { EntryInput, MediaType } from '#lib/types.ts';
	import Button from '#lib/ui/Button.svelte';
	import Eyebrow from '#lib/ui/Eyebrow.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const config = $derived(TYPES[data.type]);

	let picked = $state<SearchResult | null>(null);
	let addArtist = $state(true);
	let previewImage = $state<string | null>(null);

	// the cover download happens on Save; the detail page has no notice of its own, so the redirect carries the
	// flag and the toast goes up before the navigation
	beforeNavigate(({ to }) => {
		if (to?.url.searchParams.get('coverFailed') === '1') toast(COPY.coverFailed);
	});

	function valuesOf(result: SearchResult): Partial<EntryInput> {
		const progress = Object.fromEntries(
			Object.entries(result.progressTotals ?? {}).map(([key, total]) => [key, { current: 0, total }])
		) as EntryInput['progress'];
		return {
			title: result.title,
			details: result.details,
			progress,
			artist: result.artist ? { id: null, name: result.artist.name } : undefined
		};
	}

	const hidden = $derived.by<Record<string, string>>(() => {
		if (!picked) return {};
		const out: Record<string, string> = { provider: picked.provider, externalId: picked.externalId };
		if (picked.coverUrl) out.coverUrl = picked.coverUrl;
		if (picked.artist) {
			out.artistExternalId = picked.artist.externalId;
			out.addArtist = addArtist ? '1' : '0';
			if (picked.artist.imageUrl) out.artistImageUrl = picked.artist.imageUrl;
		}
		return out;
	});

	const action = $derived(data.manual ? '?/save&manual=1' : '?/save');
</script>

<svelte:head>
	<title>New {config.label.toLowerCase()} · Creative Archive</title>
</svelte:head>

{#snippet entryForm(values: Partial<EntryInput>, extra: Record<string, string>, prefilled: boolean)}
	{#if form?.existingId}
		<p class="notice liquid">
			<a href="/entries/{form.existingId}">{COPY.already}</a>
		</p>
	{/if}
	<!-- a failed save reloads the page at the action URL; without manual there it would swap the form for the search -->
	<EntryForm
		type={data.type}
		{values}
		errors={form?.errors}
		artists={data.artists}
		tags={data.tags}
		{action}
		hidden={extra}
		{prefilled}
		cancelHref={listHref(data.type)}
	/>
{/snippet}

<div class="column page" data-column>
	<header data-page-header>
		<Eyebrow parts={[DOMAIN_LABEL[config.domain], 'Add']} tone="accent" />
		<h1>New <em>{config.label.toLowerCase()}</em></h1>
	</header>

	{#if data.manual}
		{@render entryForm({ title: data.title }, {}, false)}
	{:else if config.provider}
		<div hidden={picked !== null}>
			<SearchPanel type={data.type as MediaType} onpick={(result) => (picked = result)} />
		</div>
		{#if picked}
			<section class="picked liquid" aria-label="Picked result">
				<span class="thumb" class:square={config.domain === 'music'}>
					{#if picked.coverUrl}<img src={picked.coverUrl} alt="" referrerpolicy="no-referrer" />{/if}
				</span>
				<div class="text">
					<p class="title">{picked.title}</p>
					{#if picked.creator}<p class="meta">{picked.creator}</p>{/if}
					{#if picked.artist}
						<label class="check">
							<input type="checkbox" bind:checked={addArtist} />
							<span>Add artist</span>
						</label>
					{/if}
				</div>
				<Button variant="secondary" arrow={false} onclick={() => (picked = null)}>Choose another</Button>
			</section>
			{#key picked.externalId}
				{@render entryForm(valuesOf(picked), hidden, true)}
			{/key}
		{/if}
	{:else if config.preview}
		<PreviewPanel type={data.type} onimage={(image) => (previewImage = image)} />
		{@render entryForm({ title: data.title }, previewImage ? { previewImage } : {}, false)}
	{/if}
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--s-7);
		padding-block-start: var(--nav-top);
	}

	h1 {
		margin-block-start: var(--s-3);
	}

	.notice {
		margin: 0;
		padding: var(--s-4) var(--s-5);
		border-radius: var(--r-md);
	}

	.notice a {
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.picked {
		display: flex;
		align-items: center;
		gap: var(--s-4);
		padding: var(--s-4) var(--s-5);
		border-radius: var(--r-panel);
	}

	.thumb {
		flex: none;
		inline-size: 56px;
		aspect-ratio: 2 / 3;
		border-radius: var(--r-xs);
		overflow: hidden;
		background: var(--surface-2);
	}

	.thumb.square {
		aspect-ratio: 1;
	}

	.thumb img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.text {
		flex: 1;
		min-inline-size: 0;
	}

	.title {
		margin: 0;
		font-weight: 600;
		overflow-wrap: anywhere;
	}

	.meta {
		margin: 0;
		color: var(--ink-2);
		font-size: var(--t-small);
	}

	.check {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-block-size: 44px;
		font-size: var(--t-small);
		font-weight: 600;
	}

	.check input {
		inline-size: 20px;
		block-size: 20px;
		accent-color: var(--accent);
	}

	@media (max-width: 1023px) {
		.picked {
			flex-wrap: wrap;
		}
	}
</style>
