<script lang="ts">
	import Icon from '../shell/Icon.svelte';

	// Step buttons around a value that is a button until activated, then a numeric field (never a keyboard until then).
	type Props = { label: string; current: number; total: number | null; mode?: 'view' | 'edit'; typed?: string };
	let { label, current, total, mode = 'view', typed = '' }: Props = $props();
	const of = $derived(total === null ? 'unknown' : String(total));
</script>

<div class="counter" role="group" aria-label={label}>
	<span class="name">{label}</span>
	<button type="button" class="btn icon s" aria-label="{label}: one less" disabled={current <= 0} data-press="round"><Icon name="minus" size={16} /></button>
	{#if mode === 'edit'}
		<div class="field pill"><div class="control"><input type="text" inputmode="numeric" aria-label={label} value={typed || String(current)} /></div></div>
	{:else}
		<button type="button" class="value figures" aria-label="{label} {current} of {of}">{current} / {total ?? '?'}</button>
	{/if}
	<button type="button" class="btn icon s" aria-label="{label}: one more" disabled={total !== null && current >= total} data-press="round"><Icon name="plus" size={16} /></button>
</div>

<style>
	.counter { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); }
	.name { flex: 1 0 100%; font-size: var(--type-label-size); line-height: var(--type-label-line); font-weight: var(--type-label-weight); }
	.value { min-block-size: max(var(--control-height), var(--target)); min-inline-size: 7rem; padding: 0 var(--space-4); border: 0; border-radius: var(--radius-control); background: var(--surface-sunken); box-shadow: var(--ring-hairline); color: var(--ink); font-family: var(--font-display); font-size: var(--type-display-s-size); text-align: center; cursor: text; }
	.field { max-inline-size: 7.5rem; }
	.btn.icon.s { background: var(--surface-control-solid); box-shadow: none; }
</style>
