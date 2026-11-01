<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import Icon from './Icon.svelte';

	type Props = {
		label?: string;
		href?: string;
		variant?: 'solid' | 'inverse' | 'accent' | 'glass' | 'outline';
		direction?: 'right' | 'up-right' | 'left';
		size?: 'sm' | 'md' | 'lg';
		// decorative: the circle sits inside a larger link or button and is not a control itself
		decorative?: boolean;
		disabled?: boolean;
		onclick?: (event: MouseEvent) => void;
		class?: string;
	} & Omit<HTMLAttributes<HTMLElement>, 'class' | 'onclick'>;

	let {
		label,
		href,
		variant = 'solid',
		direction = 'right',
		size = 'md',
		decorative = false,
		disabled = false,
		onclick,
		class: cls = '',
		...rest
	}: Props = $props();

	const icon = $derived(direction === 'up-right' ? 'arrow-up-right' : direction === 'left' ? 'arrow-left' : 'arrow-right');
	const iconSize = $derived(size === 'lg' ? 22 : size === 'sm' ? 16 : 19);
</script>

{#if decorative}
	<span class="arrow {variant} {size} {direction} {cls}" class:liquid={variant === 'glass'} class:liquid-strong={variant === 'glass'} aria-hidden="true" {...rest}><Icon name={icon} size={iconSize} /></span>
{:else if href}
	<a class="arrow {variant} {size} {direction} {cls}" class:liquid={variant === 'glass'} class:liquid-strong={variant === 'glass'} {href} aria-label={label} {...rest}><Icon name={icon} size={iconSize} /></a>
{:else}
	<button class="arrow {variant} {size} {direction} {cls}" class:liquid={variant === 'glass'} class:liquid-strong={variant === 'glass'} type="button" aria-label={label} {disabled} {onclick} {...rest}>
		<Icon name={icon} size={iconSize} />
	</button>
{/if}

<style>
	.arrow {
		display: inline-grid;
		place-items: center;
		flex: none;
		inline-size: 44px;
		block-size: 44px;
		border-radius: var(--r-pill);
		border: 1px solid transparent;
		transition:
			transform var(--d-fast) var(--ease-out),
			opacity var(--d-fast) var(--ease-out),
			background-color var(--d-fast) var(--ease-out);
	}

	.arrow :global(.icon) {
		transition: transform var(--d-base) var(--ease-spring);
	}

	.sm {
		inline-size: 32px;
		block-size: 32px;
	}

	.lg {
		inline-size: 52px;
		block-size: 52px;
	}

	.solid {
		background: var(--solid);
		color: var(--on-solid);
	}

	.inverse {
		background: var(--on-solid);
		color: var(--solid);
	}

	.accent {
		background: var(--accent);
		color: var(--accent-ink);
	}

	.glass {
		box-shadow: var(--glass-rim), var(--shadow-card);
	}

	.outline {
		background: transparent;
		border-color: var(--line);
		color: var(--ink);
	}

	a.arrow:hover :global(.icon),
	button.arrow:hover:not(:disabled) :global(.icon),
	:global(a:hover) > .arrow :global(.icon),
	:global(.btn:hover) .arrow :global(.icon) {
		transform: translateX(3px);
	}

	.up-right:hover :global(.icon),
	:global(a:hover) .up-right :global(.icon) {
		transform: translate(2px, -2px);
	}

	.left:hover:not(:disabled) :global(.icon) {
		transform: translateX(-3px);
	}

	button.arrow:active:not(:disabled) {
		transform: scale(0.94);
	}

	button.arrow:disabled {
		opacity: 0.35;
		cursor: default;
	}
</style>
