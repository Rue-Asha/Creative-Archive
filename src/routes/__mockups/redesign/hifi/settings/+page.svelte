<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import { COPY, MESSAGES, slots } from './data.ts';
	import SlotGrid from './SlotGrid.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	// the worst set has three worlds without a photo; the two that fail are the ones the contract names
	const list = $derived(data.worst ? slots(data.heroes, { books: { error: MESSAGES.type }, fashion: { error: MESSAGES.size } }) : slots(data.heroes));
	const set = $derived(list.filter((s) => s.photo).length);
</script>

<svelte:head><title>Settings · Creative Archive</title></svelte:head>

<Frame world="home" section="settings">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Settings</li><li>{set} of {list.length} set</li></ul>
			<h1>Hero <em class="accent-word">photos</em></h1>
			<p class="lede">{COPY}</p>
		</div>
		<ul class="screen-facts" data-surface="inverse" aria-label="Photos set">
			<li class="facts-caption">Hero photos</li>
			<li><span class="n">{set}</span>Set</li>
			<li><span class="n">{list.length - set}</span>Without</li>
		</ul>
	</div>
	<div class="screen-body" data-settle>
		<SlotGrid {list} />
	</div>
</Frame>
