<script lang="ts">
	// A schematic of what shows at one width under one posture switch: the top bar (brand, nav, Settings) or brand plus the phone bar.
	type Props = { width: number; switchAt: 768 | 1024 };
	let { width, switchAt }: Props = $props();

	const desktop = $derived(width >= switchAt);
	const ownRow = $derived(width < 1100);
	const label = $derived(
		!desktop ? 'Phone bar at the bottom, brand only on top' : ownRow ? 'Top bar, nav on its own row (tablet layout)' : 'Top bar on one row: brand, nav, Settings'
	);
</script>

<figure class="schem">
	<div class="device" aria-hidden="true">
		<div class="bar" class:row={desktop && ownRow}>
			<span class="mark"></span>
			{#if desktop}
				<span class="capsule" class:wide={!ownRow}>{#each [0, 1, 2, 3, 4, 5] as i (i)}<span class="pill" class:on={i === 0}></span>{/each}</span>
				<span class="round"></span>
			{/if}
		</div>
		<div class="body"><span class="block"></span><span class="block"></span><span class="block short"></span></div>
		{#if !desktop}<div class="dock"><span class="capsule dockcap">{#each [0, 1, 2, 3, 4] as i (i)}<span class="pill" class:on={i === 0}></span>{/each}</span><span class="round dark"></span></div>{/if}
	</div>
	<figcaption><strong>{width} px</strong> {label}</figcaption>
</figure>

<style>
	.schem { display: grid; gap: var(--space-2); margin: 0; min-inline-size: 0; }
	.device { position: relative; display: grid; gap: var(--space-2); min-block-size: 9.5rem; padding: var(--space-2); border-radius: var(--radius-panel); background: var(--surface-sunken); box-shadow: var(--ring-hairline); }
	.bar { display: flex; align-items: center; justify-content: space-between; gap: var(--space-1-5); }
	.bar.row { flex-wrap: wrap; }
	.bar.row .capsule { order: 3; flex-basis: 100%; }
	.mark { inline-size: var(--space-4); block-size: var(--space-4); border-radius: var(--radius-round); background: var(--surface-inverse); }
	.round { inline-size: var(--space-4); block-size: var(--space-4); border-radius: var(--radius-round); background: var(--surface-plate-2); }
	.round.dark { background: var(--surface-inverse); inline-size: var(--space-6); block-size: var(--space-6); }
	.capsule { display: flex; flex: 1; justify-content: center; gap: var(--space-0-5); padding: var(--space-0-5); border-radius: var(--radius-pill); background: var(--surface-plate-1); box-shadow: var(--ring-hairline); }
	.capsule.wide { flex: none; }
	.pill { inline-size: var(--space-4); block-size: var(--space-2-5); border-radius: var(--radius-pill); background: var(--surface-plate-2); flex: 1; }
	.pill.on { background: var(--surface-inverse); }
	.body { display: grid; gap: var(--space-1-5); }
	.block { block-size: var(--space-3); border-radius: var(--radius-text); background: var(--surface-plate-2); }
	.block.short { inline-size: 60%; }
	.dock { display: flex; align-items: center; gap: var(--space-1-5); margin-block-start: auto; }
	.dockcap { padding: var(--space-0-5); }
	figcaption { font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-secondary); }
	figcaption strong { font-variant-numeric: var(--numeric-figures); }
</style>
