<script lang="ts">
	type Name = 'up' | 'down' | 'grip' | 'trash' | 'check' | 'plus' | 'close' | 'arrow' | 'select';
	let { name, size = 20 }: { name: Name; size?: number } = $props();

	const paths: Record<Name, string> = {
		up: 'M6 14l6-6 6 6',
		down: 'M6 10l6 6 6-6',
		grip: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
		trash: 'M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5',
		check: 'M5 12.5l4.5 4.5L19 7.5',
		plus: 'M12 5v14M5 12h14',
		close: 'M6 6l12 12M18 6L6 18',
		arrow: 'M5 12h14M13 6l6 6-6 6',
		select: 'M4 7l2 2 3-3M4 17l2 2 3-3M13 7h7M13 17h7'
	};
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d={paths[name]} /></svg>
