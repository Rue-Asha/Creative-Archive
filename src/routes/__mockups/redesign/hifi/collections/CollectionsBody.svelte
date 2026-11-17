<script lang="ts">
	import { tick } from 'svelte';
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData, type MockCollection } from '../../fixtures.ts';
	import Collage from '../shell/Collage.svelte';
	import { entries as entriesText, fmt, href, langOf, plural } from '../shell/data.ts';
	import Icon from '../overlays/Icon.svelte';
	import '../overlays/overlays.css';

	type Props = { mode?: 'list' | 'new' | 'empty' };
	let { mode = 'list' }: Props = $props();

	const data = $derived(mockData(new URL(page.url.href)));
	const worst = $derived(data.worst);
	// a collection made on this page joins the list at the top with count 0, as after Create
	let made = $state<MockCollection[]>([]);
	const shown = $derived(mode === 'empty' ? made : [...made, ...data.collections]);
	const total = $derived(shown.reduce((sum, c) => sum + c.count, 0));

	// svelte-ignore state_referenced_locally
	let creating = $state(mode === 'new');
	// svelte-ignore state_referenced_locally
	let tried = $state(mode === 'new');
	let name = $state('');
	let description = $state('');
	let nameField = $state<HTMLInputElement>();
	let opener = $state<HTMLButtonElement>();
	const invalid = $derived(tried && !name.trim());
	const draft = $derived(worst ? data.collections[0].description : null);

	async function open() {
		creating = true;
		await tick();
		nameField?.focus({ preventScroll: true });
	}
	async function close() {
		creating = false;
		tried = false;
		name = '';
		description = '';
		await tick();
		opener?.focus();
	}
	function create(e: SubmitEvent) {
		e.preventDefault();
		tried = true;
		if (!name.trim()) return nameField?.focus();
		made = [{ id: 9000 + made.length, name: name.trim(), description: description.trim() || null, count: 0, covers: [] }, ...made];
		close();
	}
	$effect(() => {
		if (mode === 'new') nameField?.focus({ preventScroll: true });
	});
</script>

{#snippet add()}
	<button bind:this={opener} type="button" class="btn primary arrow" aria-expanded={creating} aria-controls="new-collection" data-press data-focus="halo" onclick={open}>
		New collection<span class="circle" aria-hidden="true"><svg data-nudge viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
	</button>
{/snippet}

<Frame world="home" section="collections" plus="shown">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Archive</li><li>{plural(shown.length, 'collection', 'collections')}</li></ul>
			<h1>All <em class="accent-word">collections</em></h1>
			<p class="lede">Group entries of any kind into one place, in the order you choose.</p>
			{#if !creating && shown.length}<div class="actions">{@render add()}</div>{/if}
		</div>
		{#if shown.length}
			<ul class="screen-facts" data-surface="inverse" aria-label="Collections at a glance">
				<li class="facts-caption">Whole archive</li>
				<li><span class="n">{fmt(shown.length)}</span>{shown.length === 1 ? 'Collection' : 'Collections'}</li>
				<li><span class="n">{fmt(total)}</span>Entries inside</li>
			</ul>
		{/if}
	</div>

	<div class="screen-body" data-settle>
		{#if creating}
			<form id="new-collection" class="card form" data-surface="solid" aria-labelledby="new-h" onsubmit={create} novalidate>
				<div class="card-head"><h2 id="new-h">New collection</h2><span class="card-note">Name and description</span></div>
				<div class="field pill" class:invalid>
					<label for="c-name">Name</label>
					<div class="control"><input id="c-name" bind:this={nameField} bind:value={name} type="text" autocomplete="off" aria-invalid={invalid ? 'true' : undefined} aria-describedby={invalid ? 'c-name-err' : undefined} /></div>
					{#if invalid}<p id="c-name-err" class="error" role="alert"><Icon name="alert" size={14} />Name is required</p>{/if}
				</div>
				<div class="field pill">
					<label for="c-desc">Description <span class="opt">optional</span></label>
					<div class="control area"><textarea id="c-desc" rows="3" bind:value={description} placeholder={draft ? '' : 'What belongs in here?'}></textarea></div>
				</div>
				<div class="row-actions">
					<button type="button" class="btn secondary" data-press onclick={close}>Cancel</button>
					<button type="submit" class="btn primary arrow" data-press data-focus="halo">Create<span class="circle" aria-hidden="true"><Icon name="arrow" /></span></button>
				</div>
			</form>
		{/if}

		{#if shown.length}
			<ul class="list" aria-label="Collections">
				{#each shown as c (c.id)}
					<li class="card item" data-surface="solid">
						<div class="collage" role="img" aria-label="{c.name} collage"><Collage name={c.name} covers={c.covers} /></div>
						<div class="info">
							<h2 class="name" lang={langOf(c.name)}><a href={href('collection', worst)} data-hover>{c.name}</a></h2>
							{#if c.description}<p class="desc" lang={langOf(c.description)}>{c.description}</p>{/if}
							<p class="count">{entriesText(c.count)}</p>
						</div>
					</li>
				{/each}
			</ul>
		{:else if !creating}
			<section class="card empty-card" data-surface="solid" aria-labelledby="none-h">
				<div class="empty">
					<h2 class="title" id="none-h">No collections yet</h2>
					<p class="body">Group entries of any kind into one place.</p>
					<div class="action">{@render add()}</div>
				</div>
			</section>
		{/if}
	</div>
</Frame>

<style>
	.actions { display: flex; flex-wrap: wrap; gap: var(--space-3); }
	.form { display: grid; gap: var(--space-4); padding: var(--space-6); max-inline-size: 40rem; }
	.opt { color: var(--ink-secondary); font-weight: var(--weight-regular); }
	.row-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--space-2); }

	.list { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-4); margin: 0; padding: 0; list-style: none; }
	.item { position: relative; display: grid; align-content: start; gap: var(--space-4); padding: var(--space-4); min-inline-size: 0; }
	.collage { min-inline-size: 0; }
	.collage :global(.collage) { aspect-ratio: 16 / 10; }
	.info { display: grid; gap: var(--space-2); align-content: start; min-inline-size: 0; padding-inline: var(--space-1); }
	.name {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
		overflow-wrap: anywhere;
		hyphens: auto;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}
	.name a { color: var(--ink); text-decoration: none; }
	/* the whole card is the link */
	.name a::after { content: ""; position: absolute; inset: 0; border-radius: var(--radius-card); }
	.name a:focus-visible { outline: 0; }
	.name a:focus-visible::after { outline: var(--focus-width) solid var(--focus-ring); outline-offset: var(--focus-offset); }
	.desc {
		color: var(--ink-secondary);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}
	.count { color: var(--ink-secondary); font-size: var(--type-caption-size); line-height: var(--type-caption-line); font-variant-numeric: var(--numeric-figures); }
	@media (hover: hover) {
		.item:has(.name a:hover) { background: var(--surface-raised); }
	}
	.empty-card { padding: var(--space-6); max-inline-size: 40rem; }
	@media (min-width: 640px) {
		.list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
	}
	@media (min-width: 1100px) {
		.list { grid-template-columns: repeat(3, minmax(0, 1fr)); }
	}
	@media (max-width: 767px) {
		.form { padding: var(--space-5) var(--space-4); }
		.empty-card { padding: var(--space-5) var(--space-4); }
	}
</style>
