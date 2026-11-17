<script lang="ts">
	type Name = 'check' | 'chevron-down' | 'chevron-left' | 'chevron-right' | 'plus' | 'minus' | 'arrow' | 'back' | 'edit' | 'trash' | 'alert' | 'x' | 'tag' | 'select' | 'grid' | 'shelves' | 'image' | 'search' | 'link' | 'spinner';
	let { name, size = 18 }: { name: Name; size?: number } = $props();

	const paths: Record<Name, string> = {
		check: 'M5 12.5l4.5 4.5L19 7.5',
		'chevron-down': 'M6 9l6 6 6-6',
		'chevron-left': 'M15 6l-6 6 6 6',
		'chevron-right': 'M9 6l6 6-6 6',
		plus: 'M12 5v14M5 12h14',
		minus: 'M5 12h14',
		arrow: 'M5 12h14M13 6l6 6-6 6',
		back: 'M19 12H5M11 6l-6 6 6 6',
		edit: 'M4 20h4L19 9l-4-4L4 16v4z',
		trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
		alert: 'M12 8v5M12 17h.01M12 3l9.5 17h-19z',
		x: 'M6 6l12 12M18 6L6 18',
		tag: 'M3 12V4h8l10 10-8 8L3 12zM7.5 8h.01',
		select: 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h9',
		grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
		shelves: 'M3 5h18v5H3zM3 14h18v5H3z',
		image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4',
		search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',
		link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
		spinner: 'M12 3a9 9 0 1 0 9 9'
	};
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
