<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { dataFor, entryFor } from '../../list/parts/data.ts';
	import Panel from '../../list/parts/Panel.svelte';
	import RatingCard from '../../list/parts/RatingCard.svelte';
	import '../../list/parts/wire.css';

	const fx = $derived(dataFor(page.url));
	const title = $derived(entryFor(fx, 'album').title);
</script>

<svelte:head><title>Rating states (wireframe)</title></svelte:head>

<Frame world="music" section="music">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Music</li><li>Albums</li></ul>
			<h1>Rating <em class="accent-word">states</em></h1>
			<p class="lede">{title}</p>
		</div>
	</div>
	<div class="screen-body w-gallery">
		<Panel title="Not rated" note="The field shows “–” so “/ 10” never stands alone; no Clear rating">
			<RatingCard value={null} prefix="r-empty" />
		</Panel>
		<Panel title="0 is a rating" note="0 differs from none: it shows 0 / 10 and can be cleared">
			<RatingCard value="0" prefix="r-zero" />
		</Panel>
		<Panel title="8.75, just saved" note="Committing a changed value (Enter or blur) draws a short line under the number, then it fades; reduced motion fades it in place">
			<RatingCard value="8.75" confirmed prefix="r-saved" />
		</Panel>
		<Panel title="10" note="One more is disabled at 10, one less at 0">
			<RatingCard value="10" prefix="r-ten" />
		</Panel>
		<Panel title="8.755 is rejected inline" note="Up to two decimals; the message stays under the field until the value is fixed, nothing is saved">
			<RatingCard value="8.755" invalid prefix="r-bad" />
		</Panel>
		<Panel title="How it is operated" note="A typed number, not a slider">
			<section class="card w-card-pad" data-surface="solid" aria-label="Rating controls">
				<ul class="w-stack">
					<li>Type a value from 0 to 10 with up to two decimals (8, 8.5 and 8.75 are valid).</li>
					<li>The round − and + steps move it by 0.25; Arrow Up and Down do the same. Home and End move the text cursor.</li>
					<li>Read out as “Rating”, “8.75 of 10”, as a spin button. Clear rating empties it.</li>
				</ul>
			</section>
		</Panel>
	</div>
</Frame>
