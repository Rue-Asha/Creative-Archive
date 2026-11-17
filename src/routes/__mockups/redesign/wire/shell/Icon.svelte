<script lang="ts" module>
	export type IconName =
		| 'home'
		| 'music'
		| 'animanga'
		| 'books'
		| 'fashion'
		| 'plus'
		| 'minus'
		| 'settings'
		| 'arrow'
		| 'left'
		| 'right'
		| 'image'
		| 'check'
		| 'upload'
		| 'close'
		| 'alert';
</script>

<script lang="ts">
	let { name, size = 20 }: { name: IconName; size?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
	{#if name === 'home'}
		<path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
	{:else if name === 'music'}
		<path d="M9 18V6l10-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="16.5" cy="16" r="2.5" />
	{:else if name === 'animanga'}
		<rect x="3" y="5" width="18" height="14" rx="3" /><path d="M10 9.5v5l4.5-2.5z" />
	{:else if name === 'books'}
		<path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M5 17a3 3 0 0 1 3-3h10" />
	{:else if name === 'fashion'}
		<path d="M12 8a2 2 0 1 0-2-2" /><path d="M12 8v2l8.5 5.5a1 1 0 0 1-.6 1.8H4.1a1 1 0 0 1-.6-1.8L12 10" />
	{:else if name === 'plus'}
		<path d="M12 5v14M5 12h14" />
	{:else if name === 'minus'}
		<path d="M5 12h14" />
	{:else if name === 'settings'}
		<path d="M4 7h9M19 7h1M4 17h1M11 17h9" /><circle cx="16" cy="7" r="2.5" /><circle cx="8" cy="17" r="2.5" />
	{:else if name === 'arrow'}
		<path d="M5 12h14M13 6l6 6-6 6" />
	{:else if name === 'left'}
		<path d="m15 6-6 6 6 6" />
	{:else if name === 'right'}
		<path d="m9 6 6 6-6 6" />
	{:else if name === 'image'}
		<rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m21 16-5-5-8 8" />
	{:else if name === 'check'}
		<path d="m5 12 5 5 9-10" />
	{:else if name === 'upload'}
		<path d="M12 16V5M7 10l5-5 5 5M5 19h14" />
	{:else if name === 'alert'}
		<circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5v.01" />
	{:else if name === 'close'}
		<path d="M6 6l12 12M18 6 6 18" />
	{/if}
</svg>
