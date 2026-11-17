<script module lang="ts">
	export type Item = {
		label: string;
		kind?: 'danger' | 'disabled' | 'create';
		checked?: boolean;
		hint?: string;
		sep?: boolean;
		heading?: boolean;
	};
</script>

<script lang="ts">
	import Icon from './Icon.svelte';

	let { name, items, mode = 'item', maxBlock }: { name: string; items: Item[]; mode?: 'item' | 'radio' | 'check'; maxBlock?: string } = $props();
	const role = $derived(mode === 'radio' ? 'menuitemradio' : mode === 'check' ? 'menuitemcheckbox' : 'menuitem');
</script>

<div class="menu" role="menu" aria-label={name} style:max-block-size={maxBlock}>
	{#each items as item, i (i)}
		{#if item.sep}<hr />{/if}
		{#if item.heading}
			<p class="head" role="presentation">{item.label}</p>
		{:else}
			<button
				type="button"
				class="item"
				class:checked={item.checked}
				class:danger={item.kind === 'danger'}
				class:lead={mode !== 'item'}
				{role}
				aria-checked={mode === 'item' ? undefined : !!item.checked}
				disabled={item.kind === 'disabled'}
			>
				{#if mode !== 'item'}<span class="mark" aria-hidden="true">{#if item.checked}<Icon name="check" size={16} />{/if}</span>{/if}
				{#if item.kind === 'create'}<span class="mark" aria-hidden="true"><Icon name="plus" size={16} /></span>{/if}
				<span class="text">{item.label}</span>
				{#if item.hint}<span class="hint">{item.hint}</span>{/if}
			</button>
		{/if}
	{/each}
</div>

<style>
	.menu {
		display: grid;
		align-content: start;
		gap: var(--space-0-5);
		inline-size: min(100%, 18rem);
		padding: var(--space-1-5);
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--elevation-menu);
		overflow-y: auto;
		min-inline-size: 0;
	}
	hr {
		inline-size: 100%;
		margin: var(--space-1) 0;
		border: 0;
		block-size: var(--stroke-hairline);
		background: var(--hairline);
	}
	.head {
		padding: var(--space-2) var(--space-3) var(--space-1);
		color: var(--ink-muted);
		font-size: var(--type-overline-size);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--type-overline-weight);
		text-transform: uppercase;
	}
	.item {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--space-2);
		min-block-size: var(--target-touch);
		padding: var(--space-1) var(--space-3);
		border: 0;
		border-radius: var(--radius-item);
		background: transparent;
		color: var(--ink);
		text-align: start;
		font-size: var(--type-label-size);
	}
	.item.lead {
		grid-template-columns: var(--space-5) minmax(0, 1fr) auto;
	}
	.item.checked {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.item.danger {
		color: var(--danger);
		font-weight: var(--weight-semibold);
	}
	.item:disabled {
		color: var(--ink-muted);
		opacity: var(--disabled-opacity);
	}
	.mark {
		display: grid;
		place-items: center;
	}
	.text {
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}
	.hint {
		color: var(--ink-muted);
		font-size: var(--type-caption-size);
	}
	.checked .hint {
		color: var(--ink-on-inverse-secondary);
	}
</style>
