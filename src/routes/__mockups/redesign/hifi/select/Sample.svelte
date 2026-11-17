<script lang="ts">
	import ListCard from '../list/ListCard.svelte';
	import type { ListDef, ListEntry } from '../list/data.ts';

	let { def, entries, selected = [] }: { def: ListDef; entries: ListEntry[]; selected?: number[] } = $props();
</script>

<ul class="grid" style:--ratio={def.ratio}>
	{#each entries as e (e.id)}<ListCard entry={e} {def} selectable selected={selected.includes(e.id)} />{/each}
</ul>

<style>
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 9rem), 1fr)); gap: var(--space-2-5); margin: 0; padding: 0; list-style: none; }
</style>
