<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../shell/Icon.svelte';

	// A centred dialog on the sheet primitive, drawn inline for the state galleries; Cancel/Keep editing has the focus on open.
	type Props = { title: string; alert?: boolean; children: Snippet; actions: Snippet };
	let { title, alert = false, children, actions }: Props = $props();
	const id = $props.id();
</script>

<dialog class="dialog" data-sheet open role={alert ? 'alertdialog' : 'dialog'} aria-labelledby="{id}-t">
	<header>
		<h2 id="{id}-t">{title}</h2>
		<button type="button" class="close" aria-label="Close" data-press="round"><Icon name="close" /></button>
	</header>
	<div class="body">{@render children()}</div>
	<footer>{@render actions()}</footer>
</dialog>

<style>
	dialog { position: relative; inset: auto; display: flex; margin: 0; animation: none; inline-size: 100%; max-inline-size: 28rem; }
	.body { display: grid; gap: var(--space-2); font-size: var(--type-body-size); line-height: var(--type-body-line); color: var(--ink-secondary); }
	.body :global(strong) { font-family: var(--font-display); font-weight: var(--weight-display); font-size: var(--type-display-s-size); line-height: var(--type-display-s-line); color: var(--ink); overflow-wrap: anywhere; }
</style>
