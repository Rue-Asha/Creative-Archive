<!--
	Toaster: copy-in reference primitive from Design-System (sync.sh <app> --primitive toast).
	The app owns this copy; restyle it with fingerprint tokens only. Render it once in the root
	layout; toast() in toast.svelte.ts fills it.
	Two live regions that exist before any toast does, so screen readers hear every one: info
	toasts in role="status" (polite), errors in role="alert". Each toast has an optional action
	and a dismiss button; timers pause while the pointer or focus is on the toasts.
	Only the newest toast of each region shows; older ones peek behind it as one edge and come
	forward when it goes. On phones the page gains --toast-clearance at its end while a toast
	is up, so the last actions can scroll clear of it.
	Props: dismissLabel. Toasts sit below an open modal sheet (the top layer).
-->
<script lang="ts">
	import { dismiss, pause, resume, toasts, type Toast } from './toast.svelte.ts';

	let { dismissLabel = 'Dismiss' }: { dismissLabel?: string } = $props();

	let region: HTMLDivElement;

	$effect(() => {
		const leave = () => {
			if (!region.contains(document.activeElement)) resume();
		};
		const blur = (e: FocusEvent) => {
			if (!region.contains(e.relatedTarget as Node | null) && !region.matches(':hover')) resume();
		};
		region.addEventListener('pointerenter', pause);
		region.addEventListener('pointerleave', leave);
		region.addEventListener('focusin', pause);
		region.addEventListener('focusout', blur);
		return () => {
			region.removeEventListener('pointerenter', pause);
			region.removeEventListener('pointerleave', leave);
			region.removeEventListener('focusin', pause);
			region.removeEventListener('focusout', blur);
		};
	});

	// A toast removed under the pointer fires no pointerleave.
	$effect(() => {
		if (toasts.length === 0) resume();
	});

	const info = $derived(toasts.filter((t) => t.kind === 'info'));
	const errors = $derived(toasts.filter((t) => t.kind === 'error'));
</script>

{#snippet item(t: Toast)}
	<div class={['toast', t.kind]}>
		{#if t.kind === 'error'}
			<svg class="mark" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16.5h.01" /></svg>
		{/if}
		<p class="message">{t.message}</p>
		{#if t.action}
			<button
				type="button"
				class="action"
				data-press
				onclick={() => {
					t.action?.run();
					dismiss(t.id);
				}}>{t.action.label}</button
			>
		{/if}
		<button type="button" class="dismiss" aria-label={dismissLabel} data-press="round" onclick={() => dismiss(t.id)}>
			<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
		</button>
	</div>
{/snippet}

<div class="toaster" bind:this={region} data-surface="inverse">
	<div class="list" role="alert">
		{#each errors as t (t.id)}{@render item(t)}{/each}
	</div>
	<div class="list" role="status" aria-live="polite">
		{#each info as t (t.id)}{@render item(t)}{/each}
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
		gap: var(--space-2);
		pointer-events: none;
	}
	.list {
		display: grid;
		justify-items: center;
		gap: var(--space-2);
		inline-size: 100%;
	}
	.list:empty {
		display: none;
	}
	.list {
		grid-template-areas: 'stack';
		align-items: end;
	}
	.list > .toast {
		grid-area: stack;
	}
	/* The older ones are transformed, which paints them over an untransformed front toast. */
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
	@media (max-width: 767px) {
		:global(body:has(.toaster .toast)) {
			padding-block-end: var(--toast-clearance);
		}
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
	.mark {
		color: var(--danger-on-inverse);
	}
	.message {
		flex: 1;
		min-inline-size: 0;
		padding-block: var(--space-2);
		font-size: var(--type-body-s-size);
		line-height: var(--type-body-s-line);
	}

	.action,
	.dismiss {
		display: grid;
		place-items: center;
		flex: none;
		min-block-size: max(var(--control-height-xs), var(--target));
		border: 0;
		border-radius: var(--radius-control);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
	}
	.action {
		padding-inline: var(--space-3-5);
		background: var(--surface-raised);
		color: var(--ink);
	}
	.dismiss {
		inline-size: max(var(--control-height-xs), var(--target));
		border-radius: var(--radius-round);
		background: transparent;
		color: var(--ink-on-inverse);
	}
	@media (hover: hover) {
		.action:hover {
			background: var(--surface-sunken);
		}
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
