<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = {
		children: Snippet;
		as?: 'div' | 'section' | 'aside' | 'header' | 'article';
		strong?: boolean;
		class?: string;
	} & Omit<HTMLAttributes<HTMLElement>, 'class' | 'children'>;

	let { children, as = 'div', strong = false, class: cls = '', ...rest }: Props = $props();
</script>

<!-- liquid glass lives in global.css (.liquid) so nav, chips and buttons share one material -->
<svelte:element this={as} class="glass liquid {cls}" class:liquid-strong={strong} {...rest}>{@render children()}</svelte:element>

<style>
	.glass {
		border-radius: var(--r-panel);
	}
</style>
