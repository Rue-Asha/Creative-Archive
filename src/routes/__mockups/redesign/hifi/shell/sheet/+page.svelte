<script lang="ts">
	import { getContext } from 'svelte';
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import State from '../State.svelte';
	import PlusSheet from '../PlusSheet.svelte';
	import Icon from '../Icon.svelte';

	const worst = $derived(page.url.searchParams.get('data') === 'worst');
</script>

<svelte:head><title>The + sheet · Creative Archive</title></svelte:head>

{#snippet opener()}
	{@const open = getContext<(() => void) | undefined>('openPlus')}
	<button type="button" class="btn primary arrow" aria-haspopup="dialog" data-press data-focus="halo" onclick={() => open?.()}>Open the sheet<span class="circle" aria-hidden="true"><Icon name="arrow" /></span></button>
{/snippet}

<Frame world="home" section="home">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Shell</li><li>Add sheet</li></ul>
			<h1>What are you <em class="accent-word">adding</em></h1>
			<p class="lede">The round + opens one sheet of type chips. On Home, Collections and Settings it holds every type grouped by domain; inside a domain, that domain's types.</p>
			<div class="actions">{@render opener()}</div>
		</div>
	</div>
	<div class="screen-body" data-settle>
		<State label="On Home, Collections and Settings: every type, grouped by domain" note="Each chip opens its add page. The sheet closes on Escape, a tap outside or Close; focus returns to the +. Open for gate 5: the titles, “Add to your archive” and “Add to <Domain>”.">
			<PlusSheet scope="all" {worst} inline />
		</State>
		<State label="Inside Fashion: its five types" note="Brand or shop is one item. The group heading is dropped because the title already names the domain.">
			<PlusSheet scope="fashion" {worst} inline />
		</State>
		<State label="On Wardrobe: Piece starts as Owned" note="The same Fashion sheet; the Piece chip opens the add form with the status Owned.">
			<PlusSheet scope="fashion" list="wardrobe" {worst} inline />
		</State>
		<State label="Inside Music: three types" note="Album, Artist and Song. Animanga offers Anime and Manga; Books offers Book.">
			<PlusSheet scope="music" {worst} inline />
		</State>
	</div>
</Frame>
