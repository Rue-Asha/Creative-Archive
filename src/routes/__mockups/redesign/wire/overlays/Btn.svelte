<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	type Props = {
		variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
		icon?: 'up' | 'down' | 'grip' | 'trash' | 'check' | 'plus' | 'close' | 'select';
		arrow?: boolean;
		label?: string;
		disabled?: boolean;
		focused?: boolean;
		children?: Snippet;
	};
	let { variant = 'secondary', icon, arrow = false, label, disabled = false, focused = false, children }: Props = $props();
</script>

<button type="button" class="btn {variant}" class:round={!children} class:arrow class:focused aria-label={label} {disabled}>
	{#if icon}<Icon name={icon} size={18} />{/if}
	{#if children}<span class="text">{@render children()}</span>{/if}
	{#if arrow}<span class="circle"><Icon name="arrow" size={16} /></span>{/if}
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-block-size: var(--target-touch);
		min-inline-size: 0;
		max-inline-size: 100%;
		padding-inline: var(--space-5);
		border: 0;
		border-radius: var(--radius-control);
		background: var(--surface-control-solid);
		color: var(--ink);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
		text-align: start;
	}
	.text {
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}
	.round {
		inline-size: var(--target-touch);
		padding: 0;
		border-radius: var(--radius-round);
	}
	.primary {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.quiet {
		background: transparent;
	}
	.danger {
		background: var(--danger-soft);
		box-shadow: var(--ring-danger);
		color: var(--danger);
	}
	.arrow {
		padding-inline-end: var(--space-1-5);
	}
	.circle {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: calc(var(--target-touch) - var(--space-3));
		block-size: calc(var(--target-touch) - var(--space-3));
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		color: var(--ink);
	}
	.focused {
		box-shadow: var(--focus-halo);
	}
	.btn:disabled {
		background: var(--surface-tint);
		color: var(--ink-secondary);
		box-shadow: none;
		opacity: var(--disabled-opacity);
	}
</style>
