<script module lang="ts">
	import type { IconName } from '../shell/Icon.svelte';

	export type Item = {
		label: string;
		icon?: IconName | 'up' | 'down' | 'select';
		checked?: boolean;
		hint?: string;
		danger?: boolean;
		disabled?: boolean;
		create?: boolean;
		sep?: boolean;
		focus?: boolean;
	};
</script>

<script lang="ts">
	import Icon from './Icon.svelte';
	import './overlays.css';

	// A menu drawn open in place; the live one is RowMenu.svelte (a popover anchored to its button).
	let { name, items, mode = 'item', maxBlock }: { name: string; items: Item[]; mode?: 'item' | 'radio' | 'check'; maxBlock?: string } = $props();
	const role = $derived(mode === 'radio' ? 'menuitemradio' : mode === 'check' ? 'menuitemcheckbox' : 'menuitem');
</script>

<div class="static-menu" role="menu" aria-label={name} style:max-block-size={maxBlock}>
	{#each items as item, i (i)}
		{#if item.sep}<div class="menu-rule" role="separator"></div>{/if}
		<button
			type="button"
			class="menu-item"
			class:danger={item.danger}
			class:create={item.create}
			role={item.create ? 'menuitem' : role}
			aria-checked={mode === 'item' || item.create ? undefined : !!item.checked}
			disabled={item.disabled}
			tabindex="-1"
			data-drawn-focus={item.focus ? '' : undefined}
		>
			{#if item.create}<Icon name="plus" size={16} />
			{:else if mode !== 'item'}<Icon name="check" size={16} />
			{:else if item.danger}<span class="lead"><Icon name="trash" size={16} /></span>
			{:else if item.icon}<span class="lead"><Icon name={item.icon} size={16} /></span>{/if}
			<span class="text">{item.label}</span>
			{#if item.hint}<span class="hint">{item.hint}</span>{/if}
		</button>
	{/each}
</div>
