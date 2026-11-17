<script lang="ts">
	import Icon from './Icon.svelte';

	type Props = { mode?: 'idle' | 'loading' | 'found' | 'none' | 'invalid'; url?: string };
	let { mode = 'idle', url = '' }: Props = $props();
</script>

<section class="card w-form" data-surface="solid" aria-label="Page URL">
	<label class="w-field" data-invalid={mode === 'invalid' ? '' : undefined}>
		<span class="w-label">Page URL</span>
		<input class="w-input" type="url" inputmode="url" placeholder="https://" value={url} aria-invalid={mode === 'invalid' ? 'true' : undefined} />
		{#if mode === 'invalid'}<span class="w-error" role="alert"><Icon name="alert" size={14} />Enter a valid http or https URL</span>{/if}
	</label>
	{#if mode === 'loading'}
		<p class="w-status-line" role="status"><Icon name="spinner" size={14} />Looking up the page…</p>
	{:else if mode === 'found'}
		<div class="w-image">
			<div class="w-image-frame" role="img" aria-label="Page preview"><span><Icon name="image" size={28} />Page preview</span></div>
			<p class="w-hint">The found title fills an empty name, the description an empty Description, the URL an empty URL field. Fields you filled stay as they are.</p>
		</div>
	{:else if mode === 'none'}
		<p class="w-status-line" role="status"><Icon name="alert" size={14} />No preview found</p>
		<p class="w-hint">Instagram and similar pages give no preview. The form below stays fully usable, with manual image upload.</p>
	{/if}
</section>
