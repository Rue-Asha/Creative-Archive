<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import State from '../../shell/State.svelte';
	import { entries as entriesText } from '../../shell/data.ts';
	import { homeView } from '../data.ts';
	import HomeBody from '../HomeBody.svelte';

	const view = $derived(homeView(mockData(new URL(page.url.href))));
	const stressed = $derived(homeView(mockData(new URL('http://x/?data=worst'))));
	const nothing = $derived({ ...view, inProgress: [], inProgressCount: 0 });
	const noCollections = $derived({ ...view, collections: [] });
</script>

<svelte:head><title>Creative Archive · Home states</title></svelte:head>

<Frame world="home" section="home" plus="inert">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Home</li><li>States</li></ul>
			<h1>Home <em class="accent-word">states</em></h1>
			<p class="lede">The parts of Home that change with the archive. The empty archive and the colour-field head are their own screens.</p>
		</div>
	</div>
	<div class="screen-body" data-settle>
		<State label="Nothing in progress" note="The In progress card is absent; the rest keeps its order.">
			<HomeBody view={nothing} parts={['tiles', 'recent']} limit={5} />
		</State>
		<State label="No collections" note="The Collections card becomes a New collection prompt; no collage.">
			<HomeBody view={noCollections} parts={['collections']} />
		</State>
		<State label="Long titles, other scripts, no images" note="180-character Latin, Japanese and Arabic titles and a one-letter title; initials plates stand in for every cover and collage. Titles stop at three lines.">
			<HomeBody view={stressed} parts={['progress', 'recent', 'collections']} noImages limit={5} />
		</State>
		<State label="Tile counts at the extremes" note={`${entriesText(1284)}, ${entriesText(12)}, ${entriesText(1)} and no entries yet. A tile for an empty domain still opens its page.`}>
			<HomeBody view={stressed} parts={['tiles']} />
		</State>
	</div>
</Frame>

<style>
	.screen-body :global(.screen-body) { display: grid; gap: var(--space-4); }
</style>
