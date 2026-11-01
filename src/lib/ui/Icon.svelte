<script lang="ts" module>
	const paths = {
		home: 'M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z',
		music: 'M9 18.5V6.5l10-2.5v12M9 18.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM19 16a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM9 10l10-2.5',
		animanga: 'M12 4c.6 3.9 2.1 5.4 6 6-3.9.6-5.4 2.1-6 6-.6-3.9-2.1-5.4-6-6 3.9-.6 5.4-2.1 6-6zM18.5 15.5c.3 1.6.9 2.2 2.5 2.5-1.6.3-2.2.9-2.5 2.5-.3-1.6-.9-2.2-2.5-2.5 1.6-.3 2.2-.9 2.5-2.5z',
		books: 'M5 4.5h9.5A2.5 2.5 0 0 1 17 7v13H7.5A2.5 2.5 0 0 1 5 17.5zM5 17.5A2.5 2.5 0 0 1 7.5 15H17M9 8.5h4.5',
		fashion: 'M12 7.5a2 2 0 1 1 2-2M12 7.5v1.2L3.6 15a1.2 1.2 0 0 0 .7 2.2h15.4a1.2 1.2 0 0 0 .7-2.2L12 8.7',
		collections: 'M4.5 4.5h6v6h-6zM13.5 4.5h6v6h-6zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z',
		settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2L10 21h4l.6-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z',
		search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.3 15.3 20 20',
		plus: 'M12 5v14M5 12h14',
		minus: 'M5 12h14',
		'arrow-right': 'M5 12h14M13 6l6 6-6 6',
		'arrow-left': 'M19 12H5M11 6l-6 6 6 6',
		'arrow-up-right': 'M7 17 17 7M8.5 7H17v8.5',
		'chevron-down': 'm6 9.5 6 6 6-6',
		check: 'm5 12.5 4.5 4.5L19 7.5',
		grid: 'M4.5 4.5h6v6h-6zM13.5 4.5h6v6h-6zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z',
		rows: 'M4 6.5h16M4 12h16M4 17.5h16',
		image: 'M5 5h14v14H5zM5 15.5l4-4 3.5 3.5 2.5-2.5L19 16.5M15 9.5h.01',
		x: 'M6 6l12 12M18 6 6 18',
		play: 'M8 5.5v13l10.5-6.5z'
	} as const;

	export type IconName = keyof typeof paths;
</script>

<script lang="ts">
	let {
		name,
		size = 20,
		stroke = 1.6,
		filled = false,
		label
	}: { name: IconName; size?: number; stroke?: number; filled?: boolean; label?: string } = $props();
</script>

<svg
	class="icon"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill={filled ? 'currentColor' : 'none'}
	stroke="currentColor"
	stroke-width={stroke}
	stroke-linecap="round"
	stroke-linejoin="round"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
>
	<path d={paths[name]} />
</svg>

<style>
	.icon {
		flex: none;
	}
</style>
