<script lang="ts">
	import type { Domain } from '#lib/domains.ts';
	import { LIST_GROUPS } from '#lib/entries/config.ts';
	import Chip from '#lib/ui/Chip.svelte';

	let { domain }: { domain: Domain } = $props();

	const groups = $derived(LIST_GROUPS[domain]);
</script>

<nav class="tabs" class:grouped={groups.some((g) => g.label)} aria-label="Sub-types">
	{#each groups as group, i (i)}
		{#if group.label}
			{#if i > 0}<span class="divider" data-tab-divider role="separator"></span>{/if}
			<div class="group" role="group" aria-labelledby="subtabs-{domain}-{i}" data-tab-group>
				<span class="caption" id="subtabs-{domain}-{i}" data-tab-caption>{group.label}</span>
				{#each group.lists as list (list.slug)}
					<Chip href="/{domain}/{list.slug}" label={list.label} tone="glass" />
				{/each}
			</div>
		{:else}
			{#each group.lists as list (list.slug)}
				<Chip href="/{domain}/{list.slug}" label={list.label} tone="glass" />
			{/each}
		{/if}
	{/each}
</nav>

<style>
	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
	}

	.grouped {
		flex-direction: column;
		align-items: stretch;
		gap: var(--s-3);
	}

	.group {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2);
	}

	.caption {
		font-size: var(--t-small);
		font-weight: 600;
		color: var(--on-photo);
		margin-inline-end: var(--s-1);
	}

	.divider {
		block-size: 1px;
		background: currentColor;
		color: var(--on-photo);
		opacity: 0.35;
	}

	@media (min-width: 1024px) {
		.grouped {
			flex-direction: row;
			align-items: center;
			gap: var(--s-4);
		}

		.divider {
			inline-size: 1px;
			block-size: 28px;
		}
	}
</style>
