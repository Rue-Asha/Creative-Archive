<script lang="ts">
	import type { Domain } from '../../fixtures.ts';
	import Icon from '../shell/Icon.svelte';
	import { addItems, DOMAIN_LABEL, href } from '../shell/data.ts';

	type Props = { domain: Domain; worst?: boolean; list?: string; shown?: boolean };
	let { domain, worst = false, list, shown = false }: Props = $props();
	const id = $props.id();
	const label = $derived(`Add to ${DOMAIN_LABEL[domain]}`);
	const dest = (type: string) => href('add', worst, `type=${type}${list === 'wardrobe' && type === 'piece' ? '&status=owned' : ''}`);
</script>

{#snippet items()}
	{#each addItems(domain) as item (item.type)}
		<a class="menu-item item" role="menuitem" href={dest(item.type)} tabindex="-1">{item.label}</a>
	{/each}
{/snippet}

{#if shown}
	<div class="static">
		<span class="btn primary arrow" aria-hidden="true">Add<span class="circle"><Icon name="arrow" /></span></span>
		<div class="static-menu" role="menu" aria-label={label}>{@render items()}</div>
	</div>
{:else}
	<div class="host">
		<button type="button" class="btn primary arrow" aria-haspopup="menu" aria-controls="m-{id}" popovertarget="m-{id}" style="anchor-name: --m-{id}" data-press data-focus="halo">
			Add<span class="circle" aria-hidden="true"><svg data-nudge viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
		</button>
		<div class="menu" id="m-{id}" role="menu" popover aria-label={label} style="position-anchor: --m-{id}">{@render items()}</div>
	</div>
{/if}

<style>
	.host { display: inline-block; }
	.item { text-decoration: none; }
	.static { display: grid; gap: var(--space-2); justify-items: start; }
	.static-menu { display: grid; gap: var(--space-0-5); min-inline-size: 14rem; padding: var(--space-1-5); border-radius: var(--radius-panel); background: var(--surface-raised); box-shadow: var(--elevation-menu); }
</style>
