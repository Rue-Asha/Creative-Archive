<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { COPY } from '#lib/copy.ts';
	import EntryCard from '#lib/entries/EntryCard.svelte';
	import { fadeSlide, hideOnOutro, reveal, stagger } from '#lib/motion.ts';
	import { toast } from '#lib/shell/toast.ts';
	import Button from '#lib/ui/Button.svelte';
	import Chip from '#lib/ui/Chip.svelte';
	import Eyebrow from '#lib/ui/Eyebrow.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const collection = $derived(data.collection);

	let renaming = $state(false);
	let name = $state<HTMLInputElement>();
	const error = $derived(renaming ? form?.errors?.name : undefined);

	async function rename() {
		renaming = true;
		await tick();
		name?.focus();
	}

	let confirming = $state(false);
	let deleting = $state(false);
	let dialog = $state<HTMLDivElement>();
	let opener: Element | null = null;

	async function askDelete() {
		opener = document.activeElement;
		confirming = true;
		await tick();
		dialog?.querySelector('button')?.focus();
	}

	async function cancelDelete() {
		confirming = false;
		await tick();
		(opener as HTMLElement | null)?.focus();
	}

	function dialogKeys(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			cancelDelete();
		} else if (event.key === 'Tab') {
			const items = [...dialog!.querySelectorAll<HTMLElement>('button:not(:disabled)')];
			const at = items.indexOf(document.activeElement as HTMLElement);
			event.preventDefault();
			items[(at + (event.shiftKey ? -1 : 1) + items.length) % items.length].focus();
		}
	}
</script>

<svelte:head><title>{collection.name} · Collections · Creative Archive</title></svelte:head>

<div class="page">
	<header class="column head">
		<Eyebrow parts={['Collections']} tone="accent" />
		<div class="title-row">
			<h1>{collection.name}</h1>
			<span class="count tnum" data-count aria-label="{collection.count} {collection.count === 1 ? 'entry' : 'entries'}">{collection.count}</span>
		</div>
		{#if collection.description}<p class="description">{collection.description}</p>{/if}
		<div class="tools" inert={confirming} aria-hidden={confirming ? 'true' : undefined}>
			{#if !renaming}<Button variant="secondary" arrow={false} onclick={rename}>Rename</Button>{/if}
			<Button variant="secondary" arrow={false} onclick={askDelete}>Delete collection</Button>
		</div>
	</header>

	{#if renaming}
		<div class="column">
			<GlassPanel strong>
				<form
					class="rename"
					method="POST"
					action="?/rename"
					use:enhance={() =>
						async ({ result, update }) => {
							await update({ reset: false });
							if (result.type === 'success') renaming = false;
						}}
				>
					<div class="field">
						<label for="collection-name">Name</label>
						<input id="collection-name" class="control" name="name" autocomplete="off" value={collection.name} aria-invalid={error ? 'true' : undefined} aria-describedby={error ? 'collection-name-error' : undefined} bind:this={name} />
						{#if error}<span class="error" id="collection-name-error">{error}</span>{/if}
					</div>
					<div class="field">
						<label for="collection-description">Description</label>
						<textarea id="collection-description" class="control" name="description" rows="1" value={collection.description}></textarea>
					</div>
					<div class="actions">
						<Button variant="secondary" arrow={false} onclick={() => (renaming = false)}>Cancel</Button>
						<Button type="submit" arrow={false}>Save</Button>
					</div>
				</form>
			</GlassPanel>
		</div>
	{/if}

	{#if collection.entries.length}
		<section class="column" aria-label="Entries">
			<ul class="grid">
				{#each collection.entries as entry, i (entry.id)}
					<li use:reveal={{ delay: stagger(i) }}>
						<EntryCard {entry} />
						<div class="under">
							<span data-type-chip><Chip static size="sm" tone="soft" label={data.typeLabels[entry.id]} /></span>
							<form method="POST" action="?/remove" use:enhance>
								<input type="hidden" name="entryId" value={entry.id} />
								<button type="submit" class="remove" aria-label="Remove {entry.title}">Remove</button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		</section>
	{:else}
		<section class="column empty" aria-label="Empty collection">
			<h2>Nothing in here yet</h2>
			<p>Use "Add to collection" on any entry's page.</p>
		</section>
	{/if}
</div>

{#if confirming}
	<div class="overlay" role="presentation" onpointerdown={(e) => e.target === e.currentTarget && cancelDelete()}>
		<div
			class="dialog liquid liquid-strong"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			aria-labelledby="delete-collection-title"
			bind:this={dialog}
			onkeydown={dialogKeys}
			transition:fadeSlide={{ y: 14 }}
			use:hideOnOutro
		>
			<h2 id="delete-collection-title">Delete this collection?</h2>
			<p class="name">{collection.name}</p>
			<p>Its entries stay in your archive.</p>
			<form
				method="POST"
				action="?/delete"
				use:enhance={({ cancel }) => {
					if (deleting) return cancel();
					deleting = true;
					return async ({ result, update }) => {
						if (result.type === 'redirect') toast(COPY.deleted);
						await update();
						deleting = false;
					};
				}}
			>
				<Button variant="secondary" arrow={false} onclick={cancelDelete}>Cancel</Button>
				<Button type="submit" arrow={false} disabled={deleting}>Delete</Button>
			</form>
		</div>
	</div>
{/if}

<style>
	.page {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--s-6);
		padding-block-start: var(--nav-top);
	}

	.head {
		display: grid;
		gap: var(--s-2);
	}

	.title-row {
		display: flex;
		align-items: baseline;
		gap: var(--s-3);
	}

	h1 {
		overflow-wrap: anywhere;
	}

	.count {
		font-size: var(--t-small);
		font-weight: 600;
		color: var(--ink-2);
		padding: 2px 10px;
		border-radius: var(--r-pill);
		background: var(--accent-wash);
		translate: 0 -4px;
	}

	.description {
		max-inline-size: 60ch;
		color: var(--ink-2);
		overflow-wrap: anywhere;
	}

	.tools {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-3);
		margin-block-start: var(--s-3);
	}

	.rename {
		--field-error: color-mix(in srgb, var(--ink) 45%, tomato);
		display: grid;
		gap: var(--s-4);
		padding: var(--s-6);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.field > label {
		font-size: var(--t-small);
		font-weight: 600;
	}

	.control {
		inline-size: 100%;
		min-block-size: 46px;
		padding: 11px 14px;
		border-radius: var(--r-sm);
		border: 1px solid var(--line);
		background: var(--glass-thin);
		font-size: 15px;
		line-height: 1.45;
		transition: border-color var(--d-fast) var(--ease-out);
	}

	textarea.control {
		resize: vertical;
		field-sizing: content;
	}

	.control:focus-visible {
		border-color: var(--accent);
		border-radius: var(--r-sm);
	}

	.control[aria-invalid='true'] {
		border-color: var(--field-error);
	}

	.error {
		font-size: var(--t-small);
		font-weight: 500;
		color: var(--field-error);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--s-3);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		align-items: end;
		gap: var(--s-5) var(--s-3);
	}

	.under {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-2);
		margin-block-start: var(--s-2);
	}

	.under form {
		display: contents;
	}

	.remove {
		min-block-size: 44px;
		padding: 0 var(--s-3);
		border: 0;
		background: transparent;
		font-size: 14px;
		font-weight: 500;
		color: var(--ink-2);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.empty {
		display: grid;
		justify-items: start;
		gap: var(--s-3);
		padding-block: var(--s-8);
	}

	.empty p {
		color: var(--ink-2);
	}

	.overlay {
		position: fixed;
		inset: 0;
		z-index: 80;
		display: grid;
		place-items: center;
		padding: var(--s-4);
		background: var(--scrim-end);
	}

	.dialog {
		display: grid;
		gap: var(--s-3);
		inline-size: min(100%, 440px);
		padding: var(--s-7);
		border-radius: var(--r-panel);
	}

	.dialog h2 {
		font-size: var(--t-display-3);
	}

	.name {
		font-weight: 600;
		overflow-wrap: anywhere;
	}

	.dialog p:last-of-type {
		color: var(--ink-2);
	}

	.dialog form {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--s-3);
		margin-block-start: var(--s-4);
	}

	@media (min-width: 1024px) {
		.grid {
			grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
			gap: var(--s-6) var(--s-4);
		}
	}
</style>
