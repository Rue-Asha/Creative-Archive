<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import ImagePlaceholder from './ImagePlaceholder.svelte';

	type State = 'want' | 'doing' | 'done' | 'dropped' | 'wishlist' | 'owned' | 'gone';

	let {
		href,
		title,
		image,
		chip,
		state,
		meta,
		coverId,
		rating = null,
		year = null,
		shape = 'portrait',
		level = 3,
		selectable,
		children
	}: {
		href: string;
		title: string;
		image: string | null;
		// the status as text; `state` adds its small shape (status is never colour alone)
		chip?: string;
		state?: State;
		meta?: string;
		coverId?: number;
		// the 0–10 value
		rating?: number | null;
		// printed on the placeholder plate
		year?: number | null;
		// square for music, tall for books and manga, portrait for the rest
		shape?: 'square' | 'portrait' | 'tall';
		// the title's heading level: under a page's or a shelf's h2, or under a shelf nested in a section (Home)
		level?: 3 | 4;
		// Select mode: the title is a toggle instead of a link
		selectable?: { selected: boolean; ontoggle: (e: MouseEvent | KeyboardEvent) => void };
		// controls under the title (progress on in-progress anime and manga)
		children?: Snippet;
	} = $props();
</script>

<article class="tile {shape}" class:selected={selectable?.selected} data-card data-surface="solid" data-press>
	<div class="shot" data-cover-id={coverId}>
		{#if image}<img src={image} alt="" loading="lazy" />{:else}<ImagePlaceholder {title} {year} />{/if}
		{#if selectable}<span class="tick" aria-hidden="true">{#if selectable.selected}<Icon name="check" size={14} />{/if}</span>{/if}
	</div>
	<div class="body">
		<svelte:element this={`h${level}`} class="title" data-card-title>
			{#if selectable}<button type="button" data-pick aria-pressed={selectable.selected} onclick={selectable.ontoggle}>{title}</button>{:else}<a {href}>{title}</a>{/if}
		</svelte:element>
		{#if meta || chip}
			<p class="meta">
				{#if meta}<span class="by">{meta}</span>{/if}
				{#if chip}
					<span class="status">
						{#if state}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								{#if state === 'done' || state === 'owned'}
									<circle cx="12" cy="12" r="9" /><path d="M8 12.5l3 3 5-6" />
								{:else if state === 'doing'}
									<circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
								{:else if state === 'dropped' || state === 'gone'}
									<circle cx="12" cy="12" r="9" /><path d="M8 12h8" />
								{:else}
									<circle cx="12" cy="12" r="9" />
								{/if}
							</svg>
						{/if}
						{chip}
					</span>
				{/if}
			</p>
		{/if}
		{#if rating !== null || children}
			<div class="slot">
				{#if rating !== null}<p class="rating"><span aria-hidden="true">{rating}<span class="of">{' / 10'}</span></span><span class="sr-only">{rating} of 10</span></p>{/if}
				{#if children}{@render children()}{/if}
			</div>
		{/if}
	</div>
</article>

<style>
	.tile {
		position: relative;
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		gap: var(--space-1-5);
		min-inline-size: 0;
		padding: var(--space-1-5);
		border-radius: var(--radius-card-s);
		background: var(--surface-sunken);
		color: var(--ink);
	}

	/* picked is the charcoal ring inside the edge, a fill and the filled check; focus is the ring outside the edge */
	.tile.selected {
		outline: var(--stroke-strong) solid var(--ink);
		outline-offset: calc(-1 * var(--stroke-strong));
		background: var(--selection);
	}

	.shot {
		position: relative;
		aspect-ratio: 3 / 4;
		border-radius: var(--radius-item);
		overflow: hidden;
		background: var(--surface-sunken);
	}

	.square .shot {
		aspect-ratio: 1;
	}

	.tall .shot {
		aspect-ratio: 2 / 3;
	}

	.shot img {
		display: block;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.tick {
		position: absolute;
		inset-block-start: var(--space-2);
		inset-inline-end: var(--space-2);
		display: grid;
		place-items: center;
		inline-size: 26px;
		block-size: 26px;
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink-on-inverse);
	}

	.selected .tick {
		background: var(--surface-inverse);
		box-shadow: none;
	}

	.body {
		flex: 1 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-3);
		border-radius: var(--radius-item);
		background: var(--surface-raised);
	}

	.title {
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		font-weight: var(--type-title-weight);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		overflow-wrap: anywhere;
	}

	.title :is(a, button) {
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		text-align: start;
		text-decoration: none;
		cursor: pointer;
	}

	.title :is(a, button)::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: var(--radius-card-s);
	}

	.title :is(a, button):focus-visible {
		outline: 0;
	}

	.title :is(a, button):focus-visible::after {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}

	.meta {
		display: grid;
		justify-items: start;
		gap: var(--space-0-5);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}

	.by {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		overflow-wrap: anywhere;
	}

	.status {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1-5);
		color: var(--ink);
		font-weight: var(--weight-medium);
	}

	.status svg {
		flex: none;
	}

	/* One footer slot for the rating and the progress control, pinned to the tile's bottom and as tall as the control, so
	   tiles in a row end on one line whichever of the two they carry */
	.slot {
		position: relative;
		z-index: 1;
		margin-block-start: auto;
		display: grid;
		align-content: end;
		gap: var(--space-1);
		min-block-size: calc(var(--control-height) + var(--space-2));
		padding-block-start: var(--space-2);
	}

	/* a narrow card's progress reads its total on a line above the steps (ProgressControl), so every narrow slot keeps
	   that line's room too */
	@container (max-width: 170px) {
		.slot {
			min-block-size: calc(var(--control-height) + var(--space-2) + var(--space-1) + var(--type-caption-size) * var(--type-caption-line));
		}
	}

	/* the control takes the slot's full width, out to the buttons' own edge, so the three 44px targets fit a phone tile */
	.slot > :global(.progress) {
		display: flex;
		margin-inline: calc(var(--space-1) - var(--space-3));
	}

	.rating {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-s-size);
		line-height: 1.1;
		font-variant-numeric: var(--numeric-figures);
	}

	.of {
		font-family: var(--font-ui);
		font-size: var(--type-body-s-size);
		color: var(--ink-secondary);
	}

	@media (hover: hover) and (pointer: fine) {
		.tile:has(.title :is(a, button):hover) {
			box-shadow: var(--ring-control);
		}

		.tile:has(.title :is(a, button):hover) .title {
			text-decoration: underline;
			text-underline-offset: 0.2em;
		}

	}
</style>
