<!--
	Button: copy-in reference primitive from Design-System (sync.sh <app> --primitive button).
	The app owns this copy; restyle it with fingerprint tokens only.
	Props: variant (primary | secondary | glass | quiet | danger), size (xs | s | m), icon (round,
	needs label), arrow (the arrow in a circle; on an icon button just the arrow), href (renders <a>), type, disabled, loading,
	loadingLabel, label (accessible name), children, plus any <button>/<a> attribute.
	Press and the arrow nudge come from motion.css; targets are >= 24px, 44px on touch.
	xs is the compact 30px control (--control-height-xs; 44px on touch). A quiet button with
	aria-haspopup and aria-expanded="true" (a menu trigger) keeps a --surface-tint-strong fill.
	Surfaces: secondary is glass, for the frame and the photo. On a solid surface (a .card that is
	not charcoal, a dialog, or anything marked data-surface="solid", the button itself included;
	EmptyState does it itself) it takes a tinted fill. An icon and a label in the children get a gap.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type Props = {
		variant?: 'primary' | 'secondary' | 'glass' | 'quiet' | 'danger';
		size?: 'xs' | 's' | 'm';
		icon?: boolean;
		arrow?: boolean;
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		loading?: boolean;
		loadingLabel?: string;
		label?: string;
		children?: Snippet;
	} & Omit<HTMLButtonAttributes & HTMLAnchorAttributes, 'type' | 'href' | 'disabled' | 'children'>;

	let {
		variant = 'secondary',
		size = 'm',
		icon = false,
		arrow = false,
		href,
		type = 'button',
		disabled = false,
		loading = false,
		loadingLabel = 'Working',
		label,
		children,
		onclick,
		...rest
	}: Props = $props();

	const inert = $derived(disabled || loading);
	const dark = $derived(variant === 'primary');
</script>

{#snippet body()}
	{#if loading}<span class="spinner" aria-hidden="true"></span>{/if}
	{#if children}<span class="text">{@render children()}</span>{/if}
	{#if arrow && icon}
		<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
	{:else if arrow}
		<span class="circle" aria-hidden="true">
			<svg data-nudge viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
		</span>
	{/if}
	{#if loading}<span class="sr-only">{loadingLabel}</span>{/if}
{/snippet}

{#if href && !inert}
	<a
		{...rest}
		{href}
		{onclick}
		class={['btn', variant, size, { icon, arrow: arrow && !icon }, rest.class]}
		aria-label={label}
		data-press={icon ? 'round' : ''}
		data-focus={dark ? 'halo' : undefined}
	>
		{@render body()}
	</a>
{:else}
	<button
		{...rest}
		{type}
		class={['btn', variant, size, { icon, arrow: arrow && !icon }, rest.class]}
		aria-label={label}
		aria-disabled={loading || undefined}
		aria-busy={loading || undefined}
		disabled={disabled && !loading}
		onclick={(e) => {
			if (loading) {
				e.preventDefault();
				return;
			}
			onclick?.(e);
		}}
		data-press={icon ? 'round' : ''}
		data-focus={dark ? 'halo' : undefined}
	>
		{@render body()}
	</button>
{/if}

<style>
	.btn {
		--h: max(var(--control-height), var(--target));
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-block-size: var(--h);
		min-inline-size: var(--h);
		padding: 0 var(--space-4);
		border: 0;
		border-radius: var(--radius-control);
		background: var(--surface-glass-strong);
		box-shadow: var(--shadow-rim);
		color: var(--ink);
		font-family: var(--font-ui);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
		text-decoration: none;
		white-space: nowrap;
		user-select: none;
		-webkit-user-select: none;
	}
	.s {
		--h: max(var(--control-height-s), var(--target));
		padding-inline: var(--space-3-5);
	}

	.xs {
		--h: max(var(--control-height-xs), var(--target));
	}

	.primary {
		background: var(--surface-inverse);
		box-shadow: none;
		color: var(--ink-on-inverse);
	}
	/* base.css draws the white ring with an ink halo; the line above would cancel the halo. */
	.primary:focus-visible {
		box-shadow: var(--focus-halo);
	}
	.glass {
		background: var(--surface-glass);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
	}
	.quiet {
		background: transparent;
		box-shadow: none;
		color: inherit;
		padding-inline: var(--space-3);
	}
	/* A quiet button whose menu is open keeps its tint, so the trigger reads as held. */
	.quiet[aria-haspopup][aria-expanded='true'] {
		background: var(--surface-tint-strong);
	}
	.danger {
		background: var(--danger-soft);
		box-shadow: var(--ring-danger);
		color: var(--danger);
	}

	/* Glass vanishes on a solid white surface; there the secondary pill is a tint of ink. A solid
	   card (not the charcoal one), a dialog, a [data-surface='solid'] ancestor or the button itself. */
	:global(:where(.card:not([data-surface='inverse']), dialog, [data-surface='solid'])) .secondary:not(:disabled),
	.secondary:global([data-surface='solid']):not(:disabled) {
		background: var(--surface-control-solid);
		box-shadow: none;
	}

	.icon {
		inline-size: var(--h);
		padding: 0;
		border-radius: var(--radius-round);
	}

	/* The dark pill with the arrow in a white circle (both references' "Start a Project"). */
	.arrow {
		--circle: calc(var(--h) - var(--space-3));
		padding-block: var(--space-1-5);
		padding-inline: var(--space-5) var(--space-1-5);
		gap: var(--space-3);
	}
	.circle {
		display: grid;
		place-items: center;
		inline-size: var(--circle);
		block-size: var(--circle);
		border-radius: var(--radius-round);
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.primary .circle {
		background: var(--surface-raised);
		color: var(--ink);
	}

	@media (hover: hover) {
		.btn:hover {
			background: var(--surface-raised);
		}
		.primary:hover {
			background: var(--surface-inverse-hover);
		}
		.glass:hover {
			background: var(--surface-glass-strong);
		}
		.quiet:hover {
			background: var(--surface-tint);
		}
		:global([data-surface='inverse']) .quiet:hover {
			background: var(--surface-inverse-tint-strong);
		}
		.danger:hover {
			background: var(--surface-raised);
		}
		:global(:where(.card:not([data-surface='inverse']), dialog, [data-surface='solid'])) .secondary:not(:disabled):hover,
		.secondary:global([data-surface='solid']):not(:disabled):hover {
			background: var(--surface-control-solid-hover);
		}
	}

	.btn:disabled,
	.btn[aria-disabled='true'] {
		cursor: default;
	}
	.btn:disabled {
		background: var(--surface-tint);
		box-shadow: none;
		color: var(--ink-secondary);
		opacity: var(--disabled-opacity);
	}
	.btn:disabled .circle {
		background: var(--surface-tint-strong);
		color: var(--ink-secondary);
	}

	.spinner {
		inline-size: 1em;
		block-size: 1em;
		border-radius: var(--radius-round);
		box-shadow: var(--ring-control);
		border: var(--stroke-rule) solid transparent;
		border-block-start-color: currentColor;
		animation: spin var(--motion-spin) var(--ease-spin) infinite;
	}
	.primary .spinner,
	:global([data-surface='inverse']) .spinner {
		box-shadow: var(--ring-control-on-inverse);
	}
	.text {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}
	.icon .spinner ~ .text {
		display: none;
	}
	@keyframes spin {
		to {
			transform: rotate(1turn);
		}
	}
	@keyframes pulse {
		50% {
			opacity: var(--spinner-pulse-opacity);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation-name: pulse;
		}
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
