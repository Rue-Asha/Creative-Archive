<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { AccentName } from '#lib/styles/worlds.ts';
	import ArrowButton from './ArrowButton.svelte';
	import Chip from './Chip.svelte';
	import ImagePlaceholder from './ImagePlaceholder.svelte';
	import StarRating from './StarRating.svelte';

	let {
		href,
		title,
		image,
		chip,
		meta,
		tint,
		coverId,
		rating = null,
		shape = 'portrait',
		children
	}: {
		href: string;
		title: string;
		image: string | null;
		chip?: string;
		meta?: string;
		tint: AccentName | null;
		// data-cover-id on the media; the page transition names it for the cover morph
		coverId?: number;
		rating?: number | null;
		// square for music, tall for books and manga, portrait for the rest
		shape?: 'square' | 'portrait' | 'tall';
		// controls under the title (progress on in-progress anime and manga)
		children?: Snippet;
	} = $props();
</script>

<article class="card {shape}" class:has-extra={children} data-card>
	<div class="media" data-cover-id={coverId}>
		{#if image}<img src={image} alt="" loading="lazy" />{:else}<ImagePlaceholder {title} {tint} />{/if}
	</div>
	<span class="scrim" aria-hidden="true"></span>
	{#if chip}<span class="chip" data-card-chip><Chip static size="sm" tone="glass" label={chip} /></span>{/if}
	<div class="foot">
		<h3 class="title" data-card-title><a {href}>{title}</a></h3>
		{#if meta}<p class="meta">{meta}</p>{/if}
		{#if rating !== null && rating > 0}<StarRating value={rating} mode="display" size="sm" tone="photo" />{/if}
		{#if children}<div class="extra">{@render children()}</div>{/if}
	</div>
	<ArrowButton decorative variant="glass" direction="up-right" class="go" data-card-arrow />
</article>

<style>
	.card {
		position: relative;
		container-type: inline-size;
		isolation: isolate;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		aspect-ratio: 4 / 5;
		border-radius: var(--r-card);
		overflow: hidden;
		background: var(--surface-2);
		box-shadow: var(--shadow-card);
		color: var(--on-photo);
		transition:
			transform var(--d-base) var(--ease-out),
			box-shadow var(--d-base) var(--ease-out);
	}

	.square {
		aspect-ratio: 1;
	}

	.tall {
		aspect-ratio: 2 / 3;
	}

	/* rounded itself, not only clipped by the card: the page transition snapshots this element alone */
	.media {
		position: absolute;
		inset: 0;
		z-index: -2;
		border-radius: inherit;
		overflow: hidden;
	}

	.media img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		transition: transform var(--d-glide) var(--ease-out);
	}

	.scrim {
		position: absolute;
		inset: 0;
		z-index: -1;
		background: var(--scrim);
		pointer-events: none;
	}

	.chip {
		position: absolute;
		inset-block-start: 12px;
		inset-inline-start: 12px;
		max-inline-size: calc(100% - 24px);
	}

	.chip :global(.chip) {
		color: var(--ink);
	}

	.foot {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: var(--s-4) calc(var(--s-4) + 40px) var(--s-4) var(--s-4);
	}

	.title {
		font-size: var(--t-body);
		font-weight: 600;
		line-height: 1.25;
		color: var(--on-photo);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		overflow-wrap: anywhere;
	}

	.title a::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 1;
	}

	.meta {
		font-size: var(--t-small);
		line-height: 1.3;
		color: var(--on-photo);
		opacity: 0.86;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.extra {
		position: relative;
		z-index: 2;
		margin-block-start: 8px;
	}

	/* a phone card is ~170px wide: the control row drops its own padding so three 44px targets fit */
	.extra > :global(*) {
		display: flex;
		inline-size: 100%;
		justify-content: space-between;
		gap: 0;
		padding: 0;
	}

	/* a control row takes the full width, so the arrow moves to the top-right corner */
	.has-extra .foot {
		padding: var(--s-4) 6px 6px;
	}

	.has-extra .title,
	.has-extra .meta {
		padding-inline: 10px;
	}

	.card.has-extra > :global(.go) {
		inset-block: 12px auto;
	}

	.card > :global(.go) {
		position: absolute;
		inset-block-end: 12px;
		inset-inline-end: 12px;
		inline-size: 36px;
		block-size: 36px;
	}

	.card:has(a:focus-visible) {
		box-shadow: var(--focus-ring);
	}

	@container (min-width: 230px) {
		.title {
			font-size: var(--t-body);
		}

		.foot {
			padding: var(--s-5) calc(var(--s-5) + 44px) var(--s-5) var(--s-5);
		}

		.card > :global(.go) {
			inline-size: 40px;
			block-size: 40px;
			inset-block-end: 16px;
			inset-inline-end: 16px;
		}

		.card.has-extra > :global(.go) {
			inset-block: 14px auto;
			inset-inline-end: 14px;
		}

		.has-extra .foot {
			padding: var(--s-5) var(--s-3) var(--s-3);
		}

		.chip {
			inset-block-start: 14px;
			inset-inline-start: 14px;
		}
	}

	@media (hover: hover) and (pointer: fine) {
		.card:hover {
			transform: translateY(-4px);
			box-shadow: var(--shadow-float);
		}

		.card:hover .media img {
			transform: scale(1.05);
		}
	}
</style>
