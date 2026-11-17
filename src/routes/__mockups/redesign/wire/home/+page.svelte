<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import { entries as entriesText, fmt, link } from '../shell/data.ts';
	import Head from '../shell/Head.svelte';
	import Icon from '../shell/Icon.svelte';
	import Specimen from '../shell/Specimen.svelte';
	import { homeView } from './data.ts';
	import HomeBody from './HomeBody.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const view = $derived(homeView(data));
	const stressed = $derived(homeView(mockData(new URL('http://x/?data=worst'))));
	const facts = $derived({
		caption: 'Whole archive',
		items: [
			{ n: fmt(view.total), label: view.total === 1 ? 'Entry' : 'Entries' },
			{ n: fmt(view.inProgressCount), label: 'In progress' },
			{ n: fmt(view.collections.length), label: view.collections.length === 1 ? 'Collection' : 'Collections' }
		]
	});
	const nothing = $derived({ ...view, inProgress: [], inProgressCount: 0 });
	const noCollections = $derived({ ...view, collections: [] });
	const lede = 'Music, anime and manga, books and fashion: what you want next, what you are in the middle of, and what stayed.';
</script>

<svelte:head><title>Home · wireframe</title></svelte:head>

{#snippet actions()}
	<a class="fw-btn primary add-desktop" href={link('wire/add', view.worst)}>Add<Icon name="arrow" size={18} /></a>
	<a class="fw-chip" href={link('wire/settings', view.worst)}><Icon name="settings" size={18} />Settings</a>
{/snippet}

{#snippet cornerSettings()}
	<a class="fw-icon" href={link('wire/settings', view.worst)} aria-label="Settings"><Icon name="settings" size={20} /></a>
{/snippet}

<Frame world="home" section="home">
	<div class="fw-page">
		<Head kicker={['Home']} {lede} hero={view.hero} {facts} {actions}>
			{#snippet title()}Everything you <em class="accent-word">love</em>, kept close{/snippet}
		</Head>
		<HomeBody {view} />

		<div class="fw-states">
			<h2>States</h2>
			<Specimen label="Empty archive" note="A welcome replaces tiles and shelves: one 'Add your first' link per domain. On the phone the round + in the bar stays; on the desktop the Add button in the head.">
				<HomeBody {view} parts={['welcome']} />
			</Specimen>
			<Specimen label="Nothing in progress" note="The In progress section is absent, the rest keeps its order.">
				<HomeBody view={nothing} parts={['tiles', 'recent']} limit={5} />
			</Specimen>
			<Specimen label="No collections" note="The Collections section turns into a New collection prompt; no collage.">
				<HomeBody view={noCollections} parts={['collections']} />
			</Specimen>
			<Specimen label="Long titles, other scripts, no images" note="180-character Latin, Japanese and Arabic titles, a one-letter title; initials plates stand in for every cover and collage. Two lines, then cut.">
				<HomeBody view={stressed} parts={['progress', 'recent', 'collections']} noImages limit={5} />
			</Specimen>
			<Specimen label="Recently added, option B: one shelf with a domain switch" note="Option A (above) stacks one shelf per domain. B shows one domain at a time behind a switch: shorter page, one more tap.">
				<HomeBody {view} parts={['recent']} recentMode="switch" limit={6} />
			</Specimen>
			<Specimen label="Settings button, option B: a round icon in the head's corner" note="Option A (above) is a labelled chip in the head. B keeps the round icon the top bar uses, in the corner; on the phone it is the only way to Settings, so it needs the name 'Settings'.">
				<Head kicker={['Home']} lede={lede} corner={cornerSettings}>
					{#snippet title()}Everything you <em class="accent-word">love</em>, kept close{/snippet}
				</Head>
			</Specimen>
			<Specimen label="Tile counts at the extremes" note={`${entriesText(1284)}, ${entriesText(12)}, ${entriesText(1)} and no entries yet (a tile for an empty domain still opens its page).`}>
				<HomeBody view={stressed} parts={['tiles']} />
			</Specimen>
		</div>
	</div>
</Frame>

<style>
	.add-desktop { display: none; }
	@media (min-width: 1024px) { .add-desktop { display: inline-flex; } }
</style>
