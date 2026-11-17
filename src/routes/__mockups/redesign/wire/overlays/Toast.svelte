<script lang="ts">
	import Icon from './Icon.svelte';

	let { message, action, quiet = false }: { message: string; action?: string; quiet?: boolean } = $props();
</script>

<div class="toast" class:quiet>
	<span class="msg">{message}</span>
	{#if action}<button type="button" class="act">{action}</button>{/if}
	<button type="button" class="dismiss" aria-label="Dismiss"><Icon name="close" size={16} /></button>
</div>

<style>
	.toast {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-2) var(--space-2) var(--space-5);
		min-block-size: var(--target-touch);
		border-radius: var(--radius-pill);
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
		box-shadow: var(--shadow-lift);
		min-inline-size: 0;
	}
	.quiet {
		background: var(--surface-inverse-raised);
	}
	.msg {
		flex: 1;
		min-inline-size: 0;
		overflow-wrap: anywhere;
		padding-block: var(--space-1);
		font-size: var(--type-label-size);
		line-height: var(--type-body-s-line);
	}
	.act,
	.dismiss {
		flex: none;
		display: grid;
		place-items: center;
		min-block-size: var(--target-touch);
		min-inline-size: var(--target-touch);
		padding-inline: var(--space-3);
		border: 0;
		border-radius: var(--radius-pill);
		background: var(--surface-inverse-tint);
		color: var(--ink-on-inverse);
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
	}
	.dismiss {
		padding-inline: 0;
		border-radius: var(--radius-round);
		background: transparent;
	}
</style>
