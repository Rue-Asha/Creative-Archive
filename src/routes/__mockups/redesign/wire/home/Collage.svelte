<script lang="ts">
	import { initials } from '../shell/data.ts';
	import Icon from '../shell/Icon.svelte';

	let { name, covers }: { name: string; covers: string[] } = $props();
	const shown = $derived(covers.slice(0, 3));
</script>

<span class="collage" data-count={shown.length} aria-hidden="true">
	{#each shown as cover (cover)}<span class="plate"><Icon name="image" size={22} /></span>{/each}
	{#if shown.length === 0}<span class="plate none">{initials(name)}</span>{/if}
</span>

<style>
	.collage { display: grid; grid-template-columns: 2fr 1fr; grid-template-rows: 1fr 1fr; gap: var(--space-1); aspect-ratio: 4 / 3; inline-size: 100%; border-radius: var(--radius-panel); overflow: hidden; }
	.plate { display: grid; place-items: center; background: var(--surface-plate-2); color: var(--ink-muted); min-inline-size: 0; }
	.plate:first-child { grid-row: 1 / span 2; }
	.plate:nth-child(3) { background: var(--surface-plate-1); }
	.collage[data-count="1"] { grid-template-columns: 1fr; }
	.collage[data-count="2"] .plate:nth-child(2) { grid-row: 1 / span 2; }
	.plate.none { grid-column: 1 / -1; grid-row: 1 / span 2; background: var(--surface-plate-1); box-shadow: var(--ring-hairline); font-family: var(--font-display); font-weight: var(--weight-display); font-size: var(--type-display-s-size); color: var(--ink-secondary); }
</style>
