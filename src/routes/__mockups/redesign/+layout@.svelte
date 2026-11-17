<script lang="ts">
	import '#lib/styles/fingerprint/tokens.css';
	import '#lib/styles/fingerprint/fonts.css';
	import '#lib/styles/fingerprint/base.css';
	import '#lib/styles/fingerprint/motion.css';
	import '#lib/styles/fingerprint/layout.css';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	// the accent is stamped before first paint (head script) and again once hydrated
	$effect(() => {
		document.documentElement.lang = 'en';
		document.documentElement.dataset.accent = 'heather';
	});
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
	{@html '<script>document.documentElement.lang="en";document.documentElement.dataset.accent="heather"</script>'}
</svelte:head>

{@render children()}
