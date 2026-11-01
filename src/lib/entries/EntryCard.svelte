<script lang="ts">
	import { applyAction, deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { TYPES } from '#lib/entries/config.ts';
	import { statusLabel } from '#lib/entries/derive.ts';
	import { clampProgress } from '#lib/entries/progress.ts';
	import type { Entry, EntryType } from '#lib/types.ts';
	import Card from '#lib/ui/Card.svelte';
	import ProgressControl from '#lib/ui/ProgressControl.svelte';
	import { createWriteQueue } from '#lib/shell/writeQueue.ts';
	import { tilt } from './tilt.ts';

	type Shape = 'square' | 'portrait' | 'tall';

	let { entry, shape }: { entry: Entry; shape?: Shape } = $props();

	const KIND_LABEL = { brand: 'Brand', shop: 'Shop', site: 'Site' } as const;
	const PROGRESS_LABEL = { episodes: 'Episodes', chapters: 'Chapters', volumes: 'Volumes' } as const;
	const shapeOf = (type: EntryType): Shape =>
		TYPES[type].domain === 'music' ? 'square' : type === 'book' || type === 'manga' ? 'tall' : 'portrait';

	const chip = $derived.by(() => {
		if (entry.status === 'none') return undefined;
		return statusLabel(entry.type, entry.status) ?? (entry.kind ? KIND_LABEL[entry.kind] : undefined);
	});
	const meta = $derived.by(() => {
		const d = entry.details;
		if (entry.type === 'album' || entry.type === 'song') return entry.artistName ?? undefined;
		if (entry.type === 'book') return d.authors?.join(', ') || undefined;
		if (entry.type === 'piece') return d.brand || undefined;
		if (entry.type === 'anime' || entry.type === 'manga') return d.year ? String(d.year) : undefined;
		return undefined;
	});

	// the key that finishes the work (episodes, or chapters); only a work in progress gets a control
	const key = $derived(entry.status === 'progress' ? TYPES[entry.type].progress[0] : undefined);
	const progress = $derived(key ? entry.progress[key] : undefined);

	// The control answers at once from `local` while its writes queue up; the detail page's progress action does the work.
	let local = $state<number | null>(null);
	const enqueue = createWriteQueue(() => (local = null));
	const current = $derived(local ?? progress?.current ?? 0);

	function move(next: number, fields: Record<string, string>) {
		const k = key!;
		local = clampProgress(next, progress!.total);
		enqueue(async () => {
			const body = new FormData();
			body.set('key', k);
			for (const [name, value] of Object.entries(fields)) body.set(name, value);
			const res = await fetch(`/entries/${entry.id}?/progress`, {
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
</script>

<div class="entry" use:tilt>
	<Card
		href="/entries/{entry.id}"
		title={entry.title}
		image={entry.imageId === null ? null : `/images/${entry.imageId}`}
		{chip}
		{meta}
		tint={null}
		coverId={entry.id}
		rating={entry.rating}
		shape={shape ?? shapeOf(entry.type)}
	>
		{#if key && progress}
			<ProgressControl
				label={PROGRESS_LABEL[key]}
				{current}
				total={progress.total}
				tone="glass"
				onstep={(delta) => move(current + delta, { delta: String(delta) })}
				onset={(value) => move(value, { value: String(value) })}
			/>
		{/if}
	</Card>
</div>

<style>
	/* the wrapper only carries the tilt action; the card inside is the box */
	.entry {
		display: contents;
	}

	/* under reduced motion a hovered card stays put (the CSS lift would otherwise still apply) */
	@media (prefers-reduced-motion: reduce) {
		.entry :global([data-card]:hover),
		.entry :global([data-card]:hover .media img) {
			transform: none;
		}
	}
</style>
