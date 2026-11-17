<script lang="ts">
	import HeroSlot from './HeroSlot.svelte';
	import type { Slot } from './data.ts';

	let { list }: { list: Slot[] } = $props();
</script>

<ul class="slots">
	{#each list as slot (slot.world)}
		<li><HeroSlot {slot} /></li>
	{/each}
</ul>

<style>
	.slots { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr)); gap: var(--space-4); margin: 0; padding: 0; list-style: none; align-items: start; }
	.slots > li { min-inline-size: 0; }
</style>
