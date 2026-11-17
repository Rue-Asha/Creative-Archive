<script lang="ts">
	import Cover from './Cover.svelte';
	import { base, type Tone } from './data.ts';

	type Props = { title: string; by: string; year: number; artist?: boolean; tone?: Tone };
	let { title, by, year, artist = true, tone = 'square' }: Props = $props();
</script>

<section class="card w-form" data-surface="solid" aria-label="Picked result">
	<div class="w-picked">
		<Cover {title} cover="cover" {tone} />
		<div class="w-result-text"><span class="w-result-title">{title}</span><span class="w-result-by">{by} · {year}</span></div>
	</div>
	{#if artist}
		<label class="w-checkbox"><input type="checkbox" checked />Add artist</label>
	{/if}
	<a class="w-btn quiet" href="{base}/add">Choose another</a>
</section>
