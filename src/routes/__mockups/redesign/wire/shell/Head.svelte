<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	type Props = {
		kicker: string[];
		title: Snippet;
		lede?: string;
		hero?: boolean;
		facts?: { caption: string; items: { n: string; label: string }[] };
		actions?: Snippet;
		corner?: Snippet;
	};
	let { kicker, title, lede, hero = false, facts, actions, corner }: Props = $props();
</script>

<header class="head" data-hero={hero}>
	{#if corner}<div class="corner">{@render corner()}</div>{/if}
	{#if hero}<span class="photo" aria-hidden="true"><Icon name="image" size={18} />Hero photo</span>{/if}
	<div class="lead">
		<ul class="kicker">
			{#each kicker as part (part)}<li>{part}</li>{/each}
		</ul>
		<h1>{@render title()}</h1>
		{#if lede}<p class="lede">{lede}</p>{/if}
		{#if actions}<div class="actions">{@render actions()}</div>{/if}
	</div>
	{#if facts}
		<ul class="screen-facts" data-surface="inverse" aria-label="Key facts">
			<li class="facts-caption">{facts.caption}</li>
			{#each facts.items as item (item.label)}<li><span class="n">{item.n}</span>{item.label}</li>{/each}
		</ul>
	{/if}
</header>

<style>
	.head { position: relative; display: grid; gap: var(--space-5); align-items: start; padding: var(--space-4) 0 var(--space-2); min-inline-size: 0; }
	.head[data-hero="true"] { padding: var(--space-8) var(--space-5) var(--space-10); border-radius: var(--radius-card); background: var(--surface-plate-2); }
	.corner { position: absolute; inset-block-start: var(--space-3); inset-inline-end: var(--space-3); }
	.photo { position: absolute; inset-block-end: var(--space-3); inset-inline-end: var(--space-4); display: inline-flex; align-items: center; gap: var(--space-1-5); font-size: var(--type-caption-size); color: var(--ink-secondary); }
	.lead { display: grid; gap: var(--space-4); justify-items: start; min-inline-size: 0; max-inline-size: var(--lead-max); }
	h1 { max-inline-size: 100%; overflow-wrap: anywhere; font-size: var(--type-display-l-size); line-height: var(--type-display-l-line); letter-spacing: var(--type-display-l-tracking); }
	.actions { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3); }
	.head > .screen-facts { grid-column: 1; grid-row: auto; margin: 0; max-inline-size: var(--facts-max); }
	@media (min-width: 1100px) {
		.head:has(> .screen-facts) { grid-template-columns: minmax(var(--facts-lead-min), 1fr) auto; }
		.head > .screen-facts { grid-column: 2; grid-row: 1; }
		h1 { font-size: var(--type-display-xl-size); line-height: var(--type-display-xl-line); letter-spacing: var(--type-display-xl-tracking); }
	}
</style>
