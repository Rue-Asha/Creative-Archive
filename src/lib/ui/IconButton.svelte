<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import Icon, { type IconName } from './Icon.svelte';

	type Props = {
		icon: IconName;
		label: string;
		href?: string;
		variant?: 'glass' | 'outline' | 'solid';
		onclick?: (event: MouseEvent) => void;
		class?: string;
	} & Omit<HTMLAttributes<HTMLElement>, 'class' | 'onclick'>;

	let { icon, label, href, variant = 'glass', onclick, class: cls = '', ...rest }: Props = $props();
</script>

{#if href}
	<a class="icon-btn {variant} {cls}" class:liquid={variant === 'glass'} class:liquid-strong={variant === 'glass'} {href} aria-label={label} {...rest}><Icon name={icon} /></a>
{:else}
	<button type="button" class="icon-btn {variant} {cls}" class:liquid={variant === 'glass'} class:liquid-strong={variant === 'glass'} aria-label={label} {onclick} {...rest}><Icon name={icon} /></button>
{/if}

<style>
	.icon-btn {
		display: inline-grid;
		place-items: center;
		flex: none;
		inline-size: 44px;
		block-size: 44px;
		border-radius: var(--r-pill);
		border: 1px solid transparent;
		background: transparent;
		color: var(--ink);
		transition: transform var(--d-fast) var(--ease-spring);
	}

	/* the button's own transparent fill would win over .liquid */
	.glass {
		background: var(--grain), var(--glass-strong);
		border-color: var(--glass-border);
		box-shadow: var(--glass-rim), var(--shadow-card);
	}

	.outline {
		border-color: var(--line);
	}

	.solid {
		background: var(--solid);
		color: var(--on-solid);
	}

	.icon-btn:hover {
		transform: rotate(18deg) scale(1.04);
	}

	.icon-btn:active {
		transform: scale(0.94);
	}
</style>
