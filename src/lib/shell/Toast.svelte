<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { fadeSlide, hideOnOutro } from '#lib/motion.ts';
	import { attach, flush, toasts } from './toast.ts';

	onMount(attach);
	afterNavigate(flush);
</script>

<div class="toasts">
	{#each $toasts as item (item.id)}
		<p class="toast liquid liquid-strong" role="status" transition:fadeSlide use:hideOnOutro>{item.message}</p>
	{/each}
</div>

<style>
	.toasts {
		position: fixed;
		inset-inline: 0;
		inset-block-end: var(--s-7);
		z-index: 60;
		display: grid;
		justify-items: center;
		gap: var(--s-2);
		padding-inline: var(--s-4);
		pointer-events: none;
	}

	.toast {
		margin: 0;
		min-block-size: 44px;
		display: flex;
		align-items: center;
		padding: 0 var(--s-6);
		border-radius: var(--r-pill);
		font-size: 15px;
		font-weight: 500;
	}

	/* above the bottom pill nav */
	@media (max-width: 1023px) {
		.toasts {
			inset-block-end: calc(var(--tabbar-h) + max(12px, env(safe-area-inset-bottom)) + var(--s-4));
		}
	}
</style>
