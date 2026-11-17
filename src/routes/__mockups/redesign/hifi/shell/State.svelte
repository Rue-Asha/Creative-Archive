<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, note, children }: { label: string; note?: string; children: Snippet } = $props();
</script>

<section class="state" aria-label={label}>
	<header>
		<h3>{label}</h3>
		{#if note}<p>{note}</p>{/if}
	</header>
	<div class="stage-box">{@render children()}</div>
</section>

<style>
	.state { display: grid; gap: var(--space-3); min-inline-size: 0; padding: var(--space-4); border-radius: var(--radius-card); background: var(--surface-glass-strong); box-shadow: var(--elevation-card); }
	header { display: grid; gap: var(--space-1); }
	h3 { font-size: var(--type-overline-size); line-height: var(--type-overline-line); letter-spacing: var(--type-overline-tracking); font-weight: var(--type-overline-weight); text-transform: uppercase; padding-inline-start: var(--space-3); box-shadow: var(--rule-start); overflow-wrap: anywhere; }
	p { max-inline-size: var(--measure); font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-secondary); }
	.stage-box { display: grid; gap: var(--space-4); min-inline-size: 0; padding: var(--space-3); border-radius: var(--radius-panel); background: var(--surface-sunken); }
</style>
