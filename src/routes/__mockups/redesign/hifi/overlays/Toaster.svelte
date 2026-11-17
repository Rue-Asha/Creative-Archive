<script module lang="ts">
	export type ToastItem = { id: number; kind?: 'info' | 'error'; message: string; action?: string; focus?: 'action' | 'dismiss' };
</script>

<script lang="ts">
	import Icon from './Icon.svelte';
	import { portal } from './portal.ts';
	import './overlays.css';

	// The toast primitive's markup: two live regions that exist before any toast does (errors as alerts, info as status). Only the
	// newest toast of a region shows, older ones peek behind it. `inline` draws the region in place for specimens; the real one is
	// fixed to the viewport and portalled to <body>. A toast stays up until `ondismiss` removes it (the page owns the timer).
	type Props = { toasts: ToastItem[]; inline?: boolean; ondismiss?: (id: number) => void; hidden?: number[]; lift?: string };
	let { toasts, inline = false, ondismiss, hidden = [], lift }: Props = $props();
	const info = $derived(toasts.filter((t) => (t.kind ?? 'info') === 'info'));
	const errors = $derived(toasts.filter((t) => t.kind === 'error'));
</script>

{#snippet item(t: ToastItem)}
	<div class="toast" class:long={t.message.length > 48} aria-hidden={hidden.includes(t.id) ? 'true' : undefined}>
		{#if t.kind === 'error'}<span class="mark"><Icon name="alert" size={18} /></span>{/if}
		<p class="message">{t.message}</p>
		{#if t.action}<button type="button" class="action" data-press data-drawn-focus={t.focus === 'action' ? '' : undefined}>{t.action}</button>{/if}
		<button type="button" class="dismiss" aria-label="Dismiss" data-press="round" data-drawn-focus={t.focus === 'dismiss' ? '' : undefined} onclick={() => ondismiss?.(t.id)}><Icon name="close" size={16} /></button>
	</div>
{/snippet}

{#snippet region()}
	<div class="toaster" class:inline data-surface="inverse">
		<div class="list" role="alert">{#each errors as t (t.id)}{@render item(t)}{/each}</div>
		<div class="list" role="status" aria-live="polite">{#each info as t (t.id)}{@render item(t)}{/each}</div>
	</div>
{/snippet}

{#if inline}
	{@render region()}
{:else}
	<div use:portal class="portal" style:--toast-lift={lift}>{@render region()}</div>
{/if}

<style>
	.portal { display: contents; }
	/* a long message keeps the full width; its action and Dismiss move to a row of their own */
	.long { flex-wrap: wrap; row-gap: 0; }
	.long .message { flex-basis: calc(100% - var(--space-12)); }
	.long .action { margin-inline-start: auto; }
	.long:not(:has(.action)) .dismiss { margin-inline-start: auto; }
	.mark { display: inline-flex; color: var(--danger-on-inverse); }
	@media (max-width: 1023px) {
		/* above the phone bar, which stays reachable while a toast is up */
		.portal :global(.toaster:not(.inline)) { inset-block-end: calc(var(--space-3) + var(--toast-lift, var(--space-16)) + env(safe-area-inset-bottom)); }
	}
</style>
