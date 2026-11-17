<script lang="ts">
	import type { Snippet } from 'svelte';

	let { label, note, sheet = false, children }: { label: string; note?: string; sheet?: boolean; children: Snippet } = $props();
</script>

<figure class="specimen">
	<figcaption>
		<span class="type-overline label">{label}</span>
		{#if note}<span class="note">{note}</span>{/if}
	</figcaption>
	<div class="well" class:sheet>{@render children()}</div>
</figure>

<style>
	.specimen {
		display: grid;
		gap: var(--space-2-5);
		align-content: start;
		min-inline-size: 0;
		margin: 0;
	}
	figcaption {
		display: grid;
		gap: var(--space-0-5);
	}
	.label {
		color: var(--ink-muted);
	}
	.note {
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
	}
	.well {
		display: grid;
		justify-items: center;
		align-content: start;
		gap: var(--space-3);
		padding: var(--space-6) var(--space-4);
		border-radius: var(--radius-panel);
		background: var(--surface-tint-strong);
		min-inline-size: 0;
		min-block-size: 10rem;
	}
	@media (max-width: 767px) {
		.well {
			padding: var(--space-3) var(--space-2);
		}
		.well.sheet {
			align-content: end;
			padding-block-end: 0;
			min-block-size: 16rem;
		}
	}
</style>
