<script lang="ts">
	import type { MockEntry } from '../../fixtures.ts';
	import Cover from './Cover.svelte';
	import { href, kindLabel, langOf, soft, progressParts, ratingText, statusLabel } from './data.ts';
	import Icon from './Icon.svelte';

	type Props = { entry: MockEntry; worst?: boolean; steps?: boolean; noImage?: boolean; ratio?: string; showKind?: boolean };
	let { entry, worst = false, steps = false, noImage = false, ratio = '3 / 4', showKind = true }: Props = $props();

	const status = $derived(statusLabel(entry));
	const rating = $derived(ratingText(entry.rating));
	const progress = $derived(progressParts(entry));
	const by = $derived([showKind ? kindLabel(entry.kind) : null, entry.by].filter(Boolean).join(' · '));
</script>

<li class="entry">
	<a class="link" href={href('entry', worst)} data-hover>
		<Cover title={entry.title} src={noImage ? null : entry.cover} year={entry.year} {ratio} />
		<span class="title" lang={langOf(entry.title)}>{langOf(entry.title) ? entry.title : soft(entry.title)}</span>
	</a>
	<p class="meta">
		{#if by}<span class="by" lang={entry.by ? langOf(entry.by) : undefined}>{soft(by)}</span>{/if}
		{#if status}<span class="status">{status}</span>{/if}
	</p>
	{#if rating}
		<p class="rating"><span aria-hidden="true">{rating.replace(' / 10', '')}<span class="of"> / 10</span></span><span class="sr-only">{rating.replace(' / ', ' of ')}</span></p>
	{/if}
	{#if steps && progress}
		<div class="steps" role="group" aria-label="{progress.label} progress">
			<button type="button" class="btn icon s" aria-label="{progress.label}: one less" disabled={progress.done === 0} data-press="round"><Icon name="minus" size={16} /></button>
			<span class="value">{progress.text}</span>
			<button type="button" class="btn icon s" aria-label="{progress.label}: one more" disabled={progress.total !== null && progress.done >= progress.total} data-press="round"><Icon name="plus" size={16} /></button>
		</div>
	{/if}
</li>

<style>
	.entry { display: flex; flex-direction: column; min-inline-size: 0; padding: var(--space-1-5); border-radius: var(--radius-card-s); background: var(--surface-sunken); scroll-snap-align: start; }
	.link { display: grid; gap: var(--space-1-5); border-radius: var(--radius-item); color: var(--ink); text-decoration: none; }
	.entry > :not(.link) { padding-inline: var(--space-3); background: var(--surface-raised); }
	.title {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
		padding: var(--space-3) var(--space-3) 0;
		border-radius: var(--radius-item) var(--radius-item) 0 0;
		background: var(--surface-raised);
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		font-weight: var(--type-title-weight);
		overflow-wrap: anywhere;
	}
	.title:lang(ja) { word-break: keep-all; overflow-wrap: anywhere; }
	.meta { flex: 1 0 auto; display: grid; align-content: start; justify-items: start; gap: var(--space-0-5); padding-block-start: var(--space-1); font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-secondary); }
	.by { display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }
	.status { padding-inline-start: var(--space-2); box-shadow: var(--rule-start); color: var(--ink); font-weight: var(--weight-medium); }
	.entry > :last-child { padding-block-end: var(--space-3); border-radius: 0 0 var(--radius-item) var(--radius-item); }
	.rating { padding-block-start: var(--space-2); font-family: var(--font-display); font-weight: var(--weight-display); font-size: var(--type-display-s-size); line-height: 1.1; font-variant-numeric: var(--numeric-figures); }
	.of { font-family: var(--font-ui); font-size: var(--type-body-s-size); color: var(--ink-secondary); }
	.steps { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-1); padding-block-start: var(--space-2); }
	.value { order: -1; flex: 1 0 100%; text-align: center; font-size: var(--type-caption-size); line-height: var(--type-caption-line); font-variant-numeric: var(--numeric-figures); overflow-wrap: anywhere; }
	.btn.icon.s { --h: max(var(--control-height-xs), var(--target)); background: var(--surface-sunken); box-shadow: var(--ring-control); }
	@media (hover: hover) {
		.link:hover .title { text-decoration: underline; text-underline-offset: 0.2em; }
	}
</style>
