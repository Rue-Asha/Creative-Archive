<script lang="ts">
	import type { Domain } from '#lib/domains.ts';
	import { LISTS } from '#lib/entries/config.ts';
	import Chip from '#lib/ui/Chip.svelte';

	let { domain }: { domain: Domain } = $props();
</script>

<nav class="tabs" aria-label="Sub-types">
	{#each LISTS[domain] as list (list.slug)}
		<Chip href="/{domain}/{list.slug}" label={list.label} tone="glass" />
	{/each}
</nav>

<style>
	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
	}
</style>
