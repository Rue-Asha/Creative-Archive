<script lang="ts">
	import { onDestroy } from 'svelte';
	import Field from '#lib/components/field/Field.svelte';
	import { COPY } from '#lib/copy.ts';
	import { TYPES } from './config.ts';
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
		if (TYPES[type].fields.some((f) => f.input === 'handles')) {
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

<section class="preview card" data-surface="solid" aria-label="URL preview">
	<Field
		id="preview-url"
		label="Page URL"
		inputmode="url"
		bind:value={url}
		onchange={run}
		onkeydown={key}
		oninput={() => (invalid = false)}
		placeholder="https://"
		autocomplete="off"
		autocapitalize="off"
		spellcheck={false}
		error={invalid ? COPY.invalidUrl : undefined}
	/>

	<div class="status" role="status">
		{#if phase === 'loading'}
			<p>Looking up the page…</p>
		{:else if phase === 'done' && image === null}
			<p>{COPY.noPreview}</p>
		{/if}
	</div>

	{#if image}
		<img class="found" src={image} alt="Page preview" />
	{/if}
</section>

<style>
	.preview {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-4);
	}

	.status:empty {
		display: none;
	}

	.status p {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}

	.found {
		inline-size: 6rem;
		aspect-ratio: 1;
		border-radius: var(--radius-panel);
		object-fit: cover;
	}

	@media (min-width: 768px) {
		.preview {
			padding: var(--space-5);
		}
	}
</style>
