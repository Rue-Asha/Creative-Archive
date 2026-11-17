<!--
	ListRow: copy-in reference primitive from Design-System (sync.sh <app> --primitive list-row).
	The app owns this copy; restyle it with fingerprint tokens only. Put it in an <li>.
	Props: title, meta, value (trailing text), href (a link row) or onclick (a button row),
	otherwise static; current (the charcoal pill, aria-current), selected (true/false makes the
	row selectable: a check in a circle, aria-pressed on a button row; undefined: not
	selectable), leading (snippet: cover, icon, initials), action (snippet: one trailing
	button, kept outside the row's own link or button).
	State never rests on colour alone: current is a >= 3:1 fill, selected a filled circle with a
	check against an outlined one. The row's focus ring sits outside it, so it stays ink even on
	the charcoal current row. Below 22rem the value drops under the title (the row is a size
	container), so a long title and a long value both read.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		meta?: string;
		value?: string;
		href?: string;
		onclick?: (e: MouseEvent) => void;
		current?: boolean | 'page' | 'step' | 'location';
		selected?: boolean;
		leading?: Snippet;
		action?: Snippet;
	};

	let { title, meta, value, href, onclick, current = false, selected, leading, action }: Props = $props();

	const ariaCurrent = $derived(current === true ? 'page' : current || undefined);
	const selectable = $derived(selected !== undefined);
</script>

{#snippet content()}
	{#if selectable}
		<span class="check" aria-hidden="true">
			<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
		</span>
	{/if}
	{#if leading}<span class="leading">{@render leading()}</span>{/if}
	<span class="text">
		<span class="title">{title}</span>
		{#if meta}<span class="meta">{meta}</span>{/if}
	</span>
	{#if value}<span class="value">{value}</span>{/if}
{/snippet}

<div class={['row', { current: !!current, selected, interactive: !!(href || onclick) }]}>
	{#if href}
		<a class="main" {href} aria-current={ariaCurrent} data-hover>
			{@render content()}
			{#if selected}<span class="sr-only">, selected</span>{/if}
		</a>
	{:else if onclick}
		<button type="button" class="main" {onclick} aria-pressed={selected} aria-current={ariaCurrent} data-hover>
			{@render content()}
		</button>
	{:else}
		<div class="main" aria-current={ariaCurrent}>
			{@render content()}
			{#if selected}<span class="sr-only">, selected</span>{/if}
		</div>
	{/if}
	{#if action}<span class="action" data-surface={current ? 'inverse' : undefined}>{@render action()}</span>{/if}
</div>

<style>
	.row {
		container: row / inline-size;
		display: flex;
		align-items: center;
		gap: var(--space-1);
		min-block-size: max(var(--control-height), var(--target));
		padding-inline-end: var(--space-1-5);
		border-radius: var(--radius-panel);
		background: var(--surface-glass-strong);
		box-shadow: var(--shadow-rim);
		color: var(--ink);
	}
	.row:not(:has(.action)) {
		padding-inline-end: 0;
	}

	.main {
		flex: 1;
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-inline-size: 0;
		align-self: stretch;
		padding: var(--space-3) var(--space-4);
		border: 0;
		border-radius: inherit;
		background: none;
		color: inherit;
		font: inherit;
		text-align: start;
		text-decoration: none;
	}
	.interactive .main {
		cursor: pointer;
	}
	@media (hover: hover) {
		.interactive:not(.current):has(.main:hover) {
			background: var(--surface-hover);
		}
	}

	.leading {
		display: grid;
		place-items: center;
		flex: none;
	}
	.text {
		display: grid;
		gap: var(--space-0-5);
		flex: 1;
		min-inline-size: 0;
	}
	.title {
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		font-weight: var(--type-title-weight);
	}
	.meta {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}
	.value {
		flex: 0 1 auto;
		max-inline-size: 45%;
		font-weight: var(--weight-semibold);
		font-variant-numeric: var(--numeric-figures);
		text-align: end;
		overflow-wrap: anywhere;
	}
	@container row (max-width: 22rem) {
		.main {
			flex-wrap: wrap;
			row-gap: var(--space-0-5);
		}
		.value {
			flex-basis: 100%;
			max-inline-size: none;
			text-align: start;
		}
	}
	.action {
		display: flex;
		flex: none;
	}

	/* Selectable rows always show the circle, so selected and not selected differ in shape. */
	.check {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: var(--space-6);
		block-size: var(--space-6);
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: transparent;
	}
	.selected {
		background: var(--accent-soft);
	}
	.selected .check {
		background: var(--surface-inverse);
		box-shadow: none;
		color: var(--ink-on-inverse);
	}

	/* The current item is the charcoal pill, as everywhere in the direction. */
	.current {
		background: var(--surface-inverse);
		box-shadow: none;
		color: var(--ink-on-inverse);
	}
	.current .meta {
		color: var(--ink-on-inverse-secondary);
	}
	:global([data-surface='inverse']) .row:not(.current) {
		color: var(--ink-on-inverse);
	}
	:global([data-surface='inverse']) .row:not(.current) .meta {
		color: var(--ink-on-inverse-secondary);
	}
	.current .check {
		background: transparent;
		box-shadow: var(--ring-control-on-inverse);
	}
	.current.selected .check {
		box-shadow: none;
		background: var(--surface-raised);
		color: var(--ink);
	}

	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
