<script lang="ts">
	import { photo } from '../../fixtures.ts';
	import Icon from '../shell/Icon.svelte';

	type Props = { image?: 'none' | 'set' | 'heic' | 'large'; preview?: boolean };
	let { image = 'none', preview = false }: Props = $props();
	const id = $props.id();
	const bad = $derived(image === 'heic' || image === 'large');
</script>

<div class="image" data-invalid={bad || undefined}>
	<span class="label" id="{id}-l">Image</span>
	<div class="frame-box" role="img" aria-labelledby="{id}-l" aria-describedby={bad ? `${id}-e` : undefined}>
		{#if image === 'set'}
			<img src={photo('world-home')} alt="Preview" />
		{:else}
			<span class="empty"><Icon name="image" size={28} />{preview ? 'Page preview' : 'No image yet'}</span>
		{/if}
	</div>
	<div class="actions">
		<button type="button" class="btn secondary s" data-press><Icon name={image === 'set' ? 'upload' : 'plus'} size={16} />{image === 'set' ? 'Replace' : 'Add image'}</button>
		{#if image === 'set'}<button type="button" class="btn quiet s" data-press>Remove image</button>{/if}
	</div>
	{#if image === 'heic'}<p class="error" id="{id}-e" role="alert"><Icon name="alert" size={14} />Unsupported image type</p>{/if}
	{#if image === 'large'}<p class="error" id="{id}-e" role="alert"><Icon name="alert" size={14} />Image is larger than 16 MB</p>{/if}
</div>

<style>
	.image { display: grid; align-content: start; gap: var(--space-2); min-inline-size: 0; }
	.label { font-size: var(--type-label-size); line-height: var(--type-label-line); font-weight: var(--type-label-weight); }
	.frame-box { display: grid; place-items: center; aspect-ratio: 1; overflow: hidden; border-radius: var(--radius-panel); background: var(--surface-sunken); box-shadow: var(--ring-hairline); color: var(--ink-secondary); }
	.image[data-invalid] .frame-box { box-shadow: var(--ring-danger); }
	img { inline-size: 100%; block-size: 100%; object-fit: cover; }
	.empty { display: grid; justify-items: center; gap: var(--space-2); font-size: var(--type-caption-size); }
	.actions { display: flex; flex-wrap: wrap; gap: var(--space-2); }
	.error { font-size: var(--type-caption-size); line-height: var(--type-caption-line); font-weight: var(--weight-semibold); color: var(--danger); }
	.error :global(svg) { display: inline; vertical-align: -0.15em; margin-inline-end: var(--space-1); }
</style>
