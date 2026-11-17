<script lang="ts" module>
	// mirrors MAX_UPLOAD_BYTES in the server's images.ts, which pulls in sharp and cannot ship to the browser
	const MAX_BYTES = 16 * 1024 * 1024;
</script>

<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { COPY } from '#lib/copy.ts';
	import type { World } from '#lib/domains.ts';
	import type { Id } from '#lib/types.ts';
	import Button from '#lib/components/button/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';

	let { world, label, image, error = '' }: { world: World; label: string; image: Id | null; error?: string } = $props();

	let form: HTMLFormElement;
	let input: HTMLInputElement;
	let pending = $state(false);
	let localError = $state('');

	const message = $derived(localError || error);

	const submit: SubmitFunction = ({ cancel }) => {
		if (pending) return cancel();
		pending = true;
		return async ({ update }) => {
			await update();
			pending = false;
		};
	};

	function onFile() {
		localError = '';
		const file = input.files?.[0];
		if (!file) return;
		const rejected = !file.type.startsWith('image/') ? COPY.imageType : file.size > MAX_BYTES ? COPY.imageSize : '';
		if (rejected) {
			input.value = '';
			localError = rejected;
			return;
		}
		form.requestSubmit();
	}
</script>

<section class="card slot" data-surface="solid" aria-labelledby="hero-{world}" data-slot={world}>
	<h2 id="hero-{world}">{label}</h2>
	<div class="preview">
		{#if image !== null}
			<img src="/images/{image}" alt="" />
		{:else}
			<p>No photo yet</p>
		{/if}
	</div>
	{#if pending}<p class="status" role="status">Uploading…</p>{/if}
	{#if message}<p class="error" role="alert">{message}</p>{/if}

	<div class="actions">
		<form bind:this={form} method="POST" action="?/upload" enctype="multipart/form-data" use:enhance={submit}>
			<input type="hidden" name="world" value={world} />
			<input
				bind:this={input}
				class="sr-only"
				type="file"
				name="image"
				accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
				tabindex="-1"
				aria-label="{label} photo file"
				onchange={onFile}
			/>
			<Button variant="secondary" disabled={pending} label="{image !== null ? 'Replace' : 'Upload'} {label} photo" onclick={() => input.click()}>
				{#if image === null}<Icon name="upload" size={18} />{/if}{image !== null ? 'Replace' : 'Upload'}
			</Button>
		</form>
		{#if image !== null}
			<form method="POST" action="?/remove" use:enhance={submit}>
				<input type="hidden" name="world" value={world} />
				<Button variant="secondary" type="submit" disabled={pending} label="Remove {label} photo">Remove</Button>
			</form>
		{/if}
	</div>
</section>

<style>
	.slot {
		display: grid;
		align-content: start;
		gap: var(--space-3);
		padding: var(--space-4);
		min-inline-size: 0;
		block-size: 100%;
	}

	h2 {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
	}

	.preview {
		display: grid;
		place-items: center;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		border-radius: var(--radius-panel);
		background: var(--surface-field);
		box-shadow: var(--ring-hairline);
	}

	.preview img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.preview p {
		font-size: var(--type-body-s-size);
		color: var(--ink-secondary);
	}

	.status {
		font-size: var(--type-caption-size);
		color: var(--ink-secondary);
	}

	.error {
		font-size: var(--type-body-s-size);
		font-weight: var(--weight-semibold);
		color: var(--danger);
		overflow-wrap: anywhere;
	}

	/* Replace and Remove are equal quiet buttons sharing the row */
	.actions {
		display: grid;
		grid-auto-columns: minmax(0, 1fr);
		grid-auto-flow: column;
		gap: var(--space-2);
	}

	.actions :global(.btn) {
		inline-size: 100%;
		padding-inline: var(--space-3);
	}
</style>
