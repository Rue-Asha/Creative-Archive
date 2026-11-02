<script lang="ts" module>
	// mirrors MAX_UPLOAD_BYTES in the server's images.ts, which pulls in sharp and cannot ship to the browser
	const MAX_BYTES = 16 * 1024 * 1024;
</script>

<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { COPY } from '#lib/copy.ts';
	import type { World } from '#lib/domains.ts';
	import { worldAttrs } from '#lib/styles/worlds.ts';
	import type { Id } from '#lib/types.ts';
	import Button from '#lib/ui/Button.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';

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

<GlassPanel as="section" class="slot" aria-labelledby="hero-{world}" data-slot={world} {...worldAttrs(world)}>
	<h2 id="hero-{world}">{label}</h2>
	<div class="frame">
		{#if image !== null}
			<img src="/images/{image}" alt="" />
		{:else}
			<span class="tint" data-tint aria-hidden="true"></span>
			<p class="empty">No photo yet</p>
		{/if}
	</div>

	<div class="actions">
		<form
			bind:this={form}
			method="POST"
			action="?/upload"
			enctype="multipart/form-data"
			use:enhance={submit}
		>
			<input type="hidden" name="world" value={world} />
			<input
				bind:this={input}
				class="visually-hidden"
				type="file"
				name="image"
				accept="image/*"
				tabindex="-1"
				aria-label="{label} photo file"
				onchange={onFile}
			/>
			<Button variant="secondary" arrow={false} icon={image === null ? 'image' : undefined} disabled={pending} onclick={() => input.click()}>
				{image !== null ? 'Replace' : 'Upload'}
			</Button>
		</form>
		{#if image !== null}
			<form method="POST" action="?/remove" use:enhance={submit}>
				<input type="hidden" name="world" value={world} />
				<Button variant="secondary" arrow={false} type="submit" disabled={pending}>Remove</Button>
			</form>
		{/if}
	</div>
	{#if message}<p class="error" role="alert">{message}</p>{/if}
</GlassPanel>

<style>
	:global(.slot) {
		display: grid;
		align-content: start;
		gap: var(--s-4);
		padding: var(--s-4);
	}

	h2 {
		margin: 0;
		padding-inline: var(--s-2);
		font-family: var(--font-display);
		font-weight: var(--display-weight);
		letter-spacing: var(--display-tracking);
		font-size: var(--t-display-3);
		line-height: var(--display-leading);
	}

	.frame {
		display: grid;
		place-items: center;
		aspect-ratio: 4 / 3;
		border-radius: var(--r-md);
		overflow: hidden;
		position: relative;
		background:
			var(--grain),
			linear-gradient(160deg, var(--accent-soft), var(--surface-2));
	}

	.tint {
		position: absolute;
		inset: -30% -40% 20% 10%;
		background: var(--accent-glow);
		mask-image: var(--glow-mask);
	}

	.frame img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.empty {
		position: relative;
		font-size: var(--t-small);
		font-weight: 500;
		color: var(--ink-2);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
	}

	.actions :global(.btn) {
		padding-inline: var(--s-3);
	}

	.error {
		margin: 0;
		padding-inline: var(--s-2);
		font-size: var(--t-small);
		font-weight: 600;
		color: var(--error);
	}
</style>
