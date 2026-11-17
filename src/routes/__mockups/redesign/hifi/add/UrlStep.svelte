<script lang="ts">
	import Icon from '../shell/Icon.svelte';
	import Glyph from '../list/Glyph.svelte';
	import { photo } from '../../fixtures.ts';

	type Props = { mode?: 'idle' | 'loading' | 'found' | 'none' | 'invalid'; url?: string };
	let { mode = 'idle', url = '' }: Props = $props();
	const id = $props.id();
</script>

<section class="card step" data-surface="solid" aria-label="Page URL">
	<div class="field pill" class:invalid={mode === 'invalid'}>
		<label for="{id}-u">Page URL</label>
		<div class="control"><input id="{id}-u" type="url" inputmode="url" placeholder="https://" value={url} autocomplete="off" aria-invalid={mode === 'invalid' ? 'true' : undefined} aria-describedby={mode === 'invalid' ? `${id}-e` : undefined} /></div>
		{#if mode === 'invalid'}<p class="error" id="{id}-e" role="alert"><Icon name="alert" size={14} />Enter a valid http or https URL</p>{/if}
	</div>
	{#if mode === 'loading'}
		<p class="status" role="status"><span class="spin"><Glyph name="spinner" size={14} /></span>Looking up the page…</p>
	{:else if mode === 'found'}
		<div class="found">
			<img src={photo('world-books')} alt="Page preview" />
			<p class="hint">The found title fills an empty name, the description an empty Description, the URL an empty URL field. Fields you filled stay as they are.</p>
		</div>
	{:else if mode === 'none'}
		<p class="status" role="status"><Icon name="alert" size={14} />No preview found</p>
		<p class="hint">Instagram and similar pages give no preview. The form below stays fully usable, with manual image upload.</p>
	{/if}
</section>

<style>
	.step { display: grid; gap: var(--space-3); padding: var(--space-5); }
	.status { display: flex; align-items: center; gap: var(--space-2); font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-secondary); }
	.hint { font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-secondary); max-inline-size: var(--measure); }
	.found { display: grid; grid-template-columns: 6rem minmax(0, 1fr); gap: var(--space-4); align-items: center; }
	.found img { inline-size: 100%; aspect-ratio: 1; object-fit: cover; border-radius: var(--radius-panel); }
	
	@media (max-width: 767px) { .step { padding: var(--space-4); } }
</style>
