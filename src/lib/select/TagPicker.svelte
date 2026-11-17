<script lang="ts">
	import Button from '#lib/components/button/Button.svelte';
	import Field from '#lib/components/field/Field.svelte';
	import Sheet from '#lib/components/sheet/Sheet.svelte';
	import type { Tag } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';

	// Add tag and Remove tag for the selection, on the sheet primitive: add mode lists the existing tags plus the typed name as a
	// new one; remove mode gets only the tags present on the selection (the caller filters). `count` is how many carry the tag.
	type Props = { tags: Tag[]; mode: 'add' | 'remove'; onpick: (name: string) => void; open?: boolean };
	let { tags, mode, onpick, open = $bindable(false) }: Props = $props();

	let query = $state('');
	const typed = $derived(query.trim());
	const shown = $derived(mode === 'add' && typed ? tags.filter((t) => t.name.toLowerCase().includes(typed.toLowerCase())) : tags);
	const exact = $derived(tags.some((t) => t.name.toLowerCase() === typed.toLowerCase()));

	function pick(name: string) {
		open = false;
		query = '';
		onpick(name);
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		if (typed) pick(exact ? (tags.find((t) => t.name.toLowerCase() === typed.toLowerCase())?.name ?? typed) : typed);
	}
</script>

<Sheet bind:open mode="sheet" kicker="Selection" title={mode === 'add' ? 'Add tag' : 'Remove tag'}>
	{#if mode === 'add'}
		<form onsubmit={submit}>
			<Field label="Tag" bind:value={query} placeholder="Tag name" autocomplete="off" autofocus />
		</form>
	{/if}
	{#if shown.length || (mode === 'add' && typed && !exact)}
		<ul class="chips" aria-label={mode === 'add' ? 'Existing tags' : 'Tags on the selection'}>
			{#if mode === 'add' && typed && !exact}
				<li><button type="button" class="chip" onclick={() => pick(typed)}><Icon name="plus" size={16} /><span class="t">Create “{typed}”</span></button></li>
			{/if}
			{#each shown as tag (tag.id)}
				<li><button type="button" class="chip" title={tag.name} onclick={() => pick(tag.name)}><span class="t">{tag.name}</span><span class="c">{tag.count}</span></button></li>
			{/each}
		</ul>
	{:else if mode === 'remove'}
		<p class="hint">None of the selected entries has a tag.</p>
	{:else}
		<p class="hint">No tags yet. Type a name to create the first one.</p>
	{/if}
	{#snippet actions()}
		<Button variant="secondary" onclick={() => (open = false)}>{mode === 'remove' && !shown.length ? 'Close' : 'Cancel'}</Button>
	{/snippet}
</Sheet>

<style>
	form {
		margin-block-end: var(--space-4);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		max-block-size: 16rem;
		margin: 0;
		padding: 0;
		overflow-y: auto;
		list-style: none;
	}
	.chips li {
		max-inline-size: 100%;
		min-inline-size: 0;
	}
	.chip {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		max-inline-size: 100%;
		min-block-size: max(var(--control-height-s), var(--target));
		padding-inline: var(--space-3-5);
		border: 0;
		border-radius: var(--radius-pill);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
	}
	.t {
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.c {
		flex: none;
		color: var(--ink-secondary);
		font-weight: var(--weight-regular);
		font-size: var(--type-caption-size);
		font-variant-numeric: var(--numeric-figures);
	}
	.hint {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}
	@media (hover: hover) {
		.chip:hover {
			background: var(--surface-sunken);
		}
	}
</style>
