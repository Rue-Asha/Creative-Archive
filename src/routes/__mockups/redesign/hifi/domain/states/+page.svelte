<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import State from '../../shell/State.svelte';
	import { domainView } from '../data.ts';
	import AddMenu from '../AddMenu.svelte';
	import DomainBody from '../DomainBody.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const worst = $derived(data.worst);
	const oneEmpty = $derived(domainView(data, 'music', { zero: ['songs'] }));
</script>

<svelte:head><title>Domain states · Creative Archive</title></svelte:head>

<Frame world="fashion" section="fashion" plus="inert">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Domain</li><li>States</li></ul>
			<h1>Domain <em class="accent-word">states</em></h1>
			<p class="lede">The Add menu open, and a domain with one empty sub-type. The empty domain and the colour-field head are their own screens.</p>
		</div>
	</div>
	<div class="screen-body" data-settle>
		<State label="Add menu open" note="The dark Add pill opens “Add to Fashion” with that domain's types; Brand or shop is one item. Arrow keys move, Escape closes and focus returns to the button.">
			<div class="menus">
				<AddMenu domain="fashion" {worst} shown />
				<AddMenu domain="music" {worst} shown />
				<AddMenu domain="animanga" {worst} shown />
				<AddMenu domain="books" {worst} shown />
			</div>
		</State>
		<State label="One empty sub-type" note="Songs has no entries: it keeps its place in the sub-type nav with a zero and has no shelf.">
			<DomainBody view={oneEmpty} />
		</State>
	</div>
</Frame>

<style>
	.menus { display: flex; flex-wrap: wrap; align-items: start; gap: var(--space-5); }
</style>
