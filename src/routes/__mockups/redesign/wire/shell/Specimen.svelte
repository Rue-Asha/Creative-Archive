<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, note, children }: { label: string; note?: string; children: Snippet } = $props();
</script>

<section class="specimen" aria-label={label}>
	<header>
		<h3>{label}</h3>
		{#if note}<p>{note}</p>{/if}
	</header>
	<div class="specimen-stage">{@render children()}</div>
</section>

<style>
	.specimen { display: grid; gap: var(--space-2-5); min-inline-size: 0; }
	header { display: grid; gap: var(--space-0-5); }
	h3 { font-size: var(--type-kicker-size); line-height: var(--type-kicker-line); letter-spacing: var(--type-kicker-tracking); font-weight: var(--type-kicker-weight); text-transform: uppercase; color: var(--ink-secondary); overflow-wrap: anywhere; }
	p { font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-muted); max-inline-size: var(--measure); }
	.specimen-stage { position: relative; min-inline-size: 0; padding-block-start: var(--space-3); border-block-start: var(--stroke-hairline) dashed var(--edge-control); }
</style>
