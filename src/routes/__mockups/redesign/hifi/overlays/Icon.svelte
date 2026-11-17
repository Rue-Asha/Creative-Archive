<script lang="ts">
	import Base, { type IconName } from '../shell/Icon.svelte';

	type Extra = 'up' | 'down' | 'grip' | 'select' | 'chevron' | 'more';
	let { name, size = 18 }: { name: IconName | Extra; size?: number } = $props();
	const extra = $derived(['up', 'down', 'grip', 'select', 'chevron', 'more'].includes(name));
</script>

{#if extra}
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
		{#if name === 'up'}
			<path d="M12 19V5M6 11l6-6 6 6" />
		{:else if name === 'down'}
			<path d="M12 5v14M6 13l6 6 6-6" />
		{:else if name === 'more'}
			<g fill="currentColor" stroke="none"><circle cx="5.5" cy="12" r="1.75" /><circle cx="12" cy="12" r="1.75" /><circle cx="18.5" cy="12" r="1.75" /></g>
		{:else if name === 'chevron'}
			<path d="M6 9l6 6 6-6" />
		{:else if name === 'select'}
			<path d="M4 7l2 2 3-3M4 17l2 2 3-3M13 7h7M13 17h7" />
		{:else}
			<g fill="currentColor" stroke="none"><circle cx="9" cy="6" r="1.4" /><circle cx="15" cy="6" r="1.4" /><circle cx="9" cy="12" r="1.4" /><circle cx="15" cy="12" r="1.4" /><circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="18" r="1.4" /></g>
		{/if}
	</svg>
{:else}
	<Base name={name as IconName} {size} />
{/if}
