<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { dataFor, entryFor } from '../../list/parts/data.ts';
	import Dialog from '../../list/parts/Dialog.svelte';
	import FormFields from '../../list/parts/FormFields.svelte';
	import FormFoot from '../../list/parts/FormFoot.svelte';
	import Icon from '../../list/parts/Icon.svelte';
	import ImageField from '../../list/parts/ImageField.svelte';
	import Panel from '../../list/parts/Panel.svelte';
	import Toast from '../../list/parts/Toast.svelte';
	import '../../list/parts/wire.css';

	const fx = $derived(dataFor(page.url));
	const entry = $derived(entryFor(fx, 'album'));
</script>

<svelte:head><title>Edit guard and errors (wireframe)</title></svelte:head>

<Frame world="music" section="music" plus="inert">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Music</li><li>Albums</li><li>Edit</li></ul>
			<h1>Edit <em class="accent-word">guard</em></h1>
			<p class="lede">What happens when an edit is left, saved or fails.</p>
		</div>
	</div>
	<div class="screen-body w-gallery">
		<Panel title="Unsaved changes" note="Leaving in-app with values that differ from how the form opened asks first. Reload or close uses the browser’s own prompt; an untouched form never asks">
			<Dialog title="Discard changes?" alert>
				<p>What you changed on this entry isn’t saved yet.</p>
				{#snippet actions()}
					<button type="button" class="w-btn" data-focus="halo">Keep editing</button>
					<button type="button" class="w-btn danger"><Icon name="trash" size={16} />Discard</button>
				{/snippet}
			</Dialog>
		</Panel>
		<Panel title="Saving…" note="Save is disabled while the request runs; success shows “Saved” on the entry page">
			<div class="w-stack">
				<section class="card w-form" data-surface="solid" aria-label="Saving"><FormFoot saving cancelHref="/__mockups/redesign/wire/entry" /></section>
				<Toast message="Saved" />
			</div>
		</Panel>
		<Panel title="Image replaced or removed" note="A new image replaces the old one only on Save; Remove image deletes it on Save">
			<section class="card w-form" data-surface="solid" aria-label="Image">
				<ImageField image="set" />
			</section>
		</Panel>
		<Panel title="Validation" note="Same rules as Add: messages under the field, focus on the first invalid field" wide>
			<section class="card w-form" data-surface="solid" aria-label="Validation">
				<FormFields kind="album" mode="edit" prefix="guard" title="" compact artistLinked tags={[]} errors={{ title: 'Title is required', year: 'Enter a whole number' }} />
			</section>
		</Panel>
		<Panel title="Document title and heading" note="The heading reads “Edit album”; the browser tab uses the entry’s title">
			<section class="card w-card-pad" data-surface="solid" aria-label="Titles">
				<p class="w-hint">Tab: <span>{entry.title}</span></p>
				<p class="w-hint">Heading: Edit album</p>
			</section>
		</Panel>
	</div>
</Frame>
