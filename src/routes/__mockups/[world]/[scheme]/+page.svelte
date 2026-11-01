<script lang="ts">
	import { DOMAIN_LABEL, DOMAINS } from '#lib/domains.ts';
	import { collageSrc, domains, home, type MockEntry, type MockShelf } from '#lib/mockups/fixtures.ts';
	import { reveal, stagger } from '#lib/motion.ts';
	import { CANDIDATES, FONT, worldAttrs } from '#lib/styles/worlds.ts';
	import ArrowButton from '#lib/ui/ArrowButton.svelte';
	import Button from '#lib/ui/Button.svelte';
	import Card from '#lib/ui/Card.svelte';
	import Chip from '#lib/ui/Chip.svelte';
	import Collage from '#lib/ui/Collage.svelte';
	import Counter from '#lib/ui/Counter.svelte';
	import Eyebrow from '#lib/ui/Eyebrow.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';
	import IconButton from '#lib/ui/IconButton.svelte';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';
	import PillNav from '#lib/ui/PillNav.svelte';
	import ProgressControl from '#lib/ui/ProgressControl.svelte';
	import RoundNav from '#lib/ui/RoundNav.svelte';
	import StarRating from '#lib/ui/StarRating.svelte';
	import StatusPill from '#lib/ui/StatusPill.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const { world, scheme, accent, font } = $derived(data);
	const domain = $derived(world === 'home' ? null : domains[world]);
	const query = $derived.by(() => {
		const q = new URLSearchParams();
		if (accent !== CANDIDATES[world][0]) q.set('accent', accent);
		if (font !== FONT) q.set('font', font);
		return q.size ? `?${q}` : '';
	});

	const icons = { home: 'home', music: 'music', animanga: 'animanga', books: 'books', fashion: 'fashion' } as const;
	// the nav keeps the chosen type pairing; each world opens on its own first accent
	const keep = $derived(font === FONT ? '' : `?font=${font}`);
	const nav = $derived([
		{ href: `/__mockups/home/${scheme}${keep}`, label: 'Home', icon: icons.home, active: world === 'home' },
		...DOMAINS.map((d) => ({
			href: `/__mockups/${d}/${scheme}${keep}`,
			label: DOMAIN_LABEL[d],
			icon: icons[d],
			active: world === d
		})),
		{ href: '/__mockups/components', label: 'Collections', icon: 'collections' as const, active: false }
	]);

	let flow = $state(2);
	const flowItems = home.coverflow;
	const step = (d: number) => (flow = Math.max(0, Math.min(flowItems.length - 1, flow + d)));
	function flowKeys(event: KeyboardEvent) {
		if (event.key === 'ArrowRight') step(1);
		else if (event.key === 'ArrowLeft') step(-1);
		else return;
		event.preventDefault();
	}
	function flowTransform(offset: number): string {
		const side = Math.sign(offset);
		const far = Math.abs(offset);
		return `translateX(${offset * 46}%) translateZ(${-far * 160}px) rotateY(${-side * 38}deg) scale(${1 - Math.min(far, 3) * 0.04})`;
	}

	let status = $state('');
	let rating = $state<number | null>(null);
	let current = $state(0);
	$effect.pre(() => {
		if (!domain) return;
		status = domain.detail.status;
		rating = domain.detail.entry.rating;
		current = domain.detail.entry.progress?.current ?? 0;
	});
</script>

<svelte:head>
	<title>Mockup · {world} · {scheme} · Creative Archive</title>
</svelte:head>

{#snippet glow(images: (string | null)[])}
	<div class="glow" aria-hidden="true">
		{#each images.filter((i) => i !== null).slice(0, 4) as src, i (i)}<img {src} alt="" />{/each}
	</div>
{/snippet}

{#snippet shelf(s: MockShelf, index: number)}
	{@const mixed = new Set(s.entries.map((e) => e.shape)).size > 1}
	<section class="shelf" data-shelf aria-label={s.accent ? `${s.title} · ${s.accent}` : s.title} use:reveal={{ delay: stagger(index) }}>
		{@render glow(s.entries.map((e) => e.image))}
		<div class="column shelf-head" data-column>
			<h2 data-section-heading>
				{s.title}{#if s.accent}<span class="dot-sep" aria-hidden="true">·</span><em>{s.accent}</em>{/if}
			</h2>
			<span class="count tnum">{s.count}</span>
			<a class="see-all" href="/__mockups/{world}/{scheme}{query}">See all <ArrowButton decorative variant="outline" size="sm" /></a>
		</div>
		<div class="column shelf-row-wrap">
			<ul class="shelf-row">
				{#each s.entries as entry, i (entry.id)}
					<li use:reveal={{ delay: stagger(i) }}>{@render card(mixed ? { ...entry, shape: 'portrait' as const } : entry)}</li>
				{/each}
			</ul>
		</div>
	</section>
{/snippet}

{#snippet card(entry: MockEntry)}
	<Card
		href="/__mockups/{world}/{scheme}{query}"
		title={entry.title}
		image={entry.image}
		chip={entry.status ?? entry.chip}
		meta={entry.creator}
		tint={entry.tint}
		rating={entry.rating}
		shape={entry.shape}
		coverId={entry.id}
	/>
{/snippet}

<div class="world" {...worldAttrs(world, { scheme, accent, font })} data-world={world} style:color-scheme={scheme}>
	<header class="topbar">
		<div class="column bar">
			<a class="brand" href="/__mockups/home/{scheme}">
				<span class="mark" aria-hidden="true">ca</span>
				<span class="word">Creative <em>Archive</em></span>
			</a>
			<PillNav items={nav} />
			<div class="actions">
				<IconButton icon="settings" label="Settings" href="/__mockups/components" />
			</div>
		</div>
	</header>

	{#if world === 'home'}
		<main class="home">
			<div class="column" data-column>
				<header class="frame" data-hero data-page-header>
					<img class="frame-photo" src={home.hero} alt="" />
					<span class="frame-scrim" aria-hidden="true"></span>
					<div class="frame-body">
						<div class="frame-copy">
							<Eyebrow parts={['Music', 'Animanga', 'Books', 'Fashion']} tone="photo" />
							<h1 class="on-photo">{home.headline[0]} <em>{home.headline[1]}</em>{home.headline[2]}</h1>
							<p class="frame-intro">{home.intro}</p>
							<div class="frame-cta">
								<Button href="/__mockups/music/{scheme}">Start exploring</Button>
								<span class="settings-phone"><IconButton icon="settings" label="Settings" href="/__mockups/components" /></span>
							</div>
						</div>
						<div class="coverflow">
							<!-- a focusable carousel region takes the arrow keys (S8) -->
							<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
							<div
								class="cf-stage"
								role="region"
								aria-roledescription="carousel"
								aria-label="Recently added"
								tabindex="0"
								onkeydown={flowKeys}
							>
								{#each flowItems as entry, i (entry.id)}
									{@const offset = i - flow}
									<div
										class="cf-item"
										data-active={offset === 0 ? '' : undefined}
										style:transform={flowTransform(offset)}
										style:z-index={20 - Math.abs(offset)}
										style:opacity={Math.abs(offset) > 2 ? 0 : 1}
										inert={offset !== 0}
									>
										<Card
											href="/__mockups/{world}/{scheme}{query}"
											title={entry.title}
											image={entry.image}
											chip={entry.chip}
											meta={entry.creator}
											tint={entry.tint}
											rating={entry.rating}
											coverId={entry.id}
										/>
									</div>
								{/each}
							</div>
							<div class="cf-controls">
								<Counter index={flow + 1} total={flowItems.length} tone="photo" />
								<RoundNav
									prevLabel="Previous entry"
									nextLabel="Next entry"
									prevDisabled={flow === 0}
									nextDisabled={flow === flowItems.length - 1}
									onprev={() => step(-1)}
									onnext={() => step(1)}
								/>
							</div>
						</div>
					</div>
					<GlassPanel class="stats" aria-label="Archive in numbers">
						{#each home.stats as stat (stat.label)}
							<div class="stat">
								<span class="stat-value tnum">{stat.value}</span>
								<span class="stat-label">{stat.label}</span>
							</div>
						{/each}
					</GlassPanel>
				</header>
			</div>

			{#each home.shelves as s, i (s.title + (s.accent ?? ''))}
				{@render shelf(s, i)}
			{/each}

			<section class="column collections" data-column aria-label="Collections" use:reveal>
				{@render glow(home.collections.flatMap((c) => c.images).map(collageSrc))}
				<div class="section-head">
					<h2 data-section-heading>Collections</h2>
					<span class="count tnum">{home.collections.length}</span>
					<a class="see-all" href="/__mockups/components">All collections <ArrowButton decorative variant="outline" size="sm" /></a>
				</div>
				<ul class="bento">
					{#each home.collections as c, i (c.id)}
						<li class:feature={i === 0} use:reveal={{ delay: stagger(i) }}>
							<a class="collection liquid" href="/__mockups/components">
								<div class="collage"><Collage images={c.images} label={c.name} src={collageSrc} /></div>
								<div class="collection-text">
									<h3>{c.name}</h3>
									<span class="tnum">{c.count} {c.count === 1 ? 'entry' : 'entries'}</span>
								</div>
								{#if i === 0}
									<p class="collection-desc">{c.description}</p>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			</section>
		</main>
	{:else if domain}
		<main class="domain">
			<header class="hero" data-hero>
				<img class="hero-photo" src={domain.hero} alt="" />
				<span class="hero-scrim" aria-hidden="true"></span>
				<span class="settings-phone hero-settings"><IconButton icon="settings" label="Settings" href="/__mockups/components" /></span>
				<div class="column hero-body" data-column>
					<div class="hero-copy" data-page-header>
						<Eyebrow parts={[domain.label, `${domain.list.length * 12} entries`]} tone="photo" />
						<h1 class="on-photo">{domain.headline[0]} <em>{domain.headline[1]}</em> {domain.headline[2]}</h1>
						<p class="hero-intro">{domain.intro}</p>
					</div>
					<nav class="tabs" aria-label="{domain.label} lists">
						{#each domain.tabs as tab, i (tab)}
							<Chip href="/__mockups/{world}/{scheme}{query}" label={tab} active={i === 0} tone="glass" />
						{/each}
					</nav>
				</div>
			</header>

			{#each domain.shelves as s, i (s.title)}
				{@render shelf(s, i)}
			{/each}

			<section class="column list" data-column aria-label="{domain.listTitle} list" use:reveal>
				{@render glow(domain.list.map((e) => e.image))}
				<div class="section-head">
					<h2 data-section-heading>{domain.listTitle}</h2>
					<span class="count tnum">{domain.list.length * 12}</span>
					<Button href="/__mockups/{world}/{scheme}{query}" variant="accent" class="add">Add</Button>
				</div>
				<div class="filters liquid" role="toolbar" aria-label="Filters">
					<Chip label="All" active />
					{#each domain.detail.statusOptions.filter((o) => o.value !== 'none').slice(0, 3) as o (o.value)}
						<Chip label={o.label} />
					{/each}
					<span class="spacer"></span>
					<label class="select"><span class="visually-hidden">Sort</span>
						<select><option>Recently added</option><option>Rating</option><option>Title</option></select>
					</label>
					<span class="toggle" role="group" aria-label="View">
						<IconButton icon="grid" label="Grid" variant="solid" />
						<IconButton icon="rows" label="Shelves" variant="outline" />
					</span>
				</div>
				<ul class="grid">
					{#each domain.list as entry, i (entry.id)}
						<li use:reveal={{ delay: stagger(i) }}>{@render card(entry)}</li>
					{/each}
				</ul>
			</section>

			<section class="detail" aria-label="Detail" use:reveal>
				<div class="detail-backdrop" aria-hidden="true">
					{#if domain.detail.entry.image}<img src={domain.detail.entry.image} alt="" />{/if}
				</div>
				<div class="column detail-body" data-column>
					<h2 class="detail-heading" data-section-heading>From the archive</h2>
					<div class="detail-grid">
						<div class="detail-cover {domain.detail.entry.shape}" data-cover-id={domain.detail.entry.id}>
							{#if domain.detail.entry.image}
								<img src={domain.detail.entry.image} alt="Cover of {domain.detail.entry.title}" />
							{:else}
								<ImagePlaceholder title={domain.detail.entry.title} tint={domain.detail.entry.tint} />
							{/if}
						</div>
						<GlassPanel strong class="detail-panel">
							<Eyebrow parts={domain.detail.eyebrow} tone="accent" />
							<h3 class="detail-title">{domain.detail.entry.title}</h3>
							<p class="creator">{domain.detail.entry.creator}</p>
							<div class="detail-controls">
								<StatusPill label="Status" options={domain.detail.statusOptions} value={status} onchange={(v) => (status = v)} />
								{#if world !== 'fashion'}
									<StarRating value={rating} mode="input" label="Your rating" onchange={(v) => (rating = v)} />
								{/if}
							</div>
							{#if domain.detail.entry.progress}
								<ProgressControl
									label={domain.detail.entry.progress.label}
									{current}
									total={domain.detail.entry.progress.total}
									onstep={(d) => (current = Math.max(0, current + d))}
									onset={(v) => (current = v)}
								/>
							{/if}
							<dl class="facts">
								{#each domain.detail.facts as [label, value] (label)}
									<div><dt>{label}</dt><dd>{value}</dd></div>
								{/each}
							</dl>
							<div class="tags">
								{#each domain.detail.tags as tag (tag)}<Chip label={tag} tone="soft" />{/each}
							</div>
							<p class="note">{domain.detail.note}</p>
							<div class="detail-actions">
								<Button variant="secondary" arrow={false}>Edit</Button>
								<Button variant="primary">Add to collection</Button>
							</div>
						</GlassPanel>
					</div>
				</div>
			</section>
		</main>
	{/if}

	<div class="tabbar" data-shot-bottom>
		<PillNav items={nav} variant="bar" label="Main" />
	</div>
</div>

<style>
	.world {
		min-block-size: 100dvh;
		overflow-x: clip;
	}

	/* nav */
	.topbar {
		position: fixed;
		inset-block-start: 22px;
		inset-inline: 0;
		z-index: 40;
		pointer-events: none;
	}

	.bar {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
	}

	.bar > :global(*) {
		pointer-events: auto;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		justify-self: start;
		min-block-size: 48px;
		padding: 4px 18px 4px 4px;
		border-radius: var(--r-pill);
		background: var(--glass-strong);
		backdrop-filter: var(--glass-filter);
		border: 1px solid var(--glass-border);
		box-shadow: var(--shadow-card);
		color: var(--ink);
	}

	.mark {
		display: grid;
		place-items: center;
		inline-size: 40px;
		block-size: 40px;
		border-radius: var(--r-pill);
		background: var(--accent);
		color: var(--accent-ink);
		font-family: var(--font-display);
		font-style: var(--accent-style);
		font-size: 22px;
		line-height: 1;
		padding-block-end: 3px;
	}

	.word {
		font-family: var(--font-display);
		font-size: 21px;
		font-weight: 500;
		letter-spacing: -0.01em;
	}

	.word em {
		font-style: var(--accent-style);
		color: var(--accent);
	}

	.actions {
		justify-self: end;
	}

	.tabbar {
		display: none;
	}

	.settings-phone {
		display: none;
	}

	/* minmax(0, 1fr): a shelf row's nowrap content must not widen the page's one track */
	main {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--s-10);
		padding-block-end: var(--s-11);
	}

	.on-photo {
		color: var(--on-photo);
	}

	h1 {
		font-size: var(--t-display-1);
	}

	h1 em {
		font-style: var(--accent-style);
	}

	/* the photo text always sits on the dark end of the scrim, so the accent word is lifted to the photo colour */
	.on-photo em {
		color: var(--on-photo);
		opacity: 0.92;
	}

	/* home: framed hero */
	.home {
		padding-block-start: 12px;
	}

	.frame {
		position: relative;
		isolation: isolate;
		display: grid;
		grid-template-rows: 1fr auto;
		min-block-size: min(760px, calc(100dvh - 24px));
		border-radius: var(--r-frame);
		overflow: hidden;
		box-shadow: var(--shadow-float);
		color: var(--on-photo);
	}

	.frame-photo {
		position: absolute;
		inset: 0;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		z-index: -2;
		animation: drift var(--d-ambient) var(--ease-in-out) infinite alternate;
	}

	.frame-scrim {
		position: absolute;
		inset: 0;
		z-index: -1;
		background:
			linear-gradient(90deg, var(--scrim-end) 0%, transparent 62%),
			linear-gradient(0deg, var(--scrim-end) 0%, transparent 45%);
	}

	.frame-body {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
		align-items: center;
		gap: var(--s-6);
		padding: 120px var(--s-9) var(--s-6);
	}

	.frame-copy {
		display: grid;
		gap: var(--s-5);
		max-inline-size: 520px;
	}

	.frame-intro {
		max-inline-size: 42ch;
		color: var(--on-photo);
		opacity: 0.92;
	}

	.frame-cta {
		display: flex;
		align-items: center;
		gap: var(--s-3);
		margin-block-start: var(--s-2);
	}

	/* coverflow */
	.coverflow {
		display: grid;
		justify-items: center;
		gap: var(--s-5);
		min-inline-size: 0;
	}

	.cf-stage {
		position: relative;
		inline-size: 100%;
		block-size: 400px;
		perspective: 1400px;
		transform-style: preserve-3d;
		border-radius: var(--r-card);
	}

	.cf-item {
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: calc(50% - 130px);
		inline-size: 260px;
		transition:
			transform var(--d-glide) var(--ease-out),
			opacity var(--d-slow) var(--ease-out);
	}

	.cf-item :global([data-card]) {
		box-shadow: var(--shadow-float);
	}

	.cf-controls {
		display: flex;
		align-items: center;
		gap: var(--s-5);
	}

	.cf-controls :global(.arrow.outline) {
		border-color: var(--glass-border);
		background: var(--glass);
		backdrop-filter: var(--glass-filter);
	}

	.frame :global(.stats) {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		margin: 0 var(--s-6) var(--s-6);
		padding: var(--s-5) var(--s-6);
		border-radius: var(--r-panel);
	}

	.stat {
		display: grid;
		gap: 2px;
		padding-inline: var(--s-5);
		border-inline-start: 1px solid var(--line);
	}

	.stat:first-child {
		border-inline-start: 0;
		padding-inline-start: 0;
	}

	.stat-value {
		font-family: var(--font-display);
		font-size: 40px;
		line-height: 1;
	}

	.stat-label {
		font-size: var(--t-small);
		color: var(--ink);
	}

	/* ambient light: the section's own covers, blurred far behind it, so colour carries from the hero down the page */
	.glow {
		position: absolute;
		inset: -12% -6%;
		z-index: -1;
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		filter: blur(90px) saturate(1.8);
		opacity: 0.55;
		pointer-events: none;
		mask-image: radial-gradient(closest-side, white 40%, transparent);
	}

	.glow img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	[data-scheme='light'] .glow {
		opacity: 0.3;
	}

	/* shelves */
	.shelf {
		position: relative;
		isolation: isolate;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--s-5);
	}

	.shelf-head,
	.section-head {
		display: flex;
		align-items: baseline;
		gap: var(--s-3);
	}

	h2 {
		font-size: var(--t-display-2);
	}

	h2 em {
		font-style: var(--accent-style);
	}

	.dot-sep {
		margin-inline: 0.25em;
		color: var(--ink-2);
	}

	.count {
		font-size: var(--t-small);
		font-weight: 600;
		color: var(--ink-2);
		padding: 2px 10px;
		border-radius: var(--r-pill);
		background: var(--accent-wash);
		translate: 0 -4px;
	}

	.see-all {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-block-size: 44px;
		margin-inline-start: auto;
		font-size: 14px;
		font-weight: 600;
		align-self: center;
	}

	.shelf-row {
		display: grid;
		grid-template-columns: repeat(6, minmax(0, 1fr));
		align-items: end;
		gap: var(--s-4);
	}

	/* home collections bento */
	.collections,
	.list {
		position: relative;
		isolation: isolate;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--s-5);
	}

	.bento {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		grid-auto-rows: 220px;
		gap: var(--s-4);
	}

	.feature {
		grid-column: span 2;
		grid-row: span 2;
	}

	.collection {
		position: relative;
		display: grid;
		grid-template-rows: minmax(0, 1fr) auto;
		block-size: 100%;
		padding: 6px;
		border-radius: var(--r-card);
		transition:
			transform var(--d-base) var(--ease-out),
			box-shadow var(--d-base) var(--ease-out);
	}

	.collection:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-float);
	}

	.collage {
		min-block-size: 0;
		border-radius: var(--r-md);
		overflow: hidden;
	}

	.collection-text {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--s-2);
		padding: var(--s-3) var(--s-3) var(--s-2);
	}

	.collection-text h3 {
		font-family: var(--font-display);
		font-size: 22px;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.feature .collection-text h3 {
		font-size: var(--t-display-3);
	}

	.collection-text span {
		flex: none;
		font-size: var(--t-small);
		color: var(--ink-2);
	}

	.collection-desc {
		padding: 0 var(--s-3) var(--s-3);
		color: var(--ink-2);
		font-size: 14px;
	}

	/* domain hero */
	.hero {
		position: relative;
		isolation: isolate;
		display: flex;
		align-items: flex-end;
		min-block-size: max(56vh, 480px);
		padding-block: 120px var(--s-7);
		overflow: hidden;
		color: var(--on-photo);
	}

	.hero-photo {
		position: absolute;
		inset: 0;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		z-index: -2;
		mask-image: linear-gradient(180deg, white 62%, transparent);
		animation: drift var(--d-ambient) var(--ease-in-out) infinite alternate;
	}

	.hero-scrim {
		position: absolute;
		inset: 0;
		z-index: -1;
		mask-image: linear-gradient(180deg, white 62%, transparent);
		background:
			linear-gradient(90deg, var(--scrim-end) 0%, transparent 70%),
			linear-gradient(0deg, var(--scrim-end) 0%, transparent 60%);
	}

	.hero-body {
		display: grid;
		gap: var(--s-7);
	}

	.hero-copy {
		display: grid;
		gap: var(--s-4);
		max-inline-size: 640px;
	}

	.hero-intro {
		max-inline-size: 46ch;
		color: var(--on-photo);
		opacity: 0.92;
	}

	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
		justify-self: start;
		padding: 6px;
		border-radius: var(--r-pill);
		background: var(--glass);
		backdrop-filter: var(--glass-filter);
		border: 1px solid var(--glass-border);
	}

	.tabs :global(.chip.glass) {
		background: transparent;
		border-color: transparent;
	}

	.tabs :global(.chip.active) {
		background: var(--accent);
		border-color: var(--accent);
	}

	/* list */
	.section-head :global(.add) {
		margin-inline-start: auto;
		align-self: center;
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2);
		padding: 6px;
		border-radius: var(--r-panel);
	}

	.spacer {
		flex: 1;
	}

	.select select {
		min-block-size: 44px;
		padding: 0 var(--s-8) 0 var(--s-4);
		border-radius: var(--r-pill);
		border: 1px solid var(--line);
		background: var(--surface);
		appearance: none;
		background-image: linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%);
		background-position:
			calc(100% - 20px) 50%,
			calc(100% - 15px) 50%;
		background-size: 5px 5px;
		background-repeat: no-repeat;
		font-size: 14px;
		font-weight: 500;
	}

	.toggle {
		display: inline-flex;
		gap: 4px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		align-items: end;
		gap: var(--s-6) var(--s-4);
	}

	/* detail excerpt */
	.detail {
		position: relative;
		isolation: isolate;
		padding-block: var(--s-10);
		overflow: hidden;
	}

	.detail-backdrop {
		position: absolute;
		inset: 0;
		z-index: -1;
		background: var(--surface-2);
	}

	.detail-backdrop img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		filter: blur(48px) saturate(1.3);
		transform: scale(1.2);
		opacity: 0.6;
	}

	.detail-backdrop::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, var(--ground) 0%, transparent 30%, transparent 70%, var(--ground) 100%);
	}

	.detail-body {
		display: grid;
		gap: var(--s-6);
	}

	.detail-grid {
		display: grid;
		grid-template-columns: 400px minmax(0, 1fr);
		align-items: start;
		gap: var(--s-8);
	}

	.detail-cover {
		position: sticky;
		inset-block-start: 100px;
		aspect-ratio: 4 / 5;
		border-radius: var(--r-panel);
		overflow: hidden;
		box-shadow: var(--shadow-float);
	}

	.detail-cover.square {
		aspect-ratio: 1;
	}

	.detail-cover.tall {
		aspect-ratio: 2 / 3;
	}

	.detail-cover img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.detail-grid :global(.detail-panel) {
		display: grid;
		gap: var(--s-4);
		padding: var(--s-8);
		align-content: start;
	}

	.detail-grid :global(.detail-panel > .progress) {
		justify-self: start;
	}

	.detail-title {
		font-family: var(--font-display);
		font-size: var(--t-display-2);
		font-weight: 500;
		letter-spacing: -0.015em;
		line-height: 1.05;
	}

	.creator {
		color: var(--ink);
		font-weight: 500;
		margin-block-start: -8px;
	}

	.detail-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-4);
	}

	.facts {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: var(--s-3);
		margin: 0;
		padding-block: var(--s-4);
		border-block: 1px solid var(--line);
	}

	.facts dt {
		font-size: var(--t-eyebrow);
		font-weight: 600;
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--ink);
		opacity: 0.8;
	}

	.facts dd {
		margin: 2px 0 0;
		font-weight: 500;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
	}

	.note {
		font-family: var(--font-display);
		font-style: var(--accent-style);
		font-size: 22px;
		line-height: 1.35;
	}

	.detail-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-3);
	}

	@keyframes drift {
		from {
			transform: scale(1.04) translate(0, 0);
		}

		to {
			transform: scale(1.12) translate(-1.5%, -1%);
		}
	}

	/* tablet and phone: nav at the bottom, stacked heroes, shelves bleed right */
	@media (max-width: 1023px) {
		.topbar {
			display: none;
		}

		.settings-phone {
			display: inline-flex;
		}

		.tabbar {
			display: block;
			position: fixed;
			inset-inline: 10px;
			inset-block-end: max(12px, env(safe-area-inset-bottom));
			z-index: 40;
		}

		main {
			gap: var(--s-9);
			padding-block-end: calc(var(--tabbar-h) + 56px);
		}

		.home {
			padding-block-start: var(--s-4);
		}

		.frame {
			min-block-size: 0;
		}

		/* the phone headline sits at the top of the photo, so the scrim darkens from the top */
		.frame-scrim {
			background:
				linear-gradient(180deg, var(--scrim-end) 0%, var(--scrim-end) 38%, transparent 70%),
				linear-gradient(0deg, var(--scrim-end) 0%, transparent 35%);
		}

		h2 {
			font-size: var(--t-display-3);
		}

		.collection-text {
			flex-direction: column;
			align-items: flex-start;
			gap: 0;
			padding: var(--s-2) var(--s-2) 4px;
		}

		.collection-text h3 {
			max-inline-size: 100%;
		}

		.frame-body {
			grid-template-columns: 1fr;
			gap: var(--s-7);
			padding: var(--s-8) var(--s-5) var(--s-5);
		}

		.frame-cta {
			justify-content: space-between;
		}

		.cf-stage {
			block-size: 300px;
		}

		.cf-item {
			inset-inline-start: calc(50% - 95px);
			inline-size: 190px;
		}

		.frame :global(.stats) {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--s-4) 0;
			margin: 0 var(--s-3) var(--s-3);
			padding: var(--s-4);
		}

		.stat:nth-child(3) {
			border-inline-start: 0;
			padding-inline-start: 0;
		}

		.stat-value {
			font-size: 32px;
		}

		.shelf-row-wrap {
			inline-size: auto;
			margin-inline: var(--gutter) 0;
		}

		.shelf-row {
			display: flex;
			gap: var(--s-3);
			overflow-x: auto;
			scroll-snap-type: x mandatory;
			scroll-padding-inline: 0;
			padding-inline-end: var(--gutter);
			padding-block: 4px 12px;
			scrollbar-width: none;
		}

		.shelf-row li {
			flex: 0 0 auto;
			inline-size: 168px;
			scroll-snap-align: start;
		}

		.see-all {
			justify-content: center;
			min-inline-size: 44px;
			font-size: 0;
			gap: 0;
		}

		.bento {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			grid-auto-rows: 190px;
			gap: var(--s-3);
		}

		.feature {
			grid-row: span 2;
		}

		.hero {
			min-block-size: 460px;
			padding-block: 120px var(--s-5);
		}

		/* the phone headline wraps up into the photo, so the scrim reaches higher */
		.hero-scrim {
			background: linear-gradient(0deg, var(--scrim-end) 0%, var(--scrim-end) 40%, transparent 92%);
		}

		.tabs {
			flex-wrap: nowrap;
			overflow-x: auto;
			max-inline-size: 100%;
			scrollbar-width: none;
		}

		.hero-settings {
			position: absolute;
			inset-block-start: var(--s-4);
			inset-inline-end: var(--gutter);
		}

		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--s-4) var(--s-3);
		}

		/* one swipeable row on phone instead of a wrapped block */
		.filters {
			flex-wrap: nowrap;
			overflow-x: auto;
			border-radius: var(--r-pill);
			scrollbar-width: none;
		}

		.filters > :global(*) {
			flex: none;
		}

		.filters .spacer {
			display: none;
		}

		.detail-grid {
			grid-template-columns: 1fr;
			gap: var(--s-5);
		}

		.detail-cover {
			position: static;
			inline-size: min(100%, 280px);
		}

		.detail-grid :global(.detail-panel) {
			padding: var(--s-5);
		}
	}

	@media (min-width: 640px) and (max-width: 1023px) {
		.grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
</style>
