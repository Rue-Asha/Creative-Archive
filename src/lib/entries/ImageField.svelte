<script lang="ts" module>
	import { cubicOut } from 'svelte/easing';
	import type { TransitionConfig } from 'svelte/transition';
	import { reducedMotion } from '#lib/motion.ts';

	// mirrors MAX_UPLOAD_BYTES in the server's images.ts, which pulls in sharp and cannot ship to the browser
	const MAX_BYTES = 16 * 1024 * 1024;
	const MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/heif', 'image/heic']);
	const EXTENSION = /\.(jpe?g|png|webp|gif|avif|heic|heif)$/i;

	// the new picture settles in from slightly zoomed while the old one fades behind it
	function swap(_node: Element, { leaving = false }: { leaving?: boolean } = {}): TransitionConfig {
		if (reducedMotion()) return { duration: 0 };
		return {
			duration: leaving ? 220 : 400,
			easing: cubicOut,
			css: (t, u) => (leaving ? `opacity: ${t}` : `opacity: ${t}; transform: scale(${(1 + u * 0.05).toFixed(3)})`)
		};
	}
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import { COPY } from '#lib/copy.ts';
	import { hideOnOutro } from '#lib/motion.ts';
	import type { Id } from '#lib/types.ts';
	import Button from '#lib/ui/Button.svelte';
	import IconButton from '#lib/ui/IconButton.svelte';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';

	// `removed` and `picked` (the chosen file's name) are posted with the form and also drive its unsaved check
	let {
		title,
		imageId = null,
		removed = $bindable(false),
		picked = $bindable(''),
		error = '',
		ondirty
	}: {
		title: string;
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
		} else if (!(MIME.has(file.type) || (file.type === '' && EXTENSION.test(file.name)))) {
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

<div class="image-field">
	<span class="label" id="image-label">Image</span>
	<div class="frame" role="group" aria-labelledby="image-label">
		{#key src ?? 'none'}
			<div class="layer" in:swap out:swap={{ leaving: true }} use:hideOnOutro>
				{#if src}
					<img {src} alt="Preview" />
				{:else}
					<ImagePlaceholder {title} tint={null} />
				{/if}
			</div>
		{/key}
		<div class="actions">
			<Button variant="glass" icon="image" onclick={() => fileInput.click()}>{src ? 'Replace' : 'Add image'}</Button>
			{#if src}<IconButton icon="x" label="Remove image" onclick={remove} />{/if}
		</div>
	</div>

	<input
		bind:this={fileInput}
		class="visually-hidden"
		type="file"
		name="image"
		accept="image/*"
		tabindex="-1"
		aria-label="Photo file"
		onchange={onFile}
	/>
	<input type="hidden" name="removeImage" value={removed ? '1' : ''} />
	{#if message}<p class="error" id="e-image" role="alert">{message}</p>{/if}
</div>

<style>
	.image-field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-inline-size: 0;
	}

	.label {
		font-size: var(--t-small);
		font-weight: 600;
	}

	.frame {
		position: relative;
		display: grid;
		aspect-ratio: 1;
		border-radius: var(--r-card);
		overflow: hidden;
		isolation: isolate;
		background: var(--surface-2);
	}

	.layer {
		grid-area: 1 / 1;
		min-inline-size: 0;
		min-block-size: 0;
	}

	.layer img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.actions {
		position: absolute;
		inset-inline: var(--s-3);
		inset-block-end: var(--s-3);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-2);
		z-index: 1;
	}
</style>
