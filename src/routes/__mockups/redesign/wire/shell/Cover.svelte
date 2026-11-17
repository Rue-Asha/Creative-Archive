<script lang="ts">
	import { initials } from './data.ts';
	import Icon from './Icon.svelte';

	let { title, image = true }: { title: string; image?: boolean } = $props();
</script>

<span class="cover" data-image={image} aria-hidden="true">
	{#if image}<Icon name="image" size={28} />{:else}<span class="initials">{initials(title)}</span>{/if}
</span>

<style>
	.cover { display: grid; place-items: center; inline-size: 100%; aspect-ratio: 3 / 4; border-radius: var(--radius-panel); overflow: hidden; background: var(--surface-plate-2); color: var(--ink-muted); }
	.cover[data-image="false"] { background: var(--surface-plate-1); box-shadow: var(--ring-hairline); }
	.initials { font-family: var(--font-display); font-weight: var(--weight-display); font-size: var(--type-display-s-size); line-height: 1; color: var(--ink-secondary); }
</style>
