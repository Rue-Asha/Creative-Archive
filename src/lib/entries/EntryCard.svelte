<script lang="ts">
	import { applyAction, deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { COPY } from '#lib/copy.ts';
	import { TYPES } from '#lib/entries/config.ts';
	import { statusLabel } from '#lib/entries/derive.ts';
	import { clampProgress } from '#lib/entries/progress.ts';
	import type { Entry, EntryType } from '#lib/types.ts';
	import Card from '#lib/ui/Card.svelte';
	import ProgressControl from '#lib/ui/ProgressControl.svelte';
	import { createWriteQueue } from '#lib/shell/writeQueue.ts';

	type Shape = 'square' | 'portrait' | 'tall';

	let {
		entry,
		shape,
		level = 3,
		typed = false,
		selectable
	}: { entry: Entry; shape?: Shape; level?: 3 | 4; typed?: boolean; selectable?: { selected: boolean; ontoggle: (e: MouseEvent | KeyboardEvent) => void } } = $props();

	const KIND_LABEL = { brand: 'Brand', shop: 'Shop', site: 'Site' } as const;
	const PROGRESS_LABEL = { episodes: 'Episodes', chapters: 'Chapters', volumes: 'Volumes' } as const;
	const shapeOf = (type: EntryType): Shape =>
		TYPES[type].domain === 'music' ? 'square' : type === 'book' || type === 'manga' ? 'tall' : 'portrait';

	const chip = $derived.by(() => {
		if (entry.status === 'none') return undefined;
		return statusLabel(entry.type, entry.status) ?? (entry.kind ? KIND_LABEL[entry.kind] : undefined);
	});
	const chipState = $derived(
		entry.status === 'progress' ? 'doing' : entry.status === 'none' || entry.status === null || !statusLabel(entry.type, entry.status) ? undefined : entry.status
	);
	const maker = $derived.by(() => {
		const d = entry.details;
		if (entry.type === 'album' || entry.type === 'song') return entry.artistName ?? undefined;
		if (entry.type === 'book') return d.authors?.join(', ') || undefined;
		if (entry.type === 'piece') return d.brand || undefined;
		if (entry.type === 'anime' || entry.type === 'manga') return d.year ? String(d.year) : undefined;
		return undefined;
	});
	// a shelf mixing types names each card's type first ("Album · Marlene Okafor")
	const meta = $derived(
		typed ? (maker ? COPY.typedMeta.replace('{type}', TYPES[entry.type].label).replace('{maker}', maker) : TYPES[entry.type].label) : maker
	);

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

<Card
	href="/entries/{entry.id}"
	title={entry.title}
	image={entry.imageId === null ? null : `/images/${entry.imageId}`}
	{chip}
	state={chipState}
	{meta}
	coverId={entry.id}
	rating={entry.rating}
	year={entry.details.year ?? null}
	{selectable}
	{level}
	shape={shape ?? shapeOf(entry.type)}
>
	{#if key && progress}
		<ProgressControl
			label={PROGRESS_LABEL[key]}
			name="{PROGRESS_LABEL[key]}, {entry.title}"
			{current}
			total={progress.total}
			onstep={(delta) => move(current + delta, { delta: String(delta) })}
			onset={(value) => move(value, { value: String(value) })}
		/>
	{/if}
</Card>
