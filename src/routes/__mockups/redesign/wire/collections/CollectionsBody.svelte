<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import Btn from '../overlays/Btn.svelte';

	let { mode }: { mode: 'list' | 'new' | 'empty' } = $props();

	const data = $derived(mockData(new URL(page.url.href)));
	const worst = $derived(data.worst);
	const shown = $derived(mode === 'empty' ? [] : data.collections);
	const entries = $derived(shown.reduce((sum, c) => sum + c.count, 0));
	const q = $derived(worst ? '?data=worst' : '');
	const plural = (n: number, one: string, many: string) => `${n.toLocaleString('en')} ${n === 1 ? one : many}`;
	const draftDescription = $derived(worst ? data.collections[0].description : 'Things I want to come back to.');
</script>

<Frame world="home" section="collections" plus="shown">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Archive</li><li>{plural(shown.length, 'collection', 'collections')}</li></ul>
			<h1>Collections</h1>
			<p class="lede">Group entries of any kind into one place, in the order you choose.</p>
			{#if mode === 'list'}
				<Btn variant="primary" arrow>New collection</Btn>
			{/if}
		</div>
		{#if shown.length}
			<ul class="screen-facts" data-surface="inverse" aria-label="Collections at a glance">
				<li><span class="n">{shown.length.toLocaleString('en')}</span>Collections</li>
				<li><span class="n">{entries.toLocaleString('en')}</span>Entries inside</li>
			</ul>
		{/if}
	</div>

	<div class="screen-body" data-settle>
		{#if mode === 'new'}
			<form class="card form" data-surface="solid" aria-labelledby="new-h" onsubmit={(e) => e.preventDefault()}>
				<div class="card-head"><h2 id="new-h">New collection</h2><span class="card-note">The name is focused</span></div>
				<div class="field">
					<label for="c-name">Name</label>
					<input id="c-name" type="text" value="" aria-invalid="true" aria-describedby="c-name-err" />
					<p id="c-name-err" class="error" role="alert">Name is required</p>
				</div>
				<div class="field">
					<label for="c-desc">Description <span class="opt">optional</span></label>
					<textarea id="c-desc" rows="3">{draftDescription}</textarea>
				</div>
				<div class="actions">
					<Btn>Cancel</Btn>
					<Btn variant="primary" arrow>Create</Btn>
				</div>
			</form>
		{/if}

		{#if shown.length}
			<ul class="list" aria-label="Collections">
				{#each shown as c, i (c.id)}
					<li class="card item" data-surface="solid">
						<div class="collage" role="img" aria-label="{c.name} collage">
							{#each [0, 1, 2] as slot (slot)}
								<span class="tile" class:plate={!c.covers[slot]} data-slot={slot}></span>
							{/each}
							{#if !c.covers.length}<span class="none">No images yet</span>{/if}
						</div>
						<div class="body">
							<h2 class="name"><a href="/__mockups/redesign/wire/collection{q}">{c.name}</a></h2>
							{#if c.description}<p class="desc">{c.description}</p>{/if}
							<p class="count">{plural(c.count, 'entry', 'entries')}</p>
						</div>
					</li>
				{/each}
			</ul>
		{:else}
			<section class="card empty" data-surface="solid" aria-labelledby="none-h">
				<h2 id="none-h">No collections yet</h2>
				<p>Group entries of any kind into one place.</p>
				<Btn variant="primary" arrow>New collection</Btn>
			</section>
		{/if}
	</div>
</Frame>

<style>
	.list {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-4);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.item {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-4);
		padding: var(--space-4);
		min-inline-size: 0;
	}
	.collage {
		position: relative;
		display: grid;
		grid-template-columns: 2fr 1fr;
		grid-template-rows: 1fr 1fr;
		gap: var(--space-1-5);
		aspect-ratio: 16 / 9;
		min-inline-size: 0;
	}
	.tile {
		border-radius: var(--radius-item);
		background: var(--surface-tint-strong);
	}
	.tile[data-slot='0'] {
		grid-row: 1 / span 2;
	}
	.tile.plate {
		background: var(--surface-sunken);
		box-shadow: var(--ring-hairline);
	}
	.none {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		border-radius: var(--radius-item);
		background: var(--surface-sunken);
		box-shadow: var(--ring-hairline);
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
	}
	.body {
		display: grid;
		gap: var(--space-2);
		align-content: start;
		min-inline-size: 0;
	}
	.name {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}
	.name a {
		color: var(--ink);
		text-decoration: none;
	}
	.desc {
		color: var(--ink-secondary);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}
	.count {
		color: var(--ink-muted);
		font-size: var(--type-caption-size);
		font-variant-numeric: var(--numeric-figures);
	}
	.form {
		display: grid;
		gap: var(--space-4);
		padding: var(--space-6);
		max-inline-size: 40rem;
	}
	.field {
		display: grid;
		gap: var(--space-1-5);
		min-inline-size: 0;
	}
	label {
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
	}
	.opt {
		color: var(--ink-muted);
		font-weight: var(--weight-regular, 400);
	}
	input,
	textarea {
		inline-size: 100%;
		min-inline-size: 0;
		padding-inline: var(--space-5);
		border: 0;
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink);
		font: inherit;
	}
	input {
		block-size: max(var(--control-height), var(--target));
		border-radius: var(--radius-control);
		text-overflow: ellipsis;
	}
	textarea {
		padding-block: var(--space-3);
		border-radius: var(--radius-panel);
		resize: none;
		overflow-y: auto;
	}
	input[aria-invalid='true'] {
		box-shadow: var(--ring-danger);
	}
	.error {
		color: var(--danger);
		font-size: var(--type-caption-size);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--space-2);
	}
	.empty {
		display: grid;
		justify-items: start;
		gap: var(--space-3);
		padding: var(--space-8) var(--space-6);
		max-inline-size: 40rem;
	}
	.empty h2 {
		font-size: var(--type-display-m-size);
		line-height: var(--type-display-m-line);
	}
	.empty p {
		color: var(--ink-secondary);
	}
	@media (min-width: 768px) {
		.list {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (min-width: 1100px) {
		.item {
			grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
		}
	}
	@media (max-width: 767px) {
		.form,
		.empty {
			padding: var(--space-5) var(--space-4);
		}
	}
</style>
