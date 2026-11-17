<script lang="ts">
	import Icon from '../shell/Icon.svelte';

	let { message, kind = 'info', action }: { message: string; kind?: 'info' | 'error'; action?: string } = $props();
</script>

<div class="toast" role={kind === 'error' ? 'alert' : 'status'} style="animation: none">
	{#if kind === 'error'}<span class="mark"><Icon name="alert" size={16} /></span>{/if}
	<span class="message">{message}</span>
	{#if action}<button type="button" class="action" data-press>{action}</button>{/if}
	<button type="button" class="dismiss" aria-label="Dismiss" data-press="round"><Icon name="close" size={16} /></button>
</div>
