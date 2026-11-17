<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { portal } from '#lib/components/portal/portal.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import { attach, dismiss, flush, toasts } from './toast.ts';

	onMount(attach);
	afterNavigate(flush);
</script>

<!-- the live region exists before any toast does, so a screen reader hears each one; focus never moves here -->
<div class="toaster" use:portal data-surface="inverse">
	<div class="list" role="status" aria-live="polite">
		{#each $toasts as item (item.id)}
			<div class="toast">
				<p class="message">{item.message}</p>
				<button type="button" class="dismiss" aria-label="Dismiss" data-press="round" onclick={() => dismiss(item.id)}><Icon name="x" size={16} /></button>
			</div>
		{/each}
	</div>
</div>

<style>
	.toaster {
		position: fixed;
		z-index: var(--z-toast);
		inset-inline: var(--space-4);
		inset-block-end: calc(var(--space-4) + env(safe-area-inset-bottom));
		display: grid;
		justify-items: center;
		pointer-events: none;
	}
	/* above the phone bar and the docked selection bar, which stay reachable while a toast is up */
	@media (max-width: 1023px) {
		.toaster {
			inset-block-end: calc(var(--space-3) + var(--space-16) + env(safe-area-inset-bottom));
		}
		:global(html[data-select-docked]) .toaster {
			inset-block-end: calc(var(--space-3) + 8rem + env(safe-area-inset-bottom));
		}
	}
	.list {
		display: grid;
		grid-template-areas: 'stack';
		align-items: end;
		justify-items: center;
		inline-size: 100%;
	}
	.list:empty {
		display: none;
	}
	.list > .toast {
		grid-area: stack;
	}
	/* the older ones peek behind the newest as one edge and come forward when it goes */
	.list > .toast:last-child {
		position: relative;
		z-index: var(--z-raised);
	}
	.list > .toast:not(:last-child) {
		transform-origin: 50% 0;
		translate: 0 calc(-1 * var(--space-2));
		scale: var(--toast-stack-scale);
		background: var(--surface-inverse-raised);
	}
	.list > .toast:not(:last-child) > * {
		visibility: hidden;
	}
	.list > .toast:nth-last-child(n + 3) {
		visibility: hidden;
	}

	.toast {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		inline-size: min(100%, calc(var(--measure) * 0.75));
		min-block-size: max(var(--control-height), var(--target));
		padding: var(--space-1-5) var(--space-1-5) var(--space-1-5) var(--space-4);
		border-radius: var(--radius-panel);
		background: var(--surface-inverse);
		box-shadow: var(--elevation-menu);
		color: var(--ink-on-inverse);
		pointer-events: auto;
		animation: enter var(--motion-glide) var(--ease-out);
	}
	.message {
		flex: 1;
		min-inline-size: 0;
		padding-block: var(--space-2);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
		overflow-wrap: anywhere;
	}
	.dismiss {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: max(var(--control-height-xs), var(--target));
		min-block-size: max(var(--control-height-xs), var(--target));
		border: 0;
		border-radius: var(--radius-round);
		background: transparent;
		color: var(--ink-on-inverse);
	}
	@media (hover: hover) {
		.dismiss:hover {
			background: var(--surface-inverse-tint-strong);
		}
	}

	@keyframes enter {
		from {
			opacity: 0;
			transform: translateY(var(--settle-rise));
		}
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.toast {
			animation-name: fade;
		}
	}
</style>
