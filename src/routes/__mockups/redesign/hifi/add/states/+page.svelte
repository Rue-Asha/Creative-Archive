<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import Icon from '../../shell/Icon.svelte';
	import State from '../../shell/State.svelte';
	import { href } from '../../shell/data.ts';
	import { nested } from '../../list/data.ts';
	import Toast from '../../select/Toast.svelte';
	import CatalogueStep from '../CatalogueStep.svelte';
	import Crumbs from '../Crumbs.svelte';
	import { LONG, resultsFor } from '../data.ts';
	import Dialog from '../Dialog.svelte';
	import FormCard from '../FormCard.svelte';
	import FormFoot from '../FormFoot.svelte';
	import ImageField from '../ImageField.svelte';
	import UrlStep from '../UrlStep.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const worst = $derived(data.worst);
	const cancel = $derived(nested('list', worst, 'd=music&t=albums'));
	const names = $derived(worst ? data.tags.slice(0, 20).map((t) => t.name) : ['favourite']);
</script>

<svelte:head><title>Add states · Creative Archive</title></svelte:head>

<Frame world="music" section="music" plus="inert">
	<Crumbs kind="album" last="States" {worst} head="Add" word="states" lede="The states of the add flow the main screens do not show." />
	<div class="screen-body" data-settle>
		<State label="Searching" note="Status line “Searching…”, no result list yet; one request after 300 ms of silence.">
			<CatalogueStep noun="album" mode="searching" query="kintsugi" {worst} />
		</State>
		<State label="Catalogue down: manual form" note="“Search is unavailable right now” after a provider error or 5 s; Add manually opens the form with the query as title.">
			<CatalogueStep noun="album" mode="unavailable" query="kintsugi" {worst} />
		</State>
		<State label="No results" note="The same way out: Add manually.">
			<CatalogueStep noun="album" mode="noresults" query="qwertz" {worst} />
		</State>
		<State label="Nothing typed" note="An empty query shows nothing.">
			<CatalogueStep noun="album" mode="empty" {worst} />
		</State>
		<State label="Results with long titles" note="Japanese, Arabic and a 180-character title clamp to two lines in a result.">
			<CatalogueStep noun="album" query="tōkyō" results={resultsFor('album', true)} {worst} />
		</State>
		<State label="URL: looking up" note="Checked when committed (change or Enter).">
			<UrlStep mode="loading" url="https://example.com/studio-nicholson" />
		</State>
		<State label="URL: invalid" note="No request is made.">
			<UrlStep mode="invalid" url="studio nicholson" />
		</State>
		<State label="URL: no preview found" note="Blocked, JavaScript-only or login-walled pages; the form stays usable.">
			<UrlStep mode="none" url="https://www.instagram.com/studio.nicholson" />
		</State>
		<State label="Image rejected" note="A .heic file reads “Unsupported image type”; a file over 16 MB reads “Image is larger than 16 MB”.">
			<section class="card pad" data-surface="solid" aria-label="Image errors">
				<div class="two"><ImageField image="heic" /><ImageField image="large" /></div>
			</section>
		</State>
		<State label="Validation: blank title, whole numbers" note="Messages sit under their field, focus moves to the first invalid field, a message clears when its field is edited.">
			<FormCard kind="album" compact cancelHref={cancel} {worst} errors={{ title: 'Title is required', year: 'Enter a whole number', tracks: 'Enter a whole number' }} />
		</State>
		<State label="Artist: suggestions open" note="Typing in Artist lists matching artists already in your archive; Arrow keys move, Enter or a click links one, Escape closes the list, and free text stays valid.">
			<div class="open-field"><FormCard kind="album" compact artistOpen cancelHref={cancel} {worst} /></div>
		</State>
		<State label="Tags: suggestions" note="Typing filters the existing tags into chips under the field; a chip adds it, Enter adds the typed text, a comma confirms what came before it.">
			<FormCard kind="album" compact tagSuggest tags={['autumn']} cancelHref={cancel} {worst} />
		</State>
		<State label="180-character title" note="The field stays one line and scrolls; the entry page shows the whole title.">
			<FormCard kind="album" compact cancelHref={cancel} {worst} title={LONG} tags={names} />
		</State>
		<State label="Saving…" note="Save is disabled and reads “Saving…”, so repeated presses create one entry.">
			<section class="card pad" data-surface="solid" aria-label="Saving"><FormFoot saving cancelHref={cancel} /></section>
		</State>
		<State label="Already in your archive" note="A duplicate provider id shows the form again with a notice that links to the existing entry.">
			<FormCard kind="album" compact notice cancelHref={cancel} {worst} title="Kintsugi Summer" />
		</State>
		<State label="Discard guard" note="Leaving with unsaved values asks first; an untouched form, Save and the move after a save never ask. Keep editing has the focus, Escape keeps editing.">
			<Dialog title="Discard changes?" alert>
				<p>What you changed on this entry isn’t saved yet.</p>
				{#snippet actions()}
					<button type="button" class="btn secondary" data-focus="halo" data-press>Keep editing</button>
					<button type="button" class="btn danger" data-press><Icon name="trash" size={16} />Discard</button>
				{/snippet}
			</Dialog>
		</State>
		<State label="After saving" note="The toast shows on the entry page; a failed cover download adds its own line.">
			<div class="toasts">
				<Toast message="Saved" />
				<Toast message="Cover could not be downloaded" kind="error" />
			</div>
			<p class="hint"><a href={href('entry', worst)}>Open the entry page</a></p>
		</State>
	</div>
</Frame>

<style>
	.pad { padding: var(--space-4); }
	.two { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); gap: var(--space-5); }
	.toasts { display: grid; gap: var(--space-2); justify-items: start; }
	.hint { font-size: var(--type-caption-size); }
	.open-field { padding-block-end: var(--space-2); }
</style>
