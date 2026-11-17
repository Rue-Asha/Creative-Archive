<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import { LISTS } from '../../list/data.ts';
	import State from '../../shell/State.svelte';
	import { barActions, TAGS } from '../actions.ts';
	import SelectionBar from '../SelectionBar.svelte';
	import SelectSheet from '../SelectSheet.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const def = LISTS.albums;
	const tags = $derived(data.worst ? data.tags : TAGS);
	const onSelection = $derived(tags.slice(0, data.worst ? 12 : 2));
</script>

<svelte:head><title>Select sheets · Creative Archive</title></svelte:head>

<Frame world="music" section="music" list="albums">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Music</li><li>Albums</li><li>Select</li></ul>
			<h1>Select <em class="accent-word">sheets</em></h1>
			<p class="lede">Set status, Add tag and Remove tag. On the phone each opens as a bottom sheet; from 768 px the same content is a centred dialog.</p>
		</div>
	</div>
	<div class="screen-body" data-settle>
		<State label="Set status" note="One list for the selection’s status set; a row applies it to every selected entry at once.">
			<SelectionBar posture="desktop" count={4} actions={barActions(def)} open="status" />
			<SelectSheet inline kind="status" {def} count={4} />
		</State>
		<State label="Add tag" note="Typing filters the existing tags; a new name appears as a Create row. An existing spelling is reused (“Autumn” becomes “autumn”).">
			<SelectionBar posture="desktop" count={4} actions={barActions(def)} />
			<SelectSheet inline kind="tag-add" {def} count={4} {tags} query={data.worst ? 'tag-1' : 'win'} />
		</State>
		<State label="Remove tag" note="Only tags that sit on the selection are listed.">
			<SelectSheet inline kind="tag-remove" {def} count={4} tags={onSelection} />
		</State>
		<State label="Remove tag, none to remove" note="The selection carries no tags: the action stays reachable and says so.">
			<SelectSheet inline kind="tag-remove" {def} count={2} tags={[]} />
		</State>
	</div>
</Frame>
