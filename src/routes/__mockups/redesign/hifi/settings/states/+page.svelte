<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import State from '../../shell/State.svelte';
	import { MESSAGES, ORDER, slots } from '../data.ts';
	import HeroSlot from '../HeroSlot.svelte';
	import SlotGrid from '../SlotGrid.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const all = $derived(slots({ home: 'a', music: 'a', animanga: 'a', books: 'a', fashion: 'a' }));
	const none = $derived(slots(data.empty.heroes));
	const one = (world: 'music' | 'books' | 'fashion', patch: object, photo = true) =>
		slots({ home: null, music: null, animanga: null, books: null, fashion: null, [world]: photo ? 'a' : null }, { [world]: patch })[ORDER.indexOf(world)];
</script>

<svelte:head><title>Settings states · Creative Archive</title></svelte:head>

<Frame world="home" section="settings" plus="inert">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Settings</li><li>States</li></ul>
			<h1>Photo <em class="accent-word">states</em></h1>
			<p class="lede">What a slot shows when every world has a photo, none does, an upload fails or one is running.</p>
		</div>
	</div>
	<div class="screen-body" data-settle>
		<State label="Every world has a photo" note="Replace and Remove are equal choices: same button, same height, neither dark, neither focused on load. Remove deletes the photo, so it is not an arrow pill and carries no icon.">
			<SlotGrid list={all} />
		</State>
		<State label="No photo set" note="Five slots in world order. An empty slot reads “No photo yet” on the colour field and offers Upload only.">
			<SlotGrid list={none} />
		</State>
		<State label="Upload failed" note="Messages sit inside the slot and leave its photo as it was: a text file, a HEIC file (the same message) and an oversize file.">
			<ul class="errors">
				<li><HeroSlot slot={one('music', { error: MESSAGES.type })} /><p>A .txt file</p></li>
				<li><HeroSlot slot={one('books', { error: MESSAGES.type })} /><p>A .heic file</p></li>
				<li><HeroSlot slot={one('fashion', { error: MESSAGES.size }, false)} /><p>A 17 MB file, slot without a photo</p></li>
			</ul>
		</State>
		<State label="Uploading" note="While a request runs the slot's actions are disabled and a status line says so.">
			<ul class="errors">
				<li><HeroSlot slot={one('music', { state: 'pending' })} /></li>
				<li><HeroSlot slot={one('fashion', { state: 'pending' }, false)} /></li>
			</ul>
		</State>
	</div>
</Frame>

<style>
	.errors { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr)); gap: var(--space-4); margin: 0; padding: 0; list-style: none; align-items: start; }
	.errors > li { display: grid; gap: var(--space-2); min-inline-size: 0; }
	.errors p { font-size: var(--type-caption-size); color: var(--ink-secondary); }
</style>
