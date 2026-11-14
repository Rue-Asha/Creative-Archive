<script lang="ts">
	import { applyAction, deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import AddToCollection from '#lib/collections/AddToCollection.svelte';
	import { TYPES } from '#lib/entries/config.ts';
	import { MARK_DONE } from '#lib/copy.ts';
	import { atTotal, statusLabel } from '#lib/entries/derive.ts';
	import ArtistWorks from '#lib/entries/ArtistWorks.svelte';
	import DeleteEntry from '#lib/entries/DeleteEntry.svelte';
	import DetailPanel from '#lib/entries/DetailPanel.svelte';
	import { clampProgress } from '#lib/entries/progress.ts';
	import { createWriteQueue } from '#lib/shell/writeQueue.ts';
	import type { Entry, ProgressKey, Status } from '#lib/types.ts';
	import Button from '#lib/ui/Button.svelte';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';
	import ProgressControl from '#lib/ui/ProgressControl.svelte';
	import StarRating from '#lib/ui/StarRating.svelte';
	import StatusPill from '#lib/ui/StatusPill.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const entry = $derived(data.entry);
	const config = $derived(TYPES[entry.type]);
	const ratio = $derived(config.domain === 'music' ? '1' : entry.type === 'book' || entry.type === 'manga' ? '2 / 3' : '4 / 5');

	// Controls answer at once from `local` while their writes queue up one by one; when the queue is empty the
	// reloaded entry takes over again.
	let local = $state<{ status?: Status | null; rating?: number | null; progress?: Entry['progress'] }>({});
	const enqueue = createWriteQueue(() => (local = {}));

	const status = $derived(local.status !== undefined ? local.status : entry.status);
	const rating = $derived(local.rating !== undefined ? local.rating : entry.rating);
	const progress = $derived(local.progress ?? entry.progress);
	const PROGRESS_LABELS: Record<ProgressKey, string> = { episodes: 'Episodes', chapters: 'Chapters', volumes: 'Volumes' };
	// the first key is the one that finishes the work: episodes, or chapters (not volumes)
	const finishing = $derived(config.progress[0] ? progress[config.progress[0]] : undefined);
	const statusOptions = $derived(
		(config.status === 'piece' ? ['wishlist', 'owned', 'gone'] : ['none', 'want', 'progress', 'done', 'dropped']).map((value) => ({
			value,
			label: statusLabel(entry.type, value as Status)!
		}))
	);

	function send(action: string, fields: Record<string, string>) {
		enqueue(async () => {
			const body = new FormData();
			for (const [key, value] of Object.entries(fields)) body.set(key, value);
			const res = await fetch(`?/${action}`, {
				method: 'POST',
				body,
				headers: { accept: 'application/json', 'x-sveltekit-action': 'true' }
			});
			const result = deserialize(await res.text());
			if (result.type === 'success') await invalidateAll();
			else if (result.type === 'redirect') await applyAction(result);
			else throw new Error(result.type);
		});
	}

	function moveProgress(key: ProgressKey, next: number, fields: Record<string, string>) {
		const p = progress[key]!;
		local.progress = { ...progress, [key]: { ...p, current: clampProgress(next, p.total) } };
		if (status === 'want' && next > 0) local.status = 'progress';
		send('progress', { key, ...fields });
	}

	function setRating(next: number | null) {
		local.rating = next;
		send('rating', { rating: next === null ? '' : String(next) });
	}

	function setStatus(next: string) {
		local.status = next as Status;
		send('status', { status: next });
	}
</script>

<svelte:head><title>{entry.title} · Creative Archive</title></svelte:head>

<div class="detail">
	<div class="backdrop" aria-hidden="true">
		{#if entry.imageId !== null}<img src="/images/{entry.imageId}" alt="" />{/if}
	</div>
	<div class="column layout" data-column>
		<div class="cover" data-cover-id={entry.id} style:aspect-ratio={ratio}>
			{#if entry.imageId !== null}
				<img src="/images/{entry.imageId}" alt={entry.title} />
			{:else}
				<ImagePlaceholder title={entry.title} tint={null} />
			{/if}
		</div>
		<DetailPanel {entry}>
			{#snippet controls()}
				{#if status}<StatusPill label="Status" options={statusOptions} value={status} onchange={setStatus} />{/if}
				{#if finishing && atTotal(finishing) && status !== 'done'}
					<Button variant="accent" onclick={() => setStatus('done')}>{MARK_DONE[entry.type as 'anime' | 'manga']}</Button>
				{/if}
				{#if config.ratable}
					<div class="rating">
						<StarRating value={rating} mode="input" label="Rating" onchange={setRating} />
						{#if rating !== null}<button type="button" class="clear" onclick={() => setRating(null)}>Clear rating</button>{/if}
					</div>
				{/if}
				{#each config.progress as key (key)}
					{@const p = progress[key]!}
					<div class="progress">
						<span class="progress-label">{PROGRESS_LABELS[key]}</span>
						<ProgressControl
							label={PROGRESS_LABELS[key]}
							current={p.current}
							total={p.total}
							onstep={(delta) => moveProgress(key, p.current + delta, { delta: String(delta) })}
							onset={(value) => moveProgress(key, value, { value: String(value) })}
						/>
					</div>
				{/each}
			{/snippet}
			{#snippet actions()}
				<AddToCollection collections={data.collections} memberOf={data.memberOf} />
				<div class="pair">
					<Button href="/entries/{entry.id}/edit" variant="secondary" arrow={false}>Edit</Button>
					<DeleteEntry title={entry.title} typeLabel={config.label} />
				</div>
			{/snippet}
		</DetailPanel>
	</div>
	{#if data.works.length}
		<div class="column below" data-column><ArtistWorks works={data.works} /></div>
	{/if}
</div>

<style>
	.detail {
		position: relative;
		isolation: isolate;
	}

	.backdrop {
		position: absolute;
		inset: 0 0 auto;
		z-index: -1;
		block-size: min(90vh, 820px);
		overflow: hidden;
		pointer-events: none;
		mask-image: var(--fade-down);
	}

	.backdrop img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		filter: blur(56px) saturate(1.5);
		opacity: 0.5;
		transform: scale(1.3);
	}

	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--s-6);
		padding-block-start: var(--nav-top);
	}

	.below {
		margin-block-start: var(--s-9);
	}

	.cover {
		inline-size: min(100%, 240px);
		margin-inline: auto;
		border-radius: var(--r-card);
		overflow: hidden;
		background: var(--surface-2);
		box-shadow: var(--shadow-float);
	}

	.cover img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.pair {
		display: flex;
		align-items: center;
		gap: var(--s-2);
	}

	.rating {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--s-2);
	}

	.clear {
		min-block-size: 44px;
		padding: 0 var(--s-3);
		border: 0;
		background: transparent;
		font-size: var(--t-small);
		font-weight: 500;
		color: var(--ink-2);
		white-space: nowrap;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.progress {
		position: relative;
	}

	/* out of flow so the label never offsets the control from the status and stars row */
	.progress-label {
		position: absolute;
		inset: auto auto calc(100% + 2px) var(--s-3);
		line-height: 1;
		white-space: nowrap;
		font-size: var(--t-eyebrow);
		font-weight: 600;
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--ink-2);
	}

	@media (min-width: 1024px) {
		.layout {
			grid-template-columns: minmax(0, 400px) minmax(0, 1fr);
			gap: var(--s-8);
			align-items: start;
		}

		.cover {
			inline-size: 100%;
			margin-inline: 0;
			position: sticky;
			inset-block-start: var(--nav-top);
		}
	}
</style>
