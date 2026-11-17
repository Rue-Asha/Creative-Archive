<script lang="ts">
	import { initials } from './initials.ts';

	// the plate is the fingerprint's own: a calm tone picked by the title, so an entry keeps it wherever it shows.
	let { title, year = null, class: cls = '' }: { title: string; year?: number | null; class?: string } = $props();

	const tone = $derived(Array.from(title).reduce((h, c) => (h * 31 + c.codePointAt(0)!) >>> 0, 7) % 4);
</script>

<div class="placeholder {cls}" data-tone={tone} role="img" aria-label={title}>
	<span class="mono" aria-hidden="true">{initials(title)}</span>
	{#if year}<span class="year" aria-hidden="true">{year}</span>{/if}
</div>

<style>
	.placeholder {
		--plate: var(--surface-plate-1);
		container-type: inline-size;
		position: relative;
		display: grid;
		place-items: center;
		align-content: center;
		gap: var(--space-2-5);
		inline-size: 100%;
		block-size: 100%;
		overflow: hidden;
		background: var(--plate);
		color: var(--ink);
	}

	.placeholder::before {
		content: '';
		position: absolute;
		inset: var(--space-2);
		border: var(--stroke-hairline) solid var(--edge-plate);
		border-radius: var(--radius-text);
	}

	.placeholder[data-tone='1'] {
		--plate: var(--surface-plate-2);
	}

	.placeholder[data-tone='2'] {
		--plate: var(--surface-plate-3);
	}

	.placeholder[data-tone='3'] {
		--plate: color-mix(in srgb, var(--surface-plate-2) 86%, var(--ink));
	}

	.mono {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-l-size);
		line-height: 1;
		letter-spacing: 0.02em;
	}

	.year {
		font-size: var(--type-overline-size);
		line-height: 1;
		letter-spacing: var(--type-brand-tracking);
		font-weight: var(--weight-medium);
		color: var(--ink-secondary);
		font-variant-numeric: var(--numeric-figures);
	}

	.year::before {
		content: '— ' / '';
		letter-spacing: 0;
	}

	@container (max-width: 8rem) {
		.mono {
			font-size: var(--type-display-m-size);
		}
	}

	@container (max-width: 5rem) {
		.mono {
			font-size: var(--type-display-s-size);
		}

		.year {
			display: none;
		}
	}
</style>
