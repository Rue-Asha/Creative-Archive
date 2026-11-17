<script lang="ts">
	import Icon from './Icon.svelte';

	let { message, kind = 'info', action }: { message: string; kind?: 'info' | 'error'; action?: string } = $props();
</script>

<div class="w-toast" role={kind === 'error' ? 'alert' : 'status'} data-kind={kind}>
	{#if kind === 'error'}<Icon name="alert" size={16} />{/if}
	<span class="w-toast-text">{message}</span>
	{#if action}<button type="button" class="w-toast-action">{action}</button>{/if}
	<button type="button" class="w-toast-x" aria-label="Dismiss"><Icon name="x" size={14} /></button>
</div>
