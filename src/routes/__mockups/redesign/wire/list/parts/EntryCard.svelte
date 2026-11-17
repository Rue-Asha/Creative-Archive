<script lang="ts">
	import Cover from './Cover.svelte';
	import Icon from './Icon.svelte';
	import StatusMark from './StatusMark.svelte';
	import { dirOf, entryHref, fmtRating, langOf, statusOf, type ListEntry, type Tone } from './data.ts';

	type Props = { entry: ListEntry; tone: Tone; selectable?: boolean; selected?: boolean; row?: boolean };
	let { entry, tone, selectable = false, selected = false, row = false }: Props = $props();

	const status = $derived(statusOf(entry));
	const rating = $derived(fmtRating(entry.rating));
</script>

{#snippet inner()}
	<Cover title={entry.title} cover={entry.cover} {tone} />
	<span class="w-title" lang={langOf(entry.title)} dir={dirOf(entry.title)}>{entry.title}</span>
	{#if entry.by}<span class="w-by" lang={langOf(entry.by)}>{entry.by}</span>{/if}
	<span class="w-meta">
		{#if entry.kindLabel}<span class="w-status">{entry.kindLabel}</span>{/if}
		{#if status}<StatusMark label={status.label} state={status.state} />{/if}
		{#if rating !== null}<span class="w-rating figures"><span class="sr-only">{rating} of 10</span><span aria-hidden="true">{rating} / 10</span></span>{/if}
	</span>
{/snippet}

<li class="w-item" data-selected={selected || undefined} data-row={row || undefined}>
	{#if selectable}
		<button type="button" class="w-card" aria-pressed={selected}>
			{@render inner()}
			<span class="w-tick" aria-hidden="true">{#if selected}<Icon name="check" size={14} />{/if}</span>
		</button>
	{:else}
		<a class="w-card" href={entryHref}>
			{@render inner()}
		</a>
		{#if entry.progress && entry.status === 'doing'}
			<span class="w-progress" role="group" aria-label="Episodes">
				<button type="button" class="w-btn icon s" aria-label="Episodes: one less" disabled={entry.progress.done === 0}><Icon name="minus" size={14} /></button>
				<button type="button" class="w-progress-value figures" aria-label="Episodes {entry.progress.done} of {entry.progress.total}">{entry.progress.done} / {entry.progress.total}</button>
				<button type="button" class="w-btn icon s" aria-label="Episodes: one more" disabled={entry.progress.done === entry.progress.total}><Icon name="plus" size={14} /></button>
			</span>
		{/if}
	{/if}
</li>
