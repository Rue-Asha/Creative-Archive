<script lang="ts">
	import Icon from '../shell/Icon.svelte';

	// every collection with a check for those holding this entry; a row toggles membership at once
	let { collections = [] }: { collections?: string[] } = $props();
</script>

{#each collections as c, i (c + i)}<button type="button" class="menu-item" role="menuitemcheckbox" aria-checked={i === 0}><Icon name="check" size={16} />{c}</button>{/each}
<div class="menu-rule" role="separator"></div>
<button type="button" class="menu-item new" role="menuitem"><Icon name="plus" size={16} />New collection</button>

<style>
	.new { font-weight: var(--weight-medium); }
	.new > :global(svg) { visibility: visible; }
</style>
