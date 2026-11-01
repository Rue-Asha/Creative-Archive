<script lang="ts">
	import { page } from '$app/state';
	import { WORLD_NAMES, type World } from '#lib/domains.ts';
	import { collageSrc, photo } from '#lib/mockups/fixtures.ts';
	import { fontLabels, fontPairs } from '#lib/styles/tokens.ts';
	import { CANDIDATES, FONT, worldAttrs, type AccentName, type FontName, type Scheme } from '#lib/styles/worlds.ts';
	import ArrowButton from '#lib/ui/ArrowButton.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Card from '#lib/ui/Card.svelte';
	import Chip from '#lib/ui/Chip.svelte';
	import Collage from '#lib/ui/Collage.svelte';
	import Counter from '#lib/ui/Counter.svelte';
	import Eyebrow from '#lib/ui/Eyebrow.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';
	import PillNav from '#lib/ui/PillNav.svelte';
	import ProgressControl from '#lib/ui/ProgressControl.svelte';
	import RoundNav from '#lib/ui/RoundNav.svelte';
	import StarRating from '#lib/ui/StarRating.svelte';
	import StatusPill from '#lib/ui/StatusPill.svelte';

	const param = page.url.searchParams.get('world');
	const world: World = (WORLD_NAMES as readonly string[]).includes(param ?? '') ? (param as World) : 'animanga';
	const accentParam = page.url.searchParams.get('accent');
	const accent: AccentName =
		accentParam === 'b' ? CANDIDATES[world][1] : (CANDIDATES[world].find((a) => a === accentParam) ?? CANDIDATES[world][0]);
	const fontParam = page.url.searchParams.get('font') ?? '';
	const font: FontName = fontParam in fontPairs ? (fontParam as FontName) : FONT;
	const fonts = Object.keys(fontPairs) as FontName[];
	const schemes: Scheme[] = ['dark', 'light'];
	const allTints = Object.values(CANDIDATES).flat();

	const statusOptions = [
		{ value: 'none', label: 'No status' },
		{ value: 'want', label: 'Plan to watch' },
		{ value: 'progress', label: 'Watching' },
		{ value: 'done', label: 'Watched' },
		{ value: 'dropped', label: 'Dropped' }
	];
	let status = $state<Record<Scheme, string>>({ light: 'progress', dark: 'want' });
	let rating = $state<Record<Scheme, number | null>>({ light: 4, dark: null });
	let episodes = $state<Record<Scheme, number>>({ light: 12, dark: 27 });
	let chapters = $state<Record<Scheme, number>>({ light: 214, dark: 3 });
	let tagOn = $state<Record<Scheme, boolean>>({ light: true, dark: false });

	const nav = [
		{ href: '/__mockups/home/light', label: 'Home', icon: 'home', active: false },
		{ href: '/__mockups/music/light', label: 'Music', icon: 'music', active: false },
		{ href: '/__mockups/components', label: 'Animanga', icon: 'animanga', active: true },
		{ href: '/__mockups/books/light', label: 'Books', icon: 'books', active: false },
		{ href: '/__mockups/fashion/light', label: 'Fashion', icon: 'fashion', active: false },
		{ href: '/__mockups/home/dark', label: 'Collections', icon: 'collections', active: false }
	] as const;
</script>

<svelte:head>
	<title>Mockup · components · Creative Archive</title>
</svelte:head>

<section class="type" {...worldAttrs(world, { scheme: 'dark', accent, font })} aria-label="Type pairings">
	<div class="type-grid">
		{#each fonts as f (f)}
			<a class="pairing" data-font={f} data-pairing={f} href="/__mockups/home/dark?font={f}" class:picked={f === font}>
				<Eyebrow parts={[`${f.toUpperCase()}`, fontLabels[f]]} tone="accent" />
				<h2 class="pairing-title">What you <em>hear</em> on repeat</h2>
				<p>Albums, artists and the single songs worth keeping. Frieren 12 / 28 · 4.5 of 5 · 01 / 20</p>
				<p class="pairing-ui">Want to listen · Listening · Listened</p>
			</a>
		{/each}
	</div>
</section>

<div class="panes">
	{#each schemes as scheme (scheme)}
		<section class="pane" {...worldAttrs(world, { scheme, accent, font })} aria-label="{scheme} scheme" data-pane={scheme}>
			<div class="inner">
				<header class="head">
					<Eyebrow parts={['Components', world, scheme, accent]} />
					<h1>Spaces that <em>keep</em> what you love</h1>
					<p class="lede">{fontLabels[font]}: display above, text for everything you read and press.</p>
				</header>

				<div class="block">
					<h2 class="label">Buttons</h2>
					<div class="row">
						<Button>Explore the archive</Button>
						<Button variant="accent">Add anime</Button>
						<Button variant="secondary">Cancel</Button>
					</div>
					<div class="row">
						<ArrowButton label="Open" />
						<ArrowButton label="Open in accent" variant="accent" direction="up-right" />
						<ArrowButton label="Open on glass" variant="glass" />
						<ArrowButton label="Back" variant="outline" direction="left" />
						<RoundNav />
						<Counter index={1} total={20} />
					</div>
				</div>

				<div class="block">
					<h2 class="label">Chips and nav</h2>
					<div class="row">
						<Chip label="Fantasy" active={tagOn[scheme]} count={12} onclick={() => (tagOn[scheme] = !tagOn[scheme])} />
						<Chip label="Comfort" count={4} />
						<Chip label="Slow" />
						<Chip static size="sm" label="Anime" />
					</div>
					<div class="top-nav"><PillNav items={[...nav]} label="Specimen nav {scheme}" /></div>
					<div class="bar">
						<PillNav items={[...nav]} variant="bar" label="Specimen bar {scheme}" />
					</div>
				</div>

				<div class="block">
					<h2 class="label">Cards</h2>
					<div class="cards">
						<Card
							href="/__mockups/{world}/{scheme}"
							title="Frieren: Beyond Journey's End"
							image={photo('neon')}
							chip="Anime"
							meta="Sousou no Frieren · 2023"
							tint={null}
							rating={4.5}
							coverId={7}
						/>
						<Card href="/__mockups/{world}/{scheme}" title="Vagabond" image={null} chip="Manga" meta="Takehiko Inoue" tint={null} shape="tall">
							<ProgressControl
								label="Chapters"
								current={chapters[scheme]}
								total={null}
								tone="glass"
								onstep={(d) => (chapters[scheme] = Math.max(0, chapters[scheme] + d))}
								onset={(v) => (chapters[scheme] = v)}
							/>
						</Card>
						<Card href="/__mockups/{world}/{scheme}" title="Blonde" image={photo('cover-ember')} chip="Album" meta="Frank Ocean" tint={null} shape="square" />
					</div>
				</div>

				<div class="block photo-block" style:background-image="url({photo('neon')})">
					<GlassPanel class="glass-demo">
						<Eyebrow parts={['Anime', '2023']} />
						<h2 class="glass-title">Frieren</h2>
						<div class="controls">
							<StatusPill
								label="Status"
								options={statusOptions}
								value={status[scheme]}
								onchange={(v) => (status[scheme] = v)}
							/>
							<StarRating value={rating[scheme]} mode="input" label="Your rating" onchange={(v) => (rating[scheme] = v)} />
						</div>
						<div class="controls">
							<ProgressControl
								label="Episodes"
								current={episodes[scheme]}
								total={28}
								onstep={(d) => (episodes[scheme] = Math.max(0, Math.min(28, episodes[scheme] + d)))}
								onset={(v) => (episodes[scheme] = v)}
							/>
							<StarRating value={3.5} mode="display" />
						</div>
					</GlassPanel>
				</div>

				<div class="block">
					<h2 class="label">Placeholders and collages</h2>
					<div class="tints">
						{#each allTints as tint (tint)}
							<div class="tint"><ImagePlaceholder title="{tint} archive" {tint} /></div>
						{/each}
					</div>
					<div class="collages">
						<div class="collage"><Collage images={[1, 2, 3]} label="Winter evenings" src={collageSrc} /></div>
						<div class="collage"><Collage images={[4]} label="Tokyo, someday" src={collageSrc} /></div>
						<div class="collage"><Collage images={[]} label="Empty collection" /></div>
					</div>
				</div>
			</div>
		</section>
	{/each}
</div>

<style>
	.type {
		padding: var(--s-8) var(--gutter);
	}

	.type-grid {
		display: grid;
		gap: var(--s-4);
	}

	@media (min-width: 1024px) {
		.type-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	.pairing {
		display: grid;
		gap: var(--s-3);
		align-content: start;
		padding: var(--s-6);
		border-radius: var(--r-panel);
		background: var(--glass);
		border: 1px solid var(--glass-border);
		box-shadow: var(--shadow-card);
	}

	.pairing.picked {
		border-color: var(--accent);
	}

	.pairing-title {
		font-size: calc(var(--t-display-2) * var(--display-scale));
		line-height: var(--display-leading);
	}

	.pairing-ui {
		font-size: var(--t-small);
		font-weight: 600;
		color: var(--ink-2);
	}

	.panes {
		display: grid;
		min-block-size: 100dvh;
	}

	@media (min-width: 1024px) {
		.panes {
			grid-template-columns: 1fr 1fr;
		}
	}

	.pane {
		min-inline-size: 0;
	}

	.inner {
		display: grid;
		gap: var(--s-8);
		padding: var(--s-8) var(--gutter) var(--s-10);
	}

	.head {
		display: grid;
		gap: var(--s-3);
	}

	.lede {
		color: var(--ink-2);
		max-inline-size: 46ch;
	}

	.block {
		display: grid;
		gap: var(--s-4);
	}

	.label {
		font-family: var(--font-text);
		font-size: var(--t-eyebrow);
		font-weight: 600;
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--ink-2);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-3);
	}

	.bar {
		max-inline-size: 420px;
	}

	/* the top variant is the desktop nav; the phone gets the bar */
	.top-nav {
		display: none;
		justify-self: start;
	}

	@media (min-width: 768px) {
		.top-nav {
			display: block;
		}
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		align-items: end;
		gap: var(--s-3);
	}

	@media (min-width: 600px) {
		.cards {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	.photo-block {
		padding: var(--s-6) var(--s-3);
		border-radius: var(--r-frame);
		background-size: cover;
		background-position: center;
	}

	.photo-block :global(.glass-demo) {
		display: grid;
		gap: var(--s-4);
		padding: var(--s-6);
	}

	.glass-title {
		font-size: var(--t-display-2);
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-4);
	}

	.tints {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: var(--s-2);
	}

	.tint {
		aspect-ratio: 1;
		border-radius: var(--r-sm);
		overflow: hidden;
	}

	.collages {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--s-3);
	}

	.collage {
		aspect-ratio: 4 / 3;
		border-radius: var(--r-card);
		overflow: hidden;
	}
</style>
