<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import CollectionCard from '#lib/collections/CollectionCard.svelte';
	import { reveal, stagger } from '#lib/motion.ts';
	import Button from '#lib/ui/Button.svelte';
	import Eyebrow from '#lib/ui/Eyebrow.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let creating = $state(false);
	let name = $state<HTMLInputElement>();
	const error = $derived(creating ? form?.errors?.name : undefined);

	async function show() {
		creating = true;
		await tick();
		name?.focus();
	}
</script>

<svelte:head><title>Collections · Creative Archive</title></svelte:head>

<div class="page">
	<header class="column head">
		<Eyebrow parts={['Archive']} tone="accent" />
		<div class="title-row">
			<h1>Collections</h1>
			<span class="count tnum">{data.collections.length}</span>
			{#if !creating}<Button variant="accent" class="add" onclick={show}>New collection</Button>{/if}
		</div>
	</header>

	{#if creating}
		<div class="column">
			<GlassPanel strong>
				<form
					class="new"
					method="POST"
					action="?/create"
					use:enhance={() =>
						async ({ result, update }) => {
							await update();
							if (result.type === 'success') creating = false;
						}}
				>
					<div class="field">
						<label for="collection-name">Name</label>
						<input id="collection-name" class="control" name="name" autocomplete="off" aria-invalid={error ? 'true' : undefined} aria-describedby={error ? 'collection-name-error' : undefined} bind:this={name} />
						{#if error}<span class="error" id="collection-name-error">{error}</span>{/if}
					</div>
					<div class="field">
						<label for="collection-description">Description</label>
						<textarea id="collection-description" class="control" name="description" rows="1"></textarea>
					</div>
					<div class="actions">
						<Button variant="secondary" arrow={false} onclick={() => (creating = false)}>Cancel</Button>
						<Button type="submit" arrow={false}>Create</Button>
					</div>
				</form>
			</GlassPanel>
		</div>
	{/if}

	{#if data.collections.length}
		<section class="column" aria-label="All collections">
			<ul class="grid">
				{#each data.collections as collection, i (collection.id)}
					<li use:reveal={{ delay: stagger(i) }}><CollectionCard {collection} /></li>
				{/each}
			</ul>
		</section>
	{:else if !creating}
		<section class="column empty" aria-label="No collections">
			<h2>No collections yet</h2>
			<p>Group entries of any kind into one place.</p>
		</section>
	{/if}
</div>

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
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--s-3);
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

	.title-row :global(.add) {
		margin-inline-start: auto;
		align-self: center;
	}

	.new {
		--field-error: var(--error);
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
		font-size: var(--t-body);
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
		gap: var(--s-6) var(--s-4);
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

	@media (min-width: 1024px) {
		.grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
			gap: var(--s-7) var(--s-5);
		}
	}
</style>
