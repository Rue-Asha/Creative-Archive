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
		| 'alert'
		| 'more'
		| 'trash'
		| 'collection';
</script>

<script lang="ts">
	let { name, size = 18 }: { name: IconName; size?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
	{#if name === 'home'}
		<path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
	{:else if name === 'music'}
		<path d="M9 18V5.5l11-2V16M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
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
		<path d="M15 6l-6 6 6 6" />
	{:else if name === 'right'}
		<path d="M9 6l6 6-6 6" />
	{:else if name === 'image'}
		<path d="M4 5h16v14H4zM4 16l5-5 4 4 2-2 5 5M15.5 9h.01" />
	{:else if name === 'check'}
		<path d="M5 12.5l4.5 4.5L19 7.5" />
	{:else if name === 'upload'}
		<path d="M12 16V5M7 10l5-5 5 5M5 19h14" />
	{:else if name === 'alert'}
		<path d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 7.5v5M12 16.5h.01" />
	{:else if name === 'more'}
		<path d="M5 12h.01M12 12h.01M19 12h.01" />
	{:else if name === 'trash'}
		<path d="M4 7h16M9.5 7V4h5v3M6 7l1 13h10l1-13" />
	{:else if name === 'collection'}
		<path d="M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v5H4zM13 14h7v5h-7z" />
	{:else if name === 'close'}
		<path d="M6 6l12 12M18 6L6 18" />
	{/if}
</svg>
