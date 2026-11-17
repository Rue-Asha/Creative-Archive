<script lang="ts">
	import Icon from './Icon.svelte';

	type Props = { label: string; current: number; total: number | null; mode?: 'view' | 'edit'; typed?: string };
	let { label, current, total, mode = 'view', typed = '' }: Props = $props();

	const of = $derived(total === null ? 'unknown' : String(total));
</script>

<div class="w-counter" role="group" aria-label={label}>
	<span class="w-counter-label">{label}</span>
	<button type="button" class="w-btn icon s" aria-label="{label}: one less" disabled={current <= 0}><Icon name="minus" size={16} /></button>
	{#if mode === 'edit'}
		<input class="w-input" type="text" inputmode="numeric" aria-label={label} value={typed || String(current)} />
	{:else}
		<button type="button" class="w-progress-value figures" aria-label="{label} {current} of {of}">{current} / {total ?? '?'}</button>
	{/if}
	<button type="button" class="w-btn icon s" aria-label="{label}: one more" disabled={total !== null && current >= total}><Icon name="plus" size={16} /></button>
</div>
