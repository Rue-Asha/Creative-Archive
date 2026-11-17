<script lang="ts">
	import type { Domain } from '../../fixtures.ts';
	import { addItems, base, DOMAIN_LABEL } from '../shell/data.ts';
	import Icon from '../shell/Icon.svelte';

	// svelte-ignore state_referenced_locally
	type Props = { domain: Domain; open?: boolean; inline?: boolean };
	let { domain, open = false, inline = false }: Props = $props();
	// svelte-ignore state_referenced_locally
	let shown = $state(open);
	const label = $derived(`Add to ${DOMAIN_LABEL[domain]}`);
	const id = $props.id();
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && !inline && (shown = false)} />

<div class="add" class:inline>
	<button type="button" class="fw-btn primary" aria-haspopup="menu" aria-expanded={shown} aria-controls="menu-{id}" onclick={() => (shown = !shown)}>
		Add<Icon name="arrow" size={18} />
	</button>
	{#if shown}
		<ul id="menu-{id}" class="fw-menu" role="menu" aria-label={label}>
			{#each addItems(domain) as item (item.type)}
				<li role="none"><a role="menuitem" href="{base}/wire/add">{item.label}</a></li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.add { position: relative; display: grid; gap: var(--space-2); justify-items: start; }
	.add:not(.inline) .fw-menu { position: absolute; inset-block-start: calc(100% + var(--space-1)); inset-inline-start: 0; }
	.inline { gap: var(--space-2); }
</style>
