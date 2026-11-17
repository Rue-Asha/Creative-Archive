<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import Head from '../shell/Head.svelte';
	import Specimen from '../shell/Specimen.svelte';
	import { COPY, MESSAGES, slots } from './data.ts';
	import HeroSlot from './HeroSlot.svelte';
	import SlotGrid from './SlotGrid.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	// the worst set has three worlds without a photo; the two that fail are the ones the contract names
	const main = $derived(data.worst ? slots(data.heroes, { books: { error: MESSAGES.type }, fashion: { error: MESSAGES.size } }) : slots(data.heroes));
	const none = $derived(slots(data.empty.heroes));
	const all = $derived(slots({ home: 'a', music: 'a', animanga: 'a', books: 'a', fashion: 'a' }));
	const one = (world: 'music' | 'books' | 'fashion', patch: object, photo = true) => slots({ home: null, music: null, animanga: null, books: null, fashion: null, [world]: photo ? 'a' : null }, { [world]: patch })[['home', 'music', 'animanga', 'books', 'fashion'].indexOf(world)];
	const hero = $derived(data.heroes.home !== null);
</script>

<svelte:head><title>Settings · wireframe</title></svelte:head>

<Frame world="home" section="settings">
	<div class="fw-page">
		<Head kicker={['Settings']} lede={COPY} {hero}>
			{#snippet title()}Hero <em class="accent-word">photos</em>{/snippet}
		</Head>
		<SlotGrid list={main} />

		<div class="fw-states">
			<h2>States</h2>
			<Specimen label="Every world has a photo" note="Replace and Remove are equal choices: same button, same height, neither dark, neither focused on load. Remove deletes the photo, so it is not an arrow pill and carries no icon.">
				<SlotGrid list={all} />
			</Specimen>
			<Specimen label="No photo set" note="Five slots in world order. An empty slot reads 'No photo yet' on the colour field and offers Upload only.">
				<SlotGrid list={none} />
			</Specimen>
			<Specimen label="Upload failed" note="Messages sit inside the slot and leave its photo as it was: a text file ('Unsupported image type'), a HEIC file (the same message) and an oversize file.">
				<ul class="errors">
					<li><HeroSlot slot={one('music', { error: MESSAGES.type })} /><p class="fw-note">A .txt file</p></li>
					<li><HeroSlot slot={one('books', { error: MESSAGES.type })} /><p class="fw-note">A .heic file</p></li>
					<li><HeroSlot slot={one('fashion', { error: MESSAGES.size }, false)} /><p class="fw-note">A 17 MB file, slot without a photo</p></li>
				</ul>
			</Specimen>
			<Specimen label="Uploading" note="While a request runs the slot's actions are disabled and a status line says so.">
				<ul class="errors">
					<li><HeroSlot slot={one('music', { state: 'pending' })} /></li>
					<li><HeroSlot slot={one('fashion', { state: 'pending' }, false)} /></li>
				</ul>
			</Specimen>
		</div>
	</div>
</Frame>

<style>
	.errors { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr)); gap: var(--space-4); margin: 0; padding: 0; list-style: none; align-items: start; }
	.errors > li { display: grid; gap: var(--space-2); min-inline-size: 0; }
</style>
