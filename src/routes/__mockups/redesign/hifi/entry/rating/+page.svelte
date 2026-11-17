<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import State from '../../shell/State.svelte';
	import { entryFor } from '../data.ts';
	import RatingCard from '../RatingCard.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const title = $derived(entryFor(data, 'album').title);
</script>

<svelte:head><title>Rating states · Creative Archive</title></svelte:head>

<Frame world="music" section="music">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Music</li><li>Albums</li></ul>
			<h1>Rating <em class="accent-word">states</em></h1>
			<p class="lede" lang={data.worst ? undefined : undefined}>{title.length > 80 ? `${title.slice(0, 78)}…` : title}</p>
		</div>
	</div>
	<div class="screen-body" data-settle>
		<div class="grid">
			<State label="Not rated" note="The field shows “–” so “/ 10” never stands alone; no Clear rating. One less is not disabled: it starts from 0.">
				<RatingCard value={null} />
			</State>
			<State label="0 is a rating" note="0 differs from none: it shows 0 / 10 and can be cleared; one less is disabled.">
				<RatingCard value="0" />
			</State>
			<State label="8.75, just saved" note="Committing a changed value (Enter or blur) draws an accent line under the number, holds, then fades; shown held here. Reduced motion fades it in place.">
				<RatingCard value="8.75" confirmed held />
			</State>
			<State label="10" note="One more is disabled at 10, one less at 0.">
				<RatingCard value="10" />
			</State>
			<State label="8.755 is rejected inline" note="Up to two decimals; the message stays under the field until the value is fixed and nothing is saved.">
				<RatingCard value="8.755" invalid />
			</State>
			<State label="How it is operated" note="A typed number, not a slider.">
				<section class="card pad" data-surface="solid" aria-label="Rating controls">
					<ul>
						<li>Type a value from 0 to 10 with up to two decimals (8, 8.5 and 8.75 are valid).</li>
						<li>The round − and + buttons move it by 0.25; Arrow Up and Down do the same. Home and End move the text cursor.</li>
						<li>Read out as “Rating”, “8.75 of 10”, as a spin button. Clear rating empties it.</li>
					</ul>
				</section>
			</State>
		</div>
	</div>
</Frame>

<style>
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr)); gap: var(--space-4); align-items: start; }
	.pad { padding: var(--space-4) var(--space-5); font-size: var(--type-body-s-size); line-height: var(--type-body-line); }
	ul { display: grid; gap: var(--space-2); margin: 0; padding-inline-start: var(--space-4); }
</style>
