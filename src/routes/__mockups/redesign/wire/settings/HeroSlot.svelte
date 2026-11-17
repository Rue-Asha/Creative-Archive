<script lang="ts">
	import Icon from '../shell/Icon.svelte';
	import type { Slot } from './data.ts';

	let { slot }: { slot: Slot } = $props();
	const busy = $derived(slot.state === 'pending');
	const id = $props.id();
</script>

<section class="fw-card slot" aria-labelledby="slot-{id}" data-slot={slot.world}>
	<h2 id="slot-{id}">{slot.label}</h2>
	<div class="preview" data-photo={slot.photo}>
		{#if slot.photo}
			<Icon name="image" size={28} />
		{:else}
			<p>No photo yet</p>
		{/if}
	</div>
	{#if busy}<p class="fw-note" role="status">Uploading…</p>{/if}
	{#if slot.error}<p class="error" role="alert"><Icon name="alert" size={18} />{slot.error}</p>{/if}
	<div class="actions">
		{#if slot.photo}
			<button type="button" class="fw-btn" disabled={busy}>Replace</button>
			<button type="button" class="fw-btn" disabled={busy}>Remove</button>
		{:else}
			<button type="button" class="fw-btn" disabled={busy}><Icon name="upload" size={18} />Upload</button>
		{/if}
	</div>
</section>

<style>
	.slot { align-content: start; }
	h2 { font-size: var(--type-display-s-size); line-height: var(--type-display-s-line); }
	.preview { display: grid; place-items: center; aspect-ratio: 16 / 9; border-radius: var(--radius-panel); background: var(--surface-field); color: var(--ink-secondary); }
	.preview[data-photo="true"] { background: var(--surface-plate-2); }
	.preview p { font-size: var(--type-body-s-size); }
	.error { display: flex; align-items: flex-start; gap: var(--space-2); font-size: var(--type-body-s-size); font-weight: var(--weight-semibold); overflow-wrap: anywhere; }
	.error :global(svg) { flex: none; margin-block-start: var(--space-0-5); }
	.actions { display: flex; flex-wrap: wrap; gap: var(--space-3); }
	.actions .fw-btn { flex: 1 1 8rem; }
</style>
