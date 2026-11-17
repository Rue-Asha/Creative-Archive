<script lang="ts">
	import Cover from '../shell/Cover.svelte';
	import { photo } from '../../fixtures.ts';
	import { nested } from '../list/data.ts';

	type Props = { title: string; by: string; year: number; type?: string; artist?: boolean; worst?: boolean };
	let { title, by, year, type = 'album', artist = true, worst = false }: Props = $props();
	const id = $props.id();
</script>

<section class="card step" data-surface="solid" aria-label="Picked result">
	<div class="picked">
		<div class="cv"><Cover {title} src={photo('world-music')} ratio="1 / 1" /></div>
		<div class="text"><p class="t">{title}</p><p class="by">{by} · {year}</p></div>
	</div>
	{#if artist}
		<label class="check" for="{id}-a"><input id="{id}-a" type="checkbox" checked />Add artist</label>
	{/if}
	<div><a class="btn quiet s" href={nested('add', worst, `type=${type}`)} data-press>Choose another</a></div>
</section>

<style>
	.step { display: grid; gap: var(--space-3); padding: var(--space-4) var(--space-5); }
	.picked { display: flex; align-items: center; gap: var(--space-4); min-inline-size: 0; }
	.cv { flex: none; inline-size: 4.5rem; }
	.text { min-inline-size: 0; display: grid; gap: var(--space-0-5); }
	.t { font-size: var(--type-title-size); line-height: var(--type-title-line); font-weight: var(--type-title-weight); overflow-wrap: anywhere; }
	.by { font-size: var(--type-caption-size); color: var(--ink-secondary); overflow-wrap: anywhere; }
	.check { display: inline-flex; align-items: center; gap: var(--space-2-5); min-block-size: max(var(--control-height-s), var(--target)); font-size: var(--type-label-size); font-weight: var(--type-label-weight); }
	.check input { inline-size: 1.25rem; block-size: 1.25rem; accent-color: var(--accent); }
</style>
