<script lang="ts">
	import { page } from '$app/state';
	import { mockData } from '../../fixtures.ts';
	import chosen from './icon.svg';
	import cooking from './cooking.svg';
	import notes from './notes.svg';
	import a from './variants/a.svg';
	import b from './variants/b.svg';
	import c from './variants/c.svg';

	const worst = $derived(mockData(new URL(page.url.href)).worst);

	const variants = [
		{ id: 'a', name: 'Kept', job: 'keep a find', idea: 'A cover with a ribbon marking its place: the find you saved and can come back to.', src: a },
		{ id: 'b', name: 'Shelf', job: 'keep it on a shelf', idea: 'Spines on a shelf, one leaning: your finds, lined up where you can see them.', src: b },
		{ id: 'c', name: 'Capture', job: 'capture a find', idea: 'A cover with a plus beside it: a new find added the moment you meet it.', src: c }
	];
	const family = [
		{ id: 'creative', name: 'Creative Archive', src: chosen },
		{ id: 'cooking', name: 'Cooking Hub', src: cooking },
		{ id: 'notes', name: 'Notes Archive', src: notes }
	];

	const small = [16, 32];
	const grounds = [
		{ name: 'Light ground', tone: 'light' },
		{ name: 'Dark ground', tone: 'dark' }
	];
</script>

<svelte:head><title>Icon · Creative Archive</title></svelte:head>

{#snippet mark(src: string, size: number, shape: 'circle' | 'squircle' | 'maskable' | 'maskable-squircle', grey = false)}
	<span class="mark {shape}" class:grey style:--size="{size}px">
		<img {src} alt="" width={size} height={size} class:inset={shape.startsWith('maskable')} />
	</span>
{/snippet}

<main class="page" data-data={worst ? 'worst' : 'normal'}>
	<section class="card panel" data-surface="solid" aria-labelledby="h">
		<div class="card-head"><h1 id="h">Master <em class="accent-word">icon</em>: Kept</h1></div>
		<p class="card-note">Three drafts from the main jobs: capture a find, keep it on a shelf, curate a collection. Each keeps the family rules: heather field, one white stroke of 32 on the 512 grid, gaps of at least 32, no letters. A stack of covers for the collection job was drawn and dropped: it read as an "open in a new window" icon. Recommended: a, Kept, because it is the one picture that holds for music, anime, books and fashion alike (every kind has a cover) and the ribbon says what the archive is for. It is now <code>icon.svg</code>; b and c stay below as not chosen. Notes Archive and Cooking Hub sit beside it for the family check.</p>
		<ol class="legend">
			{#each variants as v (v.id)}
				<li class:picked={v.id === 'a'}>
					{@render mark(v.id === 'a' ? chosen : v.src, v.id === 'a' ? 96 : 48, 'circle')}
					<div class="legend-text">
						<p class="type-overline">{v.id} · {v.job} · {v.id === 'a' ? 'recommended' : 'not chosen'}</p>
						<h2>{v.name}</h2>
						<p>{v.idea}</p>
						<code>variants/{v.id}.svg</code>
					</div>
				</li>
			{/each}
		</ol>
	</section>

	{#each grounds as g (g.tone)}
		<section class="card panel" data-surface="solid" aria-label={g.name}>
			<h2>{g.name}</h2>
			<div class="ground {g.tone}">
				<figure>
					<figcaption class="type-overline">Favicon 16 and 32 px, colour then greyscale</figcaption>
					<div class="row">
						{#each variants as v (v.id)}
							<div class="cell">
								<div class="set">
									{#each small as s (s)}{@render mark(v.src, s, 'circle')}{/each}
									{#each small as s (s)}{@render mark(v.src, s, 'circle', true)}{/each}
								</div>
								<span class="size">{v.id} · {v.name}</span>
							</div>
						{/each}
					</div>
				</figure>
				<figure>
					<figcaption class="type-overline">180 px: apple-touch under the iOS squircle, maskable under a squircle, maskable under a circle</figcaption>
					<div class="row">
						{#each variants as v (v.id)}
							<div class="cell">
								<div class="set">
									{@render mark(v.src, 180, 'squircle')}
									{@render mark(v.src, 180, 'maskable-squircle')}
									{@render mark(v.src, 180, 'maskable')}
								</div>
								<span class="size">{v.id} · {v.name}</span>
							</div>
						{/each}
					</div>
				</figure>
				<figure>
					<figcaption class="type-overline">180 px greyscale</figcaption>
					<div class="row">
						{#each variants as v (v.id)}
							<div class="cell solo" style:--size="180px">{@render mark(v.src, 180, 'circle', true)}<span class="size">{v.id} · {v.name}</span></div>
						{/each}
					</div>
				</figure>
				<figure>
					<figcaption class="type-overline">512 px, maskable under a circle</figcaption>
					<div class="row">
						{#each variants as v (v.id)}
							<div class="cell solo" style:--size="512px">{@render mark(v.src, 512, 'maskable')}<span class="size">{v.id} · {v.name}</span></div>
						{/each}
					</div>
				</figure>
			</div>
		</section>
	{/each}

	<section class="card panel" data-surface="solid" aria-labelledby="family">
		<h2 id="family">Beside Notes Archive and Cooking Hub</h2>
		<p class="card-note">Same round field, same stroke, same optical size; only the glyph and the field colour change.</p>
		{#each grounds as g (g.tone)}
			<div class="ground {g.tone}">
				<p class="type-overline">{g.name}: 16, 32, 180 and 512 px</p>
				<div class="row">
					{#each family as f (f.id)}
						<div class="cell">
							<div class="set">
								{#each [16, 32, 180] as s (s)}{@render mark(f.src, s, 'circle')}{/each}
							</div>
							<div class="cell solo" style:--size="512px">{@render mark(f.src, 512, 'circle')}</div>
							<span class="size">{f.name}</span>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</section>
</main>

<style>
	.page {
		display: grid;
		gap: var(--space-4);
		max-inline-size: var(--frame-max-width);
		margin-inline: auto;
		padding: var(--space-4);
		background: var(--surface-page);
		min-block-size: 100dvh;
		min-inline-size: 0;
	}
	.panel {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-5);
		padding: var(--space-6);
		min-inline-size: 0;
	}
	.card-head h1 {
		font-size: var(--type-display-m-size);
		line-height: var(--type-display-m-line);
		letter-spacing: var(--type-display-m-tracking);
	}
	.legend {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, calc(var(--space-16) * 4)), 1fr));
		gap: var(--space-5);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.legend li {
		display: flex;
		align-items: start;
		gap: var(--space-4);
		min-inline-size: 0;
	}
	.legend li:not(.picked) {
		opacity: 0.7;
	}
	.legend-text {
		display: grid;
		gap: var(--space-1);
		min-inline-size: 0;
	}
	.legend .mark {
		flex: none;
	}
	.ground {
		display: grid;
		gap: var(--space-6);
		padding: var(--space-6);
		border-radius: var(--radius-panel);
		min-inline-size: 0;
	}
	.ground.light {
		background: var(--surface-sunken);
	}
	.ground.dark {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	figure {
		display: grid;
		gap: var(--space-3);
		margin: 0;
		min-inline-size: 0;
	}
	figcaption {
		color: inherit;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: var(--space-6);
		min-inline-size: 0;
	}
	.cell {
		display: grid;
		justify-items: start;
		gap: var(--space-2);
		min-inline-size: 0;
		max-inline-size: 100%;
	}
	.cell > .solo {
		inline-size: min(var(--size), 100%);
	}
	.cell.solo {
		inline-size: max(min(var(--size), 100%), var(--space-16));
	}
	.set {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: var(--space-3);
		min-inline-size: 0;
	}
	.size {
		font-size: var(--type-caption-size);
		font-variant-numeric: var(--numeric-figures);
	}
	.mark {
		display: block;
		flex: none;
		inline-size: var(--size);
		aspect-ratio: 1;
		overflow: hidden;
	}
	.solo .mark {
		inline-size: min(var(--size), 100%);
	}
	.mark img {
		display: block;
		inline-size: 100%;
		block-size: 100%;
	}
	.circle {
		border-radius: var(--radius-round);
	}
	.squircle,
	.maskable-squircle {
		border-radius: var(--radius-frame);
		background: var(--accent);
	}
	.maskable {
		border-radius: var(--radius-round);
		background: var(--accent);
	}
	.inset {
		scale: 0.8;
	}
	.grey {
		filter: grayscale(1);
	}
</style>
