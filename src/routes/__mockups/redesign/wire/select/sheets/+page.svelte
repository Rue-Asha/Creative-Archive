<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { lists, dataFor } from '../../list/parts/data.ts';
	import Dialog from '../../list/parts/Dialog.svelte';
	import Icon from '../../list/parts/Icon.svelte';
	import Panel from '../../list/parts/Panel.svelte';
	import SelectionBar from '../../list/parts/SelectionBar.svelte';
	import TagPicker from '../../list/parts/TagPicker.svelte';
	import '../../list/parts/wire.css';

	const fx = $derived(dataFor(page.url));
	const noun = lists.albums.noun;
	const statuses = ['No status', ...lists.albums.statuses];
	const onSelection = $derived(fx.tags.slice(0, fx.worst ? 12 : 2));
</script>

<svelte:head><title>Select mode sheets (wireframe)</title></svelte:head>

<Frame world="music" section="music">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Music</li><li>Albums</li><li>Select</li></ul>
			<h1>Select <em class="accent-word">sheets</em></h1>
			<p class="lede">Set status, Add tag and Remove tag. On the phone each opens as a bottom sheet; from 768 px the same content is a menu or dialog under the bar.</p>
		</div>
	</div>
	<div class="screen-body w-gallery">
		<Panel title="Set status" note="One list for the selection's status set; picking a row applies it to every selected entry at once. No row is checked when the selection mixes statuses">
			<div class="w-stack">
				<SelectionBar count={4} open="status" />
				<Dialog title="Set status for 4 albums" mode="sheet">
					<ul class="w-menu" role="menu" aria-label="Status">
						{#each statuses as s, i (s)}
							<li role="none"><button type="button" class="w-menu-item" role="menuitemradio" aria-checked="false"><Icon name="check" size={16} /><span class="w-grow">{s}</span></button></li>
						{/each}
					</ul>
					{#snippet actions()}<button type="button" class="w-btn">Cancel</button>{/snippet}
				</Dialog>
			</div>
		</Panel>
		<Panel title="Add tag" note="Typing filters the existing tags; a new name appears as a Create row. An existing spelling is reused (“Autumn” becomes “autumn”)">
			<div class="w-stack">
				<SelectionBar count={4} open="tag-add" />
				<TagPicker mode="add" tags={fx.tags} selected={4} {noun} query={fx.worst ? 'tag-1' : 'win'} />
			</div>
		</Panel>
		<Panel title="Remove tag" note="Only tags that sit on the selection are listed">
			<div class="w-stack">
				<SelectionBar count={4} open="tag-remove" />
				<TagPicker mode="remove" tags={onSelection} selected={4} {noun} />
			</div>
		</Panel>
		<Panel title="Remove tag, none to remove" note="The selection carries no tags: the action stays reachable and says so">
			<TagPicker mode="remove" tags={[]} selected={2} {noun} />
		</Panel>
	</div>
</Frame>
