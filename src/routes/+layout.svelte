<script lang="ts">
	import '#lib/styles/global.css';
	import { onMount, type Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	onMount(() => {
		document.documentElement.dataset.hydrated = '';
	});
</script>

{@render children()}
