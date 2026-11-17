<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = { title: string; alert?: boolean; mode?: 'dialog' | 'sheet'; children: Snippet; actions?: Snippet };
	let { title, alert = false, mode = 'dialog', children, actions }: Props = $props();
</script>

<section class="w-dialog" data-mode={mode} role={alert ? 'alertdialog' : 'dialog'} aria-label={title}>
	<h3 class="w-dialog-title">{title}</h3>
	<div class="w-dialog-body">{@render children()}</div>
	{#if actions}<div class="w-dialog-actions">{@render actions()}</div>{/if}
</section>
