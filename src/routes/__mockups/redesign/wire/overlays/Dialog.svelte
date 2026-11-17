<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		text?: string;
		quote?: string;
		children?: Snippet;
		actions?: Snippet;
		wide?: boolean;
	};
	let { title, text, quote, children, actions, wide = false }: Props = $props();
</script>

<div class="dialog" class:wide role="dialog" aria-modal="true" aria-label={title}>
	<h2 class="title">{title}</h2>
	{#if quote}<p class="quote">{quote}</p>{/if}
	{#if text}<p class="text">{text}</p>{/if}
	{#if children}<div class="content">{@render children()}</div>{/if}
	{#if actions}<div class="actions">{@render actions()}</div>{/if}
</div>

<style>
	.dialog {
		display: grid;
		gap: var(--space-4);
		inline-size: min(100%, 26rem);
		max-block-size: 100%;
		padding: var(--space-6);
		border-radius: var(--radius-card);
		background: var(--surface-raised);
		box-shadow: var(--elevation-menu);
		min-inline-size: 0;
	}
	.dialog.wide {
		inline-size: min(100%, 32rem);
	}
	.title {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
		overflow-wrap: anywhere;
	}
	.quote {
		padding-inline-start: var(--space-3);
		box-shadow: var(--rule-start);
		font-weight: var(--weight-semibold);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		overflow: hidden;
	}
	.text {
		color: var(--ink-secondary);
		overflow-wrap: anywhere;
		hyphens: auto;
	}
	.content {
		min-inline-size: 0;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--space-2);
		padding-block-start: var(--space-1);
	}
	@media (max-width: 767px) {
		.dialog {
			inline-size: 100%;
			padding: var(--space-5) var(--space-4);
			border-end-start-radius: 0;
			border-end-end-radius: 0;
		}
		.actions :global(.btn) {
			flex: 1 1 8rem;
		}
	}
</style>
