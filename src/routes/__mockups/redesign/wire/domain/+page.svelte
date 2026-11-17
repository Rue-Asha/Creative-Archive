<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import { link } from '../shell/data.ts';
	import Specimen from '../shell/Specimen.svelte';
	import AddMenu from './AddMenu.svelte';
	import { asDomain, domainView } from './data.ts';
	import DomainBody from './DomainBody.svelte';
	import DomainHead from './DomainHead.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const d = $derived(asDomain(page.url.searchParams.get('d')));
	const view = $derived(domainView(data, d));
	const empty = $derived(domainView(data, 'books', { empty: true }));
	const oneEmpty = $derived(domainView(data, 'music', { zero: ['songs'] }));
	const noHero = $derived(domainView(data, d, { hero: false }));
	const withHero = $derived(domainView(data, d, { hero: true }));
	const others = ['music', 'animanga', 'books', 'fashion'] as const;
</script>

<svelte:head><title>Domain · wireframe</title></svelte:head>

<Frame world={d} section={d}>
	<div class="fw-page">
		<DomainHead {view} />
		<DomainBody {view} />

		<div class="fw-states">
			<h2>States</h2>
			<Specimen label="Other domains" note="This page shows one domain at a time: ?d=music, animanga, books or fashion.">
				<p class="others">
					{#each others as o (o)}<a class="fw-chip" href={link('wire/domain', view.worst, `d=${o}`)} aria-current={o === d ? 'page' : undefined}>{o[0].toUpperCase() + o.slice(1)}</a>{/each}
				</p>
			</Specimen>
			<Specimen label="Add menu open" note="The dark Add pill opens 'Add to <domain>' with that domain's types. Fashion has Brand or shop as one item, Influencer, Magazine, Piece and Look. Arrow keys move, Escape closes.">
				<div class="menus">
					<AddMenu domain="fashion" open inline />
					<AddMenu domain="music" open inline />
				</div>
			</Specimen>
			<Specimen label="Empty domain" note="Sub-types and Add stay; shelves give way to one empty state with a single action.">
				<DomainHead view={empty} />
				<DomainBody view={empty} />
			</Specimen>
			<Specimen label="One empty sub-type" note="Songs has no entries: it keeps its place in the nav with a zero, and has no shelf.">
				<DomainBody view={oneEmpty} />
			</Specimen>
			<Specimen label="Hero photo and none" note="With a hero photo (Settings) the head sits on it; without, on the frame's soft colour field. Same layout, same facts card.">
				<div class="pair">
					<DomainHead view={withHero} />
					<DomainHead view={noHero} />
				</div>
			</Specimen>
		</div>
	</div>
</Frame>

<style>
	.others, .menus { display: flex; flex-wrap: wrap; gap: var(--space-4); margin: 0; align-items: start; }
	.pair { display: grid; gap: var(--space-6); }
</style>
