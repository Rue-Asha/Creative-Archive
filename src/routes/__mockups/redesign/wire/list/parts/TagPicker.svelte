<script lang="ts">
	import Dialog from './Dialog.svelte';
	import Icon from './Icon.svelte';
	import { plural } from './data.ts';

	type Props = { mode: 'add' | 'remove'; tags: { name: string; count: number }[]; selected: number; noun: [string, string]; query?: string };
	let { mode, tags, selected, noun, query = '' }: Props = $props();

	const shown = $derived(query ? tags.filter((t) => t.name.toLowerCase().includes(query.toLowerCase())) : tags);
	const exact = $derived(tags.some((t) => t.name.toLowerCase() === query.trim().toLowerCase()));
	const title = $derived(`${mode === 'add' ? 'Add a tag to' : 'Remove a tag from'} ${plural(selected, noun[0], noun[1])}`);
</script>

<Dialog {title} mode="sheet">
	{#if mode === 'add'}
		<label class="w-field">
			<span class="w-label">Add a tag</span>
			<input class="w-input" type="text" value={query} placeholder="Tag name" />
		</label>
	{:else}
		<p class="w-hint">Only tags on the selection are listed. The number says how many of the {selected} carry it.</p>
	{/if}
	<ul class="w-menu w-tagmenu" aria-label="Tag suggestions" data-scroll>
		{#each shown as t (t.name)}
			<li>
				<button type="button" class="w-menu-item" role="menuitem">
					<Icon name="tag" size={16} />
					<span class="w-grow">{t.name}</span>
					<span class="w-hint figures">{mode === 'add' ? plural(t.count, 'entry', 'entries') : `on ${Math.min(t.count, selected)} of ${selected}`}</span>
				</button>
			</li>
		{/each}
		{#if mode === 'add' && query.trim() && !exact}
			<li role="none"><button type="button" class="w-menu-item" role="menuitem" data-new><Icon name="plus" size={16} /><span class="w-grow">Create “{query.trim()}”</span></button></li>
		{/if}
		{#if shown.length === 0 && !(mode === 'add' && query.trim())}
			<li class="w-hint">{mode === 'add' ? 'No tags yet. Type a name to create the first one.' : 'None of the selected entries has a tag.'}</li>
		{/if}
	</ul>
	{#snippet actions()}
		<button type="button" class="w-btn">Cancel</button>
	{/snippet}
</Dialog>
