<script lang="ts">
	import { tick } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { deserialize, enhance, applyAction, type SubmitFunction } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import CollectionForm from '#lib/collections/CollectionForm.svelte';
	import ReorderList from '#lib/collections/ReorderList.svelte';
	import Button from '#lib/components/button/Button.svelte';
	import EmptyState from '#lib/components/empty-state/EmptyState.svelte';
	import Sheet from '#lib/components/sheet/Sheet.svelte';
	import { COPY, withCount } from '#lib/copy.ts';
	import { moveSelection, type MoveTarget } from '#lib/collections/moveSelection.ts';
	import { createSelection } from '#lib/select/selection.svelte.ts';
	import SelectionBar from '#lib/select/SelectionBar.svelte';
	import { createWriteQueue } from '#lib/shell/writeQueue.ts';
	import { toast } from '#lib/shell/toast.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import type { Entry } from '#lib/types.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const collection = $derived(data.collection);

	// A move or a removal answers at once from `local` while its saves queue up one by one; when the queue is empty the
	// reloaded collection takes over again. Each queued save is built on the optimistic order before it, so once one
	// fails the rest of the queue is dropped instead of sent against an order the server never had.
	let local = $state<Entry[] | null>(null);
	const list = $derived(local ?? collection.entries);
	let broken = false;
	const queue = createWriteQueue(() => {
		local = null;
		broken = false;
	});
	const enqueue = (write: () => Promise<void>) =>
		queue(async () => {
			if (broken) return;
			try {
				await write();
			} catch (error) {
				broken = true;
				throw error;
			}
		});
	const selection = createSelection(() => list);

	// true once saved; a 409 (the collection changed elsewhere) reloads, says so and stops the queue
	async function send(action: string, fields: Record<string, string>): Promise<boolean> {
		const body = new FormData();
		for (const [name, value] of Object.entries(fields)) body.set(name, value);
		const res = await fetch(`?/${action}`, { method: 'POST', body, headers: { accept: 'application/json', 'x-sveltekit-action': 'true' } });
		const result = deserialize(await res.text());
		if (result.type === 'success') {
			await invalidateAll();
			return true;
		}
		if (result.type === 'failure' && result.status === 409) {
			broken = true;
			await invalidateAll();
			toast(COPY.collectionChanged);
			return false;
		}
		throw new Error(result.type);
	}

	// `done` is the toast for a saved move; it waits for the save like a removal's does
	function reorder(next: Entry[], done?: string) {
		local = next;
		const ids = next.map((e) => e.id).join(',');
		enqueue(async () => {
			if ((await send('reorder', { ids })) && done) toast(done);
		});
	}

	function move(from: number, to: number) {
		const next = [...list];
		next.splice(to, 0, ...next.splice(from, 1));
		reorder(next);
	}

	function remove(entries: Entry[]) {
		const gone = new Set(entries.map((e) => e.id));
		local = list.filter((e) => !gone.has(e.id));
		const ids = [...gone].join(',');
		enqueue(async () => {
			if (await send('removeMany', { ids })) toast(withCount(COPY.removedFromCollection, gone.size));
		});
		if (!local.length) selection.leave();
	}

	const fine = new MediaQuery('(pointer: fine)');
	const wide = new MediaQuery('(min-width: 1024px)');
	const how = $derived(fine.current ? (wide.current ? 'Drag by the handle, or use Move up and Move down' : 'Drag by the handle, or open a row’s menu') : wide.current ? 'Use Move up and Move down' : 'Open a row’s menu to move or remove it');
	const types = $derived(new Set(list.map((e) => data.typeLabels[e.id])).size);
	const fmt = (n: number) => n.toLocaleString('en-GB');

	// the title's last word takes the accent; a long name is cut at a word and shown a size smaller
	const title = $derived.by(() => {
		const text = collection.name.trim();
		const m = text.match(/^(.*?)(\S*[\p{L}\p{N}]\S*)([^\p{L}\p{N}]*)$/su);
		return m ? { head: m[1], word: m[2], rest: m[3] } : { head: text, word: '', rest: '' };
	});

	let renaming = $state(false);
	const error = $derived(renaming ? form?.errors?.name : undefined);
	async function endRename() {
		renaming = false;
		await tick();
		document.querySelector<HTMLElement>('main [data-rename]')?.focus();
	}

	const deleteId = $props.id();
	let confirming = $state(false);
	let deleting = $state(false);
	const submitDelete: SubmitFunction = ({ cancel }) => {
		if (deleting) return cancel();
		deleting = true;
		return async ({ result }) => {
			if (result.type === 'redirect') toast(COPY.deleted);
			await applyAction(result);
			deleting = false;
		};
	};

	// the picked entries as one block: the order is computed once and saved with one request
	function moveTo(target: MoveTarget, done: string) {
		const picked = new Set(selection.ids);
		const ids = moveSelection(list.map((e) => e.id), picked, target);
		const byId = new Map(list.map((e) => [e.id, e]));
		reorder(
			ids.map((id) => byId.get(id)!),
			withCount(done, picked.size)
		);
	}

	let choosing = $state(false);
	const targets = $derived(list.filter((e) => !selection.ids.has(e.id)));
	const position = (e: Entry) => String(list.indexOf(e) + 1).padStart(Math.max(2, String(list.length).length), '0');

	const barActions = $derived([
		{ id: 'top', label: COPY.moveToTop, onrun: () => moveTo('top', COPY.movedToTop) },
		{ id: 'bottom', label: COPY.moveToBottom, onrun: () => moveTo('bottom', COPY.movedToBottom) },
		{ id: 'before', label: COPY.moveBefore, disabled: targets.length === 0, onrun: () => (choosing = true) },
		{ id: 'remove', label: COPY.removeFromCollection, onrun: () => remove(list.filter((e) => selection.ids.has(e.id))) }
	]);
</script>

<svelte:head><title>{collection.name} · Collections · Creative Archive</title></svelte:head>

{#snippet facts(where: 'head' | 'after')}
	{#if list.length}
		<ul class="screen-facts {where}" data-surface="inverse" aria-label="This collection at a glance">
			<li class="facts-caption">This collection</li>
			<li><span class="n figures">{fmt(list.length)}</span>{list.length === 1 ? 'Entry' : 'Entries'}</li>
			<li><span class="n figures">{fmt(types)}</span>{types === 1 ? 'Type' : 'Types'}</li>
		</ul>
	{/if}
{/snippet}

<div class="screen-head">
	<div class="screen-lead">
		<ul class="kicker">
			<li><a href="/collections">Collections</a></li>
			<li><span data-count aria-label="{list.length} {list.length === 1 ? 'entry' : 'entries'}">{fmt(list.length)}</span><span aria-hidden="true">&nbsp;{list.length === 1 ? 'entry' : 'entries'}</span></li>
			{#if selection.active}<li>Select</li>{/if}
		</ul>
		<h1 data-long={collection.name.length > 60 ? '' : undefined}>{title.head}{#if title.word}<em class="accent-word">{title.word}</em>{/if}{title.rest}</h1>
		{#if collection.description}<p class="lede selectable">{collection.description}</p>{/if}
		{#if !selection.active && !renaming}
			<div class="actions" role="group" aria-label="Collection actions">
				{#if list.length}<Button variant="primary" arrow data-select-enter onclick={() => selection.enter()}>Select</Button>{/if}
				<Button variant="secondary" data-rename onclick={() => (renaming = true)}>Rename</Button>
				<Button variant="danger" onclick={() => (confirming = true)}>
					<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5" /></svg>Delete collection
				</Button>
			</div>
		{/if}
	</div>
	{@render facts('head')}
</div>

<div class="screen-body" data-settle>
	<div class="scope">
		{#if renaming}
			<CollectionForm heading="Rename" note="Name and description, as they are now" action="?/rename" submit="Save" name={collection.name} description={collection.description} {error} oncancel={endRename} onsaved={endRename} />
		{/if}

		{#if selection.active}
			<SelectionBar {selection} label="Selection" actions={barActions} />
		{/if}

		{#if list.length}
			<section class="card entries" data-surface="solid" aria-labelledby="entries-title">
				<div class="card-head">
					<h2 id="entries-title">In order</h2>
					<span class="card-note">{selection.active ? 'Tap or click an entry to pick it' : list.length < 2 ? 'One entry, so there is nothing to reorder' : how}</span>
				</div>
				<ReorderList entries={list} typeLabels={data.typeLabels} {selection} onmove={move} onremove={(entry) => remove([entry])} />
			</section>
		{:else}
			<EmptyState title="Nothing in here yet" body={'Use "Add to collection" on any entry\'s page.'} />
		{/if}
	</div>
	{@render facts('after')}
</div>

<Sheet bind:open={confirming} alert mode="sheet" title="Delete this collection?">
	<p class="name">{collection.name}</p>
	<p class="note">Its entries stay in your archive.</p>
	<form id={deleteId} method="POST" action="?/delete" use:enhance={submitDelete}></form>
	{#snippet actions()}
		<Button variant="secondary" autofocus onclick={() => (confirming = false)}>Cancel</Button>
		<Button variant="danger" type="submit" form={deleteId} disabled={deleting}><Icon name="trash" size={16} />Delete</Button>
	{/snippet}
</Sheet>

<Sheet bind:open={choosing} mode="sheet" title={withCount('Move N entries before…', selection.count)}>
	<p class="note">Pick the entry they go in front of. They keep their order among themselves.</p>
	<ul class="choose" aria-label="Target entry">
		{#each targets as entry, i (entry.id)}
			<li>
				<!-- svelte-ignore a11y_autofocus -->
				<button
					type="button"
					class="target"
					autofocus={i === 0}
					onclick={() => {
						choosing = false;
						moveTo({ before: entry.id }, COPY.moved);
					}}
				>
					<span class="position">{position(entry)}</span>
					<span class="target-name">{entry.title}</span>
				</button>
			</li>
		{/each}
	</ul>
	{#snippet actions()}<Button variant="secondary" onclick={() => (choosing = false)}>Cancel</Button>{/snippet}
</Sheet>

<style>
	h1[data-long] {
		font-size: var(--type-display-l-size);
		line-height: var(--type-display-l-line);
	}
	h1,
	.lede {
		overflow-wrap: anywhere;
	}
	.lede {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3);
		max-inline-size: 100%;
	}
	.kicker a {
		color: inherit;
		text-decoration: none;
		min-block-size: var(--target);
	}
	/* one flex column so the desktop selection bar sticks against the whole list */
	.scope {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		min-inline-size: 0;
	}
	.entries {
		display: grid;
		gap: var(--space-4);
		padding: var(--space-5);
		min-inline-size: 0;
	}
	/* the thing being deleted, set as the dialog's display line (hi-fi) */
	.name {
		margin-block-end: var(--space-2);
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		color: var(--ink);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		overflow: hidden;
	}
	.note {
		color: var(--ink-secondary);
	}
	.choose {
		display: grid;
		gap: var(--space-0-5);
		max-block-size: 18rem;
		overflow-y: auto;
		margin: 0;
		padding: var(--space-1);
		list-style: none;
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
	}
	.target {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		gap: var(--space-3);
		inline-size: 100%;
		min-block-size: var(--target-touch);
		padding: var(--space-1) var(--space-3);
		border: 0;
		border-radius: var(--radius-item);
		background: none;
		color: var(--ink);
		text-align: start;
	}
	.target .position {
		font-variant-numeric: var(--numeric-figures);
	}
	.target-name {
		min-inline-size: 0;
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
	}
	@media (hover: hover) {
		.target:hover {
			background: var(--surface-raised);
		}
	}
	/* the facts card sits in the head and, on the phone, after the list instead */
	.screen-facts.after {
		display: none;
	}
	@media (max-width: 767px) {
		.entries {
			padding: var(--space-4) var(--space-3);
		}
		.screen-facts.head {
			display: none;
		}
		.screen-facts.after {
			display: grid;
		}
	}
</style>
