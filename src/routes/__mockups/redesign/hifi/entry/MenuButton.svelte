<script lang="ts">
	import type { Snippet } from 'svelte';
	import Glyph from '../list/Glyph.svelte';

	// A menu button and its popover (status, add to collection). `shown` draws the open menu in place for the state galleries.
	type Props = { label: string; menuLabel: string; lead?: Snippet; shown?: boolean; children: Snippet; wide?: boolean };
	let { label, menuLabel, lead, shown = false, children, wide = false }: Props = $props();
	const id = $props.id();
</script>

<div class="host" class:wide>
	<button type="button" class="btn secondary menu-button" aria-haspopup="menu" aria-expanded={shown} aria-controls="m-{id}" popovertarget={shown ? undefined : `m-${id}`} style="anchor-name: --m-{id}" data-press>
		{#if lead}{@render lead()}{/if}{label}<Glyph name="chevron-down" size={16} />
	</button>
	{#if shown}
		<div class="static-menu" id="m-{id}" role="menu" aria-label={menuLabel}>{@render children()}</div>
	{:else}
		<div class="menu" id="m-{id}" role="menu" popover aria-label={menuLabel} style="position-anchor: --m-{id}">{@render children()}</div>
	{/if}
</div>

<style>
	.host { display: grid; gap: var(--space-1-5); justify-items: start; min-inline-size: 0; max-inline-size: 100%; }
	.menu-button { max-inline-size: 100%; white-space: normal; text-align: start; }
	.static-menu { display: grid; gap: var(--space-0-5); min-inline-size: min(14rem, 100%); max-inline-size: 100%; padding: var(--space-1-5); border-radius: var(--radius-panel); background: var(--surface-raised); box-shadow: var(--elevation-menu); }
	.static-menu, .menu { max-block-size: min(20rem, 60dvh); overflow-y: auto; overscroll-behavior: contain; }
	.static-menu :global(.menu-item), .menu :global(.menu-item) { inline-size: 100%; overflow-wrap: anywhere; }
	@media (max-width: 767px) { .host.wide, .host.wide .menu-button { inline-size: 100%; } .host.wide .menu-button { justify-content: space-between; } }
</style>
