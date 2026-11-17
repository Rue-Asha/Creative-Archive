<script lang="ts" module>
	// mirrors MAX_UPLOAD_BYTES in the server's images.ts, which pulls in sharp and cannot ship to the browser
	const MAX_BYTES = 16 * 1024 * 1024;
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import { COPY } from '#lib/copy.ts';
	import { isAcceptedImageFile } from './imageFormats.ts';
	import Button from '#lib/components/button/Button.svelte';
	import type { Id } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';

	// `removed` and `picked` (the chosen file's name) are posted with the form and also drive its unsaved check
	let {
		imageId = null,
		removed = $bindable(false),
		picked = $bindable(''),
		error = '',
		ondirty
	}: {
		imageId?: Id | null;
		removed: boolean;
		picked: string;
		error?: string;
		ondirty?: () => void;
	} = $props();

	let fileInput: HTMLInputElement;
	let localError = $state('');
	let objectUrl = $state<string | null>(null);

	const src = $derived(objectUrl ?? (!removed && imageId !== null ? `/images/${imageId}` : null));
	const message = $derived(localError || error);

	function forget() {
		if (objectUrl) URL.revokeObjectURL(objectUrl);
		objectUrl = null;
	}

	function reject(text: string) {
		fileInput.value = '';
		picked = '';
		localError = text;
	}

	function onFile() {
		const file = fileInput.files?.[0] ?? null;
		forget();
		localError = '';
		ondirty?.();
		if (!file) {
			picked = '';
		} else if (!isAcceptedImageFile(file)) {
			reject(COPY.imageType);
		} else if (file.size > MAX_BYTES) {
			reject(COPY.imageSize);
		} else {
			picked = file.name;
			removed = false;
			objectUrl = URL.createObjectURL(file);
		}
	}

	function remove() {
		forget();
		fileInput.value = '';
		picked = '';
		removed = true;
		localError = '';
		ondirty?.();
	}

	onDestroy(forget);
</script>

<div class="image-field" data-invalid={message ? '' : undefined}>
	<span class="label" id="image-label">Image</span>
	<div class="picture" role="group" aria-labelledby="image-label" aria-describedby={message ? 'e-image' : undefined}>
		{#if src}
			<img {src} alt="Preview" />
		{:else}
			<span class="empty"><Icon name="image" size={28} />No image yet</span>
		{/if}
	</div>
	<div class="actions">
		<Button variant="secondary" size="s" onclick={() => fileInput.click()}>
			<Icon name={src ? 'upload' : 'plus'} size={16} />{src ? 'Replace' : 'Add image'}
		</Button>
		{#if src}<Button variant="quiet" size="s" onclick={remove}>Remove image</Button>{/if}
	</div>

	<input
		bind:this={fileInput}
		class="sr-only"
		type="file"
		name="image"
		accept="image/*"
		tabindex="-1"
		aria-label="Photo file"
		onchange={onFile}
	/>
	<input type="hidden" name="removeImage" value={removed ? '1' : ''} />
	{#if message}
		<p class="error" id="e-image" role="alert">
			<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16.5h.01" /></svg>
			{message}
		</p>
	{/if}
</div>

<style>
	.image-field {
		display: grid;
		align-content: start;
		gap: var(--space-2);
		min-inline-size: 0;
	}

	.label {
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
	}

	.picture {
		display: grid;
		place-items: center;
		justify-self: start;
		inline-size: min(100%, 15rem);
		aspect-ratio: 1;
		overflow: hidden;
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
		box-shadow: var(--ring-hairline);
		color: var(--ink-secondary);
	}

	[data-invalid] .picture {
		box-shadow: var(--ring-danger);
	}

	.picture img {
		align-self: stretch;
		justify-self: stretch;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.empty {
		display: grid;
		justify-items: center;
		gap: var(--space-2);
		font-size: var(--type-caption-size);
	}

	@media (min-width: 768px) {
		.picture {
			justify-self: stretch;
			inline-size: 100%;
		}
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.error {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		font-weight: var(--weight-semibold);
		color: var(--danger);
	}

	.error svg {
		display: inline;
		vertical-align: -0.15em;
		margin-inline-end: var(--space-1);
	}
</style>
