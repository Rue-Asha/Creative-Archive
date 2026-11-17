<script lang="ts">
	import { photo } from '../../fixtures.ts';
	import { initials, synthetic } from './data.ts';

	const WORLD: Record<string, string> = { ember: 'world-books', dusk: 'world-home', violet: 'world-music', moss: 'world-animanga' };
	const pick = (src: string) => (synthetic(src) ? photo(WORLD[src.match(/-(\w+)\.jpg$/)![1]] ?? 'world-fashion') : src);

	let { name, covers }: { name: string; covers: string[] } = $props();
	const shown = $derived(covers.slice(0, 3));
</script>

<span class="collage" data-count={shown.length} aria-hidden="true">
	{#each shown as cover, i (cover + i)}<img src={pick(cover)} alt="" />{/each}
	{#if shown.length === 0}<span class="none">{initials(name)}</span>{/if}
</span>

<style>
	.collage { display: grid; grid-template-columns: 2fr 1fr; grid-template-rows: 1fr 1fr; gap: var(--space-1); aspect-ratio: 4 / 3; inline-size: 100%; border-radius: var(--radius-panel); overflow: hidden; background: var(--surface-sunken); }
	img { display: block; inline-size: 100%; block-size: 100%; min-inline-size: 0; min-block-size: 0; object-fit: cover; }
	img:first-child { grid-row: 1 / span 2; }
	.collage[data-count="1"] { grid-template-columns: 1fr; }
	.collage[data-count="2"] img:nth-child(2) { grid-row: 1 / span 2; }
	.none { grid-column: 1 / -1; grid-row: 1 / span 2; display: grid; place-items: center; background: var(--surface-plate-1); box-shadow: var(--ring-hairline); font-family: var(--font-display); font-weight: var(--weight-display); font-size: var(--type-display-m-size); line-height: 1; color: var(--ink-secondary); }
</style>
