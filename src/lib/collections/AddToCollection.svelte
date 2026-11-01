<script lang="ts">
	import { tick } from 'svelte';
	import { applyAction, deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { fadeSlide, hideOnOutro } from '#lib/motion.ts';
	import type { Id } from '#lib/types.ts';
	import Button from '#lib/ui/Button.svelte';
	import { createWriteQueue } from '#lib/shell/writeQueue.ts';
	import Icon from '#lib/ui/Icon.svelte';

	let { collections, memberOf }: { collections: { id: Id; name: string }[]; memberOf: Id[] } = $props();

	let open = $state(false);
	let creating = $state(false);
	let error = $state<string>();
	let root = $state<HTMLDivElement>();
	let menu = $state<HTMLDivElement>();
	let nameInput = $state<HTMLInputElement>();

	// A mark answers at once from `local` while its writes queue up one by one; when the queue is empty the reloaded
	// membership takes over again.
	let local = $state<Record<number, boolean>>({});
	const enqueue = createWriteQueue(() => (local = {}));
	const marked = (id: Id) => local[id] ?? memberOf.includes(id);

	function send(action: string, fields: Record<string, string>, done?: (data: Record<string, unknown> | undefined) => void) {
		enqueue(async () => {
			const body = new FormData();
			for (const [key, value] of Object.entries(fields)) body.set(key, value);
			const res = await fetch(`?/${action}`, {
				method: 'POST',
				body,
				headers: { accept: 'application/json', 'x-sveltekit-action': 'true' }
			});
			const result = deserialize(await res.text());
			if (result.type === 'success') await invalidateAll();
			else if (result.type === 'redirect') await applyAction(result);
			else if (result.type !== 'failure') throw new Error(result.type);
			done?.(result.type === 'failure' ? result.data : undefined);
		});
	}

	function flip(id: Id) {
		const next = !marked(id);
		local[id] = next;
		send(next ? 'collect' : 'uncollect', { collectionId: String(id) });
	}

	async function show() {
		open = true;
		await tick();
		menu?.querySelector<HTMLElement>('[role="menuitemcheckbox"]')?.focus();
	}

	function close(refocus = false) {
		open = false;
		creating = false;
		error = undefined;
		if (refocus) root?.querySelector<HTMLElement>('.btn')?.focus();
	}

	async function startCreate() {
		creating = true;
		await tick();
		nameInput?.focus();
	}

	function create(event: SubmitEvent) {
		event.preventDefault();
		const name = nameInput!.value;
		send('newCollection', { name }, (failure) => {
			const errors = failure?.errors as { name?: string } | undefined;
			error = errors?.name;
			if (!errors) {
				creating = false;
				nameInput = undefined;
			}
		});
	}

	function keys(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			close(true);
			return;
		}
		if (creating) return;
		const items = [...(menu?.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"], .new') ?? [])];
		const at = items.indexOf(document.activeElement as HTMLElement);
		const moves: Record<string, number> = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: items.length - 1 };
		if (event.key in moves) {
			event.preventDefault();
			items[(moves[event.key] + items.length) % items.length]?.focus();
		} else if (event.key === 'Tab') close();
	}

	function outside(event: PointerEvent) {
		if (open && root && !root.contains(event.target as Node)) close();
	}
</script>

<svelte:window onpointerdown={outside} />

<div class="add" bind:this={root}>
	<Button variant="secondary" arrow={false} icon="collections" aria-haspopup="menu" aria-expanded={open} onclick={() => (open ? close() : show())}>
		Add to collection
	</Button>
	{#if open}
		<div class="menu liquid liquid-strong" role="menu" aria-label="Add to collection" bind:this={menu} onkeydown={keys} tabindex="-1" transition:fadeSlide={{ y: 6 }} use:hideOnOutro>
			{#each collections as collection (collection.id)}
				<button type="button" role="menuitemcheckbox" aria-checked={marked(collection.id)} tabindex="-1" onclick={() => flip(collection.id)}>
					<span class="name">{collection.name}</span>
					{#if marked(collection.id)}<Icon name="check" size={16} />{/if}
				</button>
			{/each}
			{#if creating}
				<form class="create" onsubmit={create}>
					<label for="popover-collection-name">Name</label>
					<input id="popover-collection-name" class="control" name="name" autocomplete="off" aria-invalid={error ? 'true' : undefined} bind:this={nameInput} />
					{#if error}<span class="error">{error}</span>{/if}
					<div class="row">
						<Button variant="secondary" arrow={false} onclick={() => (creating = false)}>Cancel</Button>
						<Button type="submit" arrow={false}>Create</Button>
					</div>
				</form>
			{:else}
				<button type="button" class="new" tabindex="-1" onclick={startCreate}>
					<Icon name="plus" size={16} />
					<span>New collection</span>
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.add {
		position: relative;
		display: inline-block;
	}

	.menu {
		--field-error: color-mix(in srgb, var(--ink) 45%, tomato);
		position: absolute;
		inset-block-end: calc(100% + 8px);
		inset-inline-start: 0;
		z-index: 30;
		display: grid;
		inline-size: min(320px, calc(100vw - 2 * var(--s-4)));
		max-block-size: min(60vh, 420px);
		overflow-y: auto;
		padding: 6px;
		border-radius: var(--r-md);
		transform-origin: bottom left;
	}

	.menu > button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-3);
		inline-size: 100%;
		min-block-size: 44px;
		padding: 0 var(--s-3);
		border: 0;
		border-radius: var(--r-sm);
		background: transparent;
		font-size: 15px;
		font-weight: 500;
		text-align: start;
		transition: background-color var(--d-fast) var(--ease-out);
	}

	.menu > button:hover,
	.menu > button:focus-visible {
		background: var(--accent-wash);
		box-shadow: none;
	}

	.menu [aria-checked='true'] {
		font-weight: 650;
	}

	.name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.new {
		justify-content: flex-start !important;
		color: var(--ink-2);
	}

	.create {
		display: grid;
		gap: 6px;
		padding: var(--s-3);
	}

	.create label {
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
		transition: border-color var(--d-fast) var(--ease-out);
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

	.row {
		display: flex;
		justify-content: flex-end;
		gap: var(--s-2);
		margin-block-start: var(--s-2);
	}
</style>
