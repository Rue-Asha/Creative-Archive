<script lang="ts">
	import Icon from './Icon.svelte';

	type Props = { image?: 'none' | 'set' | 'heic' | 'large'; preview?: boolean };
	let { image = 'none', preview = false }: Props = $props();
</script>

<div class="w-image" data-invalid={image === 'heic' || image === 'large' ? '' : undefined}>
	<span class="w-label">Image</span>
	<div class="w-image-frame" role="img" aria-label={image === 'set' ? 'Preview' : 'No image'}>
		<span><Icon name="image" size={28} />{image === 'set' ? 'Preview' : preview ? 'Page preview' : 'No image yet'}</span>
	</div>
	<div class="w-image-actions">
		<button type="button" class="w-btn s"><Icon name={image === 'set' ? 'edit' : 'plus'} size={14} />{image === 'set' ? 'Replace' : 'Add image'}</button>
		{#if image === 'set'}<button type="button" class="w-btn s quiet">Remove image</button>{/if}
	</div>
	{#if image === 'heic'}<span class="w-error" role="alert"><Icon name="alert" size={14} />Unsupported image type</span>{/if}
	{#if image === 'large'}<span class="w-error" role="alert"><Icon name="alert" size={14} />Image is larger than 16 MB</span>{/if}
</div>
