<script lang="ts">
	import { tick } from 'svelte';
	import { applyAction, deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import Button from '#lib/components/button/Button.svelte';
	import Field from '#lib/components/field/Field.svelte';
	import Menu from '#lib/components/menu/Menu.svelte';
	import Sheet from '#lib/components/sheet/Sheet.svelte';
	import type { Id } from '#lib/types.ts';
	import { createWriteQueue } from '#lib/shell/writeQueue.ts';
	import Icon from '#lib/ui/Icon.svelte';

	let { collections, memberOf }: { collections: { id: Id; name: string }[]; memberOf: Id[] } = $props();

	const id = $props.id();
	let open = $state(false);
	let creating = $state(false);
	let name = $state('');
	let error = $state<string>();
	let trigger = $state<HTMLDivElement>();

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

	// the menu closes and focus goes back to the button before the dialog opens, so the dialog returns focus there
	async function startCreate() {
		open = false;
		await tick();
		trigger?.querySelector<HTMLElement>('.btn')?.focus();
		name = '';
		error = undefined;
		creating = true;
	}

	function create(event: SubmitEvent) {
		event.preventDefault();
		send('newCollection', { name }, (failure) => {
			const errors = failure?.errors as { name?: string } | undefined;
			error = errors?.name;
			if (!errors) creating = false;
		});
	}
</script>

<div class="add" bind:this={trigger}>
	<Button variant="secondary" popovertarget={id} aria-haspopup="menu" aria-expanded={open}>
		<Icon name="collections" size={18} />Add to collection
	</Button>
</div>
<Menu {id} name="Add to collection" bind:open>
	{#each collections as collection (collection.id)}
		<button type="button" class="menu-item" role="menuitemcheckbox" aria-checked={marked(collection.id)} tabindex="-1" onclick={() => flip(collection.id)}>
			<Icon name="check" size={16} />{collection.name}
		</button>
	{/each}
	{#if collections.length}<div class="menu-rule" role="separator"></div>{/if}
	<button type="button" class="menu-item create" role="menuitem" tabindex="-1" onclick={startCreate}>
		<Icon name="plus" size={16} />New collection
	</button>
</Menu>

<Sheet bind:open={creating} mode="sheet" title="New collection">
	<form id="{id}-form" onsubmit={create}>
		<Field label="Name" bind:value={name} {error} autocomplete="off" autofocus />
	</form>
	{#snippet actions()}
		<Button variant="secondary" onclick={() => (creating = false)}>Cancel</Button>
		<Button variant="primary" arrow type="submit" form="{id}-form">Create</Button>
	{/snippet}
</Sheet>

<style>
	.add {
		display: inline-block;
	}
</style>
