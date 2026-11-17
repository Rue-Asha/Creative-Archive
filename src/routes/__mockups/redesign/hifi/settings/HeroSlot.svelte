<script lang="ts">
	import { page } from '$app/state';
	import { photo, type PhotoWorld } from '../../fixtures.ts';
	import Icon from '../shell/Icon.svelte';
	import type { Slot } from './data.ts';

	let { slot }: { slot: Slot } = $props();
	const busy = $derived(slot.state === 'pending');
	const mood = $derived((page.data as { photos?: Record<PhotoWorld, string> }).photos?.[slot.world]);
	const id = $props.id();
</script>

<section class="card slot" data-surface="solid" aria-labelledby="slot-{id}" data-slot={slot.world}>
	<h2 id="slot-{id}">{slot.label}</h2>
	<div class="preview" data-photo={slot.photo}>
		{#if slot.photo && mood}
			<img src={photo(mood)} alt="" />
		{:else}
			<p>No photo yet</p>
		{/if}
	</div>
	{#if busy}<p class="status" role="status">Uploading…</p>{/if}
	{#if slot.error}<p class="error" role="alert"><Icon name="alert" />{slot.error}</p>{/if}
	<div class="actions">
		{#if slot.photo}
			<button type="button" class="btn secondary" disabled={busy} data-press aria-label="Replace {slot.label} photo">Replace</button>
			<button type="button" class="btn secondary" disabled={busy} data-press aria-label="Remove {slot.label} photo">Remove</button>
		{:else}
			<button type="button" class="btn secondary" disabled={busy} data-press aria-label="Upload {slot.label} photo"><Icon name="upload" />Upload</button>
		{/if}
	</div>
</section>

<style>
	.slot { display: grid; align-content: start; gap: var(--space-3); padding: var(--space-4); min-inline-size: 0; }
	h2 { font-size: var(--type-display-s-size); line-height: var(--type-display-s-line); letter-spacing: var(--type-display-s-tracking); }
	.preview { display: grid; place-items: center; aspect-ratio: 16 / 9; overflow: hidden; border-radius: var(--radius-panel); background: var(--surface-field); box-shadow: var(--ring-hairline); }
	.preview img { inline-size: 100%; block-size: 100%; object-fit: cover; }
	.preview p { font-size: var(--type-body-s-size); color: var(--ink-secondary); }
	.status { font-size: var(--type-caption-size); color: var(--ink-secondary); }
	.error { display: flex; align-items: flex-start; gap: var(--space-2); font-size: var(--type-body-s-size); font-weight: var(--weight-semibold); color: var(--danger); overflow-wrap: anywhere; }
	.error :global(svg) { flex: none; margin-block-start: var(--space-0-5); }
	.actions { display: flex; flex-wrap: wrap; gap: var(--space-3); }
	.actions .btn { flex: 1 1 8rem; }
</style>
