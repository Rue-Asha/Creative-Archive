<script lang="ts">
	import { onDestroy } from 'svelte';
	import { COPY } from '#lib/copy.ts';
	import { handlesFromUrl } from './handles.ts';
	import type { EntryType } from '#lib/types.ts';

	let { type, onimage }: { type: EntryType; onimage: (image: string | null) => void } = $props();

	let url = $state('');
	let phase = $state<'idle' | 'loading' | 'done'>('idle');
	let invalid = $state(false);
	let image = $state<string | null>(null);
	let controller: AbortController | undefined;

	const isHttpUrl = (value: string) => {
		try {
			return ['http:', 'https:'].includes(new URL(value).protocol);
		} catch {
			return false;
		}
	};

	// the form owns its fields; the preview writes into them like typing would, so its bindings and unsaved check follow
	function fill(name: string, value: string | null | undefined) {
		const el = document.querySelector<HTMLInputElement>(`form.entry-form [name="${name}"]`);
		if (!el || !value || el.value.trim() !== '') return;
		el.value = value;
		el.dispatchEvent(new Event('input', { bubbles: true }));
	}

	async function run() {
		controller?.abort();
		const value = url.trim();
		invalid = false;
		if (!value) {
			phase = 'idle';
			image = null;
			onimage(null);
			return;
		}
		if (!isHttpUrl(value)) {
			invalid = true;
			phase = 'idle';
			return;
		}
		if (type === 'influencer') {
			for (const [name, handle] of Object.entries(handlesFromUrl(value) ?? {})) fill(`details.handles.${name}`, handle);
		}
		controller = new AbortController();
		phase = 'loading';
		try {
			const res = await fetch(`/add/${type}/preview`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ url: value }),
				signal: controller.signal
			});
			const body: { title: string | null; description: string | null; image: string | null } | { error: string } = await res.json();
			if ('error' in body) {
				invalid = true;
				phase = 'idle';
				return;
			}
			image = body.image;
			onimage(body.image);
			fill('title', body.title);
			fill('details.description', body.description);
			fill('details.url', value);
			phase = 'done';
		} catch (e) {
			if (e instanceof DOMException && e.name === 'AbortError') return;
			image = null;
			onimage(null);
			phase = 'done';
		}
	}

	function key(event: KeyboardEvent) {
		if (event.key !== 'Enter') return;
		event.preventDefault();
		void run();
	}

	onDestroy(() => controller?.abort());
</script>

<section class="preview liquid" aria-label="URL preview">
	<div class="field">
		<label for="preview-url">Page URL</label>
		<input
			id="preview-url"
			class="control"
			type="text"
			inputmode="url"
			bind:value={url}
			onchange={run}
			onkeydown={key}
			oninput={() => (invalid = false)}
			placeholder="https://"
			autocomplete="off"
			autocapitalize="off"
			spellcheck="false"
			aria-invalid={invalid ? 'true' : undefined}
			aria-describedby={invalid ? 'e-preview-url' : undefined}
		/>
		{#if invalid}<p class="error" id="e-preview-url" role="alert">{COPY.invalidUrl}</p>{/if}
	</div>

	<div class="status" role="status">
		{#if phase === 'loading'}
			<p class="note">Looking up the page…</p>
		{:else if phase === 'done' && image === null}
			<p class="note">{COPY.noPreview}</p>
		{/if}
	</div>

	{#if image}
		<img class="thumb" src={image} alt="Page preview" />
	{/if}
</section>

<style>
	.preview {
		display: flex;
		flex-direction: column;
		gap: var(--s-4);
		padding: var(--s-6);
		border-radius: var(--r-panel);
		--field-error: var(--error);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--s-2);
	}

	label {
		font-weight: 600;
		font-size: var(--t-small);
	}

	.control {
		inline-size: 100%;
		min-block-size: 52px;
		padding: 0 var(--s-5);
		border-radius: var(--r-pill);
		border: 1px solid var(--line);
		background: var(--glass-thin);
		font-size: var(--t-body);
		transition: border-color var(--d-fast) var(--ease-out);
	}

	.control:focus-visible {
		border-color: var(--accent);
	}

	.control[aria-invalid='true'] {
		border-color: var(--field-error);
	}

	.error {
		margin: 0;
		color: var(--field-error);
		font-size: var(--t-small);
	}

	.status:empty {
		display: none;
	}

	.note {
		margin: 0;
		color: var(--ink-2);
		font-size: var(--t-small);
		padding-inline: var(--s-2);
	}

	.thumb {
		max-inline-size: 160px;
		max-block-size: 160px;
		border-radius: var(--r-md);
		object-fit: cover;
	}
</style>
