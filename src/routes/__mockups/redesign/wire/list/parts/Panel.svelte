<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = { title: string; note?: string; children: Snippet; wide?: boolean };
	let { title, note, children, wide = false }: Props = $props();
</script>

<section class="w-panel" data-wide={wide || undefined}>
	<header class="w-panel-cap">
		<h2>{title}</h2>
		{#if note}<p>{note}</p>{/if}
	</header>
	<div class="w-panel-body">{@render children()}</div>
</section>
