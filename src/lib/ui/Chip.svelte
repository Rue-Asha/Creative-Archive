<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import Icon, { type IconName } from './Icon.svelte';

	type Props = {
		label: string;
		active?: boolean;
		count?: number;
		icon?: IconName;
		// static chips (tags on a card) are not controls
		static?: boolean;
		href?: string;
		size?: 'md' | 'sm';
		tone?: 'line' | 'glass' | 'soft';
		onclick?: (event: MouseEvent) => void;
		class?: string;
	} & Omit<HTMLAttributes<HTMLElement>, 'class' | 'onclick'>;

	let {
		label,
		active = false,
		count,
		icon,
		static: isStatic = false,
		href,
		size = 'md',
		tone = 'line',
		onclick,
		class: cls = '',
		...rest
	}: Props = $props();
</script>

{#snippet inner()}
	{#if icon}<Icon name={icon} size={size === 'sm' ? 13 : 16} />{/if}
	<span>{label}</span>
	{#if count !== undefined}<span class="count tnum">{count}</span>{/if}
{/snippet}

{#if isStatic}
	<span class="chip {size} {tone} {cls}" class:active class:liquid={tone === 'glass'} class:liquid-strong={tone === 'glass'} {...rest}>{@render inner()}</span>
{:else if href}
	<a class="chip {size} {tone} {cls}" class:active class:liquid={tone === 'glass'} class:liquid-strong={tone === 'glass'} {href} aria-current={active ? 'page' : undefined} {...rest}>{@render inner()}</a>
{:else}
	<button type="button" class="chip {size} {tone} {cls}" class:active class:liquid={tone === 'glass'} class:liquid-strong={tone === 'glass'} aria-pressed={active} {onclick} {...rest}>
		{@render inner()}
	</button>
{/if}

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		flex: none;
		min-block-size: 40px;
		padding: 0 var(--s-4);
		border-radius: var(--r-pill);
		border: 1px solid var(--line);
		background: transparent;
		color: var(--ink);
		font-size: 14px;
		font-weight: 500;
		line-height: 1;
		white-space: nowrap;
		transition:
			transform var(--d-fast) var(--ease-out),
			background-color var(--d-fast) var(--ease-out),
			border-color var(--d-fast) var(--ease-out),
			color var(--d-fast) var(--ease-out);
	}

	button.chip:hover:not(.active),
	a.chip:hover:not(.active) {
		transform: translateY(-1px);
		border-color: var(--ink-2);
	}

	button.chip:active,
	a.chip:active {
		transform: scale(0.96);
	}

	/* the chip's own transparent fill would win over .liquid */
	.glass {
		background: var(--grain), var(--glass-strong);
		border-color: var(--glass-border);
		box-shadow: var(--glass-rim);
	}

	.soft {
		background: var(--accent-soft);
		border-color: transparent;
	}

	.active {
		background: var(--accent);
		border-color: var(--accent);
		color: var(--accent-ink);
	}

	.count {
		font-size: 12px;
		color: var(--ink-2);
	}

	.active .count {
		color: inherit;
		opacity: 0.8;
	}

	.sm {
		min-block-size: 26px;
		padding: 0 11px;
		font-size: 12px;
		gap: 4px;
	}

	@media (max-width: 1023px) {
		button.chip,
		a.chip {
			min-block-size: 44px;
		}
	}
</style>
