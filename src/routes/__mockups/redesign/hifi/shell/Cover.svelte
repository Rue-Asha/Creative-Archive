<script lang="ts">
	import { initials, langOf, real, tone } from './data.ts';

	type Props = { title: string; src: string | null; year?: number | null; ratio?: string; large?: boolean };
	let { title, src, year = null, ratio = '3 / 4', large = false }: Props = $props();
</script>

{#if real(src)}
	<img class="cover" class:large style:aspect-ratio={ratio} src={real(src)} alt="" />
{:else}
	<span class="cover plate" class:large style:aspect-ratio={ratio} data-tone={tone(title)} aria-hidden="true">
		<span class="mono" lang={langOf(title)}>{initials(title)}</span>
		{#if year}<span class="year">{year}</span>{/if}
	</span>
{/if}

<style>
	.cover { display: block; inline-size: 100%; border-radius: var(--radius-item); object-fit: cover; background: var(--surface-sunken); }
	.plate {
		--plate: var(--surface-plate-1);
		--plate-ink: var(--ink);
		--plate-ink-2: var(--ink-secondary);
		--plate-line: var(--edge-plate);
		position: relative;
		display: grid;
		place-items: center;
		align-content: center;
		gap: var(--space-2-5);
		background: var(--plate);
		color: var(--plate-ink);
	}
	.plate::before { content: ""; position: absolute; inset: var(--space-2-5); border: var(--stroke-hairline) solid var(--plate-line); border-radius: var(--radius-text); }
	.plate[data-tone="1"] { --plate: var(--surface-plate-2); }
	.plate[data-tone="2"] { --plate: var(--surface-plate-3); }
	.plate[data-tone="3"] { --plate: color-mix(in srgb, var(--surface-plate-2) 86%, var(--ink)); }
	.mono { font-family: var(--font-display); font-weight: var(--weight-display); font-size: var(--type-display-l-size); line-height: 1; letter-spacing: 0.02em; }
	.year { font-size: var(--type-overline-size); line-height: 1; letter-spacing: var(--type-brand-tracking); font-weight: var(--weight-medium); color: var(--plate-ink-2); font-variant-numeric: var(--numeric-figures); }
	.year::before { content: "— " / ""; letter-spacing: 0; }
	.cover.large { border-radius: var(--radius-panel); }
</style>
