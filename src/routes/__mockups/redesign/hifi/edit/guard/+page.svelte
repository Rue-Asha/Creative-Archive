<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import Icon from '../../shell/Icon.svelte';
	import State from '../../shell/State.svelte';
	import { href } from '../../shell/data.ts';
	import Crumbs from '../../add/Crumbs.svelte';
	import Dialog from '../../add/Dialog.svelte';
	import FormCard from '../../add/FormCard.svelte';
	import FormFoot from '../../add/FormFoot.svelte';
	import ImageField from '../../add/ImageField.svelte';
	import Toast from '../../select/Toast.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const entry = $derived(href('entry', data.worst));
</script>

<svelte:head><title>Edit guard and errors · Creative Archive</title></svelte:head>

<Frame world="music" section="music" plus="inert">
	<Crumbs kind="album" last="Guard" worst={data.worst} head="Edit" word="guard" lede="What happens when an edit is left, saved or fails." />
	<div class="screen-body" data-settle>
		<State label="Unsaved changes" note="Leaving in-app with values that differ from how the form opened asks first. Reload or close uses the browser’s own prompt; an untouched form never asks.">
			<Dialog title="Discard changes?" alert>
				<p>What you changed on this entry isn’t saved yet.</p>
				{#snippet actions()}
					<button type="button" class="btn secondary" data-focus="halo" data-press>Keep editing</button>
					<button type="button" class="btn danger" data-press><Icon name="trash" size={16} />Discard</button>
				{/snippet}
			</Dialog>
		</State>
		<State label="Saving…" note="Save is disabled while the request runs; success shows “Saved” on the entry page.">
			<section class="card pad" data-surface="solid" aria-label="Saving"><FormFoot saving cancelHref={entry} /></section>
			<Toast message="Saved" />
		</State>
		<State label="Image replaced or removed" note="A new image replaces the old one only on Save; Remove image deletes it on Save.">
			<section class="card pad" data-surface="solid" aria-label="Image"><ImageField image="set" /></section>
		</State>
		<State label="Validation" note="The same rules as Add: messages under the field, focus on the first invalid field.">
			<FormCard kind="album" mode="edit" compact artistLinked title="" cancelHref={entry} worst={data.worst} errors={{ title: 'Title is required', year: 'Enter a whole number' }} />
		</State>
		<State label="Document title and heading" note="The heading reads “Edit album”; the browser tab uses the entry’s title.">
			<section class="card pad" data-surface="solid" aria-label="Titles">
				<p class="hint">Tab: Kintsugi Summer · Edit · Creative Archive</p>
				<p class="hint">Heading: Edit album</p>
			</section>
		</State>
	</div>
</Frame>

<style>
	.pad { padding: var(--space-4); }
	.hint { font-size: var(--type-body-s-size); color: var(--ink-secondary); }
</style>
