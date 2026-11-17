<script lang="ts">
	import type { Domain } from '#lib/domains.ts';
	import { LIST_GROUPS } from '#lib/entries/config.ts';

	// counts (by list slug) show after each label on the domain page; the list page's kicker has none
	let { domain, counts }: { domain: Domain; counts?: Record<string, number> } = $props();

	const groups = $derived(LIST_GROUPS[domain]);
	const id = $props.id();
</script>

{#snippet links(lists: (typeof LIST_GROUPS)[Domain][number]['lists'])}
	<ul class="kicker">
		{#each lists as list (list.slug)}
			<li>
				<a href="/{domain}/{list.slug}">{list.label}</a>
				{#if counts}<span class="n">{(counts[list.slug] ?? 0).toLocaleString('en-GB')}</span>{/if}
			</li>
		{/each}
	</ul>
{/snippet}

<nav class="tabs" aria-label="Sub-types">
	{#each groups as group, i (i)}
		{#if group.label}
			<div class="group" role="group" aria-labelledby="{id}-{i}">
				<span class="caption" id="{id}-{i}">{group.label}</span>
				{@render links(group.lists)}
			</div>
		{:else}
			{@render links(group.lists)}
		{/if}
	{/each}
</nav>

<style>
	/* the count follows the link as plain text, so the link keeps the list's name */
	.n {
		margin-inline-start: var(--space-1-5);
		font-weight: var(--weight-regular);
		color: var(--ink-secondary);
	}

	.tabs {
		display: grid;
		gap: var(--space-2);
		justify-items: start;
	}

	.group {
		display: grid;
		gap: var(--space-0-5);
		justify-items: start;
	}

	.tabs :global(.kicker a) {
		min-block-size: var(--target);
	}

	.caption {
		font-size: var(--type-overline-size);
		line-height: var(--type-overline-line);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--weight-medium);
		text-transform: uppercase;
		color: var(--ink-secondary);
	}
</style>
