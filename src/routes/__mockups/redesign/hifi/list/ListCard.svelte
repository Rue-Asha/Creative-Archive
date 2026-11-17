<script lang="ts">
	import Cover from '../shell/Cover.svelte';
	import Icon from '../shell/Icon.svelte';
	import { href, langOf, ratingText, soft } from '../shell/data.ts';
	import StatusMark from './StatusMark.svelte';
	import { PIECE, type ListDef, type ListEntry } from './data.ts';

	type Props = { entry: ListEntry; def: ListDef; worst?: boolean; selectable?: boolean; selected?: boolean; ontoggle?: (e: MouseEvent) => void };
	let { entry, def, worst = false, selectable = false, selected = false, ontoggle }: Props = $props();

	const labels = $derived(entry.kind === 'piece' ? PIECE : def.statuses);
	const order = $derived(entry.kind === 'piece' ? ['wishlist', 'owned', 'gone'] : ['want', 'doing', 'done', 'dropped']);
	const at = $derived(order.indexOf(entry.status as string));
	const status = $derived(at >= 0 && labels[at] ? { label: labels[at], state: order[at] as 'want' } : null);
	const rating = $derived(ratingText(entry.rating));
	const p = $derived(entry.progress && entry.status === 'doing' ? entry.progress : null);
	const unit = $derived(p ? p.unit[0].toUpperCase() + p.unit.slice(1) : '');
	const sub = $derived(entry.kindText ?? entry.by);
</script>

{#snippet inner()}
	<span class="shot">
		<Cover title={entry.title} src={entry.cover} year={entry.year} ratio={def.ratio} />
		{#if selectable}<span class="tick" aria-hidden="true">{#if selected}<Icon name="check" size={14} />{/if}</span>{/if}
	</span>
	<span class="title" lang={langOf(entry.title)} dir={langOf(entry.title) === 'ar' ? 'rtl' : undefined}>{langOf(entry.title) ? entry.title : soft(entry.title)}</span>
{/snippet}

<li class="item" data-selected={selected || undefined}>
	{#if selectable}
		<button type="button" class="link" aria-pressed={selected} onclick={ontoggle} data-press>{@render inner()}</button>
	{:else}
		<a class="link" href={href('entry', worst, `k=${entry.kind === 'brand' || entry.kind === 'site' ? 'magazine' : entry.kind === 'song' || entry.kind === 'look' ? 'album' : entry.kind}`)} data-hover>{@render inner()}</a>
	{/if}
	<p class="meta">
		{#if sub}<span class="by" lang={langOf(sub)}>{soft(sub)}</span>{/if}
		{#if status}<StatusMark label={status.label} state={status.state} />{/if}
	</p>
	{#if rating}
		<p class="rating"><span aria-hidden="true">{rating.replace(' / 10', '')}<span class="of"> / 10</span></span><span class="sr-only">{rating.replace(' / ', ' of ')}</span></p>
	{/if}
	{#if p && !selectable}
		<div class="steps" role="group" aria-label="{unit} progress">
			<button type="button" class="btn icon s" aria-label="{unit}: one less" disabled={p.done === 0} data-press="round"><Icon name="minus" size={16} /></button>
			<span class="value">{p.done} / {p.total}</span>
			<button type="button" class="btn icon s" aria-label="{unit}: one more" disabled={p.done >= (p.total ?? Infinity)} data-press="round"><Icon name="plus" size={16} /></button>
		</div>
	{/if}
</li>

<style>
	.item { position: relative; display: flex; flex-direction: column; min-inline-size: 0; padding: var(--space-1-5); border-radius: var(--radius-card-s); background: var(--surface-sunken); }
	.item[data-selected] { background: var(--surface-selected); box-shadow: var(--ring-selected); }
	.link { display: grid; gap: var(--space-1-5); padding: 0; border: 0; border-radius: var(--radius-item); background: none; color: var(--ink); font: inherit; text-align: start; text-decoration: none; cursor: pointer; }
	.shot { position: relative; display: block; }
	.tick { position: absolute; inset-block-start: var(--space-2); inset-inline-end: var(--space-2); display: grid; place-items: center; inline-size: 26px; block-size: 26px; border-radius: var(--radius-round); background: var(--surface-raised); box-shadow: var(--ring-control); color: var(--ink-on-inverse); }
	.item[data-selected] .tick { background: var(--surface-inverse); box-shadow: none; }
	.item > :not(.link) { padding-inline: var(--space-3); background: var(--surface-raised); }
	.title {
		display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
		padding: var(--space-3) var(--space-3) 0; border-radius: var(--radius-item) var(--radius-item) 0 0; background: var(--surface-raised);
		font-size: var(--type-title-size); line-height: var(--type-title-line); font-weight: var(--type-title-weight); overflow-wrap: anywhere;
	}
	.title:lang(ja) { word-break: keep-all; overflow-wrap: anywhere; }
	.meta { flex: 1 0 auto; display: grid; align-content: start; justify-items: start; gap: var(--space-0-5); padding-block-start: var(--space-1); font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-secondary); }
	.by { display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }
	.item > :last-child { padding-block-end: var(--space-3); border-radius: 0 0 var(--radius-item) var(--radius-item); }
	.rating { padding-block-start: var(--space-2); font-family: var(--font-display); font-weight: var(--weight-display); font-size: var(--type-display-s-size); line-height: 1.1; font-variant-numeric: var(--numeric-figures); }
	.of { font-family: var(--font-ui); font-size: var(--type-body-s-size); color: var(--ink-secondary); }
	.steps { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-1); padding-block-start: var(--space-2); }
	.value { order: -1; flex: 1 0 100%; text-align: center; font-size: var(--type-caption-size); line-height: var(--type-caption-line); font-variant-numeric: var(--numeric-figures); }
	.btn.icon.s { --h: max(var(--control-height-xs), var(--target)); background: var(--surface-sunken); box-shadow: var(--ring-control); }
	@media (hover: hover) { .link:hover .title { text-decoration: underline; text-underline-offset: 0.2em; } }
</style>
