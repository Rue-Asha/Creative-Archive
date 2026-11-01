<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import ArrowButton from './ArrowButton.svelte';
	import Icon, { type IconName } from './Icon.svelte';

	type Props = {
		children: Snippet;
		href?: string;
		variant?: 'primary' | 'accent' | 'secondary' | 'glass';
		// primary and accent end in an arrow circle unless arrow is false
		arrow?: boolean;
		icon?: IconName;
		type?: 'button' | 'submit';
		disabled?: boolean;
		onclick?: (event: MouseEvent) => void;
		class?: string;
	} & Omit<HTMLAttributes<HTMLElement>, 'class' | 'onclick' | 'children'>;

	let {
		children,
		href,
		variant = 'primary',
		arrow,
		icon,
		type = 'button',
		disabled = false,
		onclick,
		class: cls = '',
		...rest
	}: Props = $props();

	const withArrow = $derived(arrow ?? (variant === 'primary' || variant === 'accent'));
</script>

{#snippet inner()}
	{#if icon}<Icon name={icon} size={18} />{/if}
	<span class="label">{@render children()}</span>
	{#if withArrow}<ArrowButton decorative variant="inverse" size="sm" />{/if}
{/snippet}

{#if href}
	<a class="btn {variant} {cls}" class:has-arrow={withArrow} class:liquid={variant === 'glass'} class:liquid-strong={variant === 'glass'} {href} {...rest}>{@render inner()}</a>
{:else}
	<button class="btn {variant} {cls}" class:has-arrow={withArrow} class:liquid={variant === 'glass'} class:liquid-strong={variant === 'glass'} {type} {disabled} {onclick} {...rest}>
		{@render inner()}
	</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--s-2);
		min-block-size: 48px;
		padding: 0 var(--s-6);
		border-radius: var(--r-pill);
		border: 1px solid transparent;
		font-size: 15px;
		font-weight: 600;
		letter-spacing: -0.005em;
		line-height: 1;
		white-space: nowrap;
		transition:
			transform var(--d-fast) var(--ease-out),
			opacity var(--d-fast) var(--ease-out),
			box-shadow var(--d-base) var(--ease-out);
	}

	.has-arrow {
		padding-inline: var(--s-6) 8px;
		gap: var(--s-4);
	}

	.primary {
		background: var(--solid);
		color: var(--on-solid);
		box-shadow: var(--shadow-card);
	}

	.accent {
		background: var(--accent);
		color: var(--accent-ink);
		box-shadow: var(--shadow-card);
	}

	.secondary {
		background: transparent;
		border-color: var(--ink);
		color: var(--ink);
	}

	.glass {
		box-shadow: var(--glass-rim), var(--shadow-card);
	}

	.btn:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: var(--shadow-float);
	}

	.btn:active:not(:disabled) {
		transform: translateY(0) scale(0.98);
	}

	.btn:disabled {
		opacity: 0.4;
		cursor: default;
	}
</style>
