<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { COPY } from '#lib/copy.ts';
	import Button from '#lib/components/button/Button.svelte';
	import { listHref } from '#lib/entries/derive.ts';
	import { TYPES } from '#lib/entries/config.ts';
	import EntryForm from '#lib/entries/EntryForm.svelte';
	import FormHead from '#lib/entries/FormHead.svelte';
	import PreviewPanel from '#lib/entries/PreviewPanel.svelte';
	import SearchPanel from '#lib/entries/SearchPanel.svelte';
	import type { SearchResult } from '#lib/server/providers/types.ts';
	import { toast } from '#lib/shell/toast.ts';
	import type { EntryInput, MediaType } from '#lib/types.ts';
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
	const word = $derived(data.type === 'brand' || data.type === 'site' ? 'brand or shop' : config.label.toLowerCase());
	const lede = $derived(
		picked
			? 'Check the details, then save.'
			: data.manual
				? 'Fill in what you know; the title is all that is needed.'
				: config.provider
					? 'Search the catalogue, or add it by hand.'
					: config.preview
						? 'Paste a page link for a picture and a name, or fill the form by hand.'
						: 'Give the look a title and, if you have one, where it came from.'
	);
	// the cards settle on a full page load only, never on in-app navigation
	const settle = typeof document === 'undefined' || !document.documentElement.hasAttribute('data-hydrated');
</script>

<svelte:head>
	<title>New {config.label.toLowerCase()} · Creative Archive</title>
</svelte:head>

{#snippet entryForm(values: Partial<EntryInput>, extra: Record<string, string>, prefilled: boolean)}
	<!-- a failed save reloads the page at the action URL; without manual there it would swap the form for the search -->
	<EntryForm
		type={data.type}
		values={{ status: data.initialStatus, ...values }}
		errors={form?.errors}
		artists={data.artists}
		tags={data.tags}
		{action}
		hidden={extra}
		{prefilled}
		existingId={form?.existingId ?? null}
		cancelHref={listHref(data.type)}
	/>
{/snippet}

<FormHead type={data.type} last="Add" head="Add" {word} {lede} />

<div class="screen-body" data-settle={settle ? '' : undefined}>
	{#if data.manual}
		{@render entryForm({ title: data.title }, {}, false)}
	{:else if config.provider}
		<div hidden={picked !== null}>
			<SearchPanel type={data.type as MediaType} onpick={(result) => (picked = result)} />
		</div>
		{#if picked}
			<section class="picked card" data-surface="solid" aria-label="Picked result">
				<div class="row">
					<span class="art" class:square={config.domain === 'music'}>
						{#if picked.coverUrl}<img src={picked.coverUrl} alt="" referrerpolicy="no-referrer" />{/if}
					</span>
					<div class="text">
						<p class="title">{picked.title}</p>
						{#if picked.creator}<p class="meta">{picked.creator}</p>{/if}
					</div>
				</div>
				{#if picked.artist}
					<label class="check">
						<input type="checkbox" bind:checked={addArtist} />
						<span>Add artist</span>
					</label>
				{/if}
				<div><Button variant="quiet" size="s" onclick={() => (picked = null)}>Choose another</Button></div>
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
	.picked {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-4);
	}

	.row {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		min-inline-size: 0;
	}

	.art {
		display: block;
		flex: none;
		inline-size: 4.5rem;
		aspect-ratio: 2 / 3;
		border-radius: var(--radius-item);
		overflow: hidden;
		background: var(--surface-sunken);
		box-shadow: var(--ring-hairline);
	}

	.art.square {
		aspect-ratio: 1;
	}

	.art img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.text {
		display: grid;
		gap: var(--space-0-5);
		min-inline-size: 0;
	}

	.title {
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		font-weight: var(--type-title-weight);
		overflow-wrap: anywhere;
	}

	.meta {
		font-size: var(--type-caption-size);
		color: var(--ink-secondary);
		overflow-wrap: anywhere;
	}

	.check {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2-5);
		justify-self: start;
		min-block-size: max(var(--control-height-s), var(--target));
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
	}

	.check input {
		inline-size: 1.25rem;
		block-size: 1.25rem;
		accent-color: var(--accent);
	}

	@media (min-width: 768px) {
		.picked {
			padding: var(--space-4) var(--space-5);
		}
	}
</style>
