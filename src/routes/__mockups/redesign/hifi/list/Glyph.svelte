<script lang="ts" module>
	export type GlyphName = 'chevron-down' | 'tag' | 'select' | 'grid' | 'shelves' | 'edit' | 'link' | 'spinner' | 'star' | 'back';
</script>

<script lang="ts">
	let { name, size = 18 }: { name: GlyphName; size?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
	{#if name === 'chevron-down'}
		<path d="M6 9l6 6 6-6" />
	{:else if name === 'tag'}
		<path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9z" /><path d="M8.5 8.5h.01" />
	{:else if name === 'select'}
		<path d="M4 6.5l1.5 1.5L8 5M4 12.5l1.5 1.5L8 11M4 18.5l1.5 1.5L8 17M12 7h8M12 13h8M12 19h8" />
	{:else if name === 'grid'}
		<path d="M4 4h6.5v6.5H4zM13.5 4H20v6.5h-6.5zM4 13.5h6.5V20H4zM13.5 13.5H20V20h-6.5z" />
	{:else if name === 'shelves'}
		<path d="M4 5h16M4 12h16M4 19h16" />
	{:else if name === 'edit'}
		<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z" />
	{:else if name === 'link'}
		<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1" />
	{:else if name === 'spinner'}
		<path d="M12 3a9 9 0 1 0 9 9" />
	{:else if name === 'star'}
		<path d="M12 3.5l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6-4.5-4.2 6.1-.8z" />
	{:else if name === 'back'}
		<path d="M19 12H5M11 6l-6 6 6 6" />
	{/if}
</svg>
