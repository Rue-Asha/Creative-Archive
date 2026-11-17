<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import AddHead from '../../list/parts/AddHead.svelte';
	import CatalogueStep from '../../list/parts/CatalogueStep.svelte';
	import { dataFor, entryHref } from '../../list/parts/data.ts';
	import Dialog from '../../list/parts/Dialog.svelte';
	import FormFields from '../../list/parts/FormFields.svelte';
	import FormFoot from '../../list/parts/FormFoot.svelte';
	import Icon from '../../list/parts/Icon.svelte';
	import ImageField from '../../list/parts/ImageField.svelte';
	import Panel from '../../list/parts/Panel.svelte';
	import Toast from '../../list/parts/Toast.svelte';
	import UrlStep from '../../list/parts/UrlStep.svelte';
	import '../../list/parts/wire.css';

	const fx = $derived(dataFor(page.url));
	const long = 'The Extraordinarily Long Title That Never Quite Ends And Keeps Going '.repeat(3).slice(0, 180);
</script>

<svelte:head><title>Add states (wireframe)</title></svelte:head>

<Frame world="music" section="music" plus="inert">
	<AddHead domain="music" list="Albums" word="album" lede="The states of the add flow that the three main screens do not show." />
	<div class="screen-body w-gallery">
		<Panel title="Searching" note="Status line “Searching…”, no result list yet; one request after 300 ms of silence">
			<CatalogueStep noun="album" mode="searching" query="kintsugi" />
		</Panel>
		<Panel title="Catalogue down: manual form" note="“Search is unavailable right now” after a provider error or 5 s; Add manually opens the form with the query as title">
			<CatalogueStep noun="album" mode="unavailable" query="kintsugi" />
		</Panel>
		<Panel title="No results" note="Same way out: Add manually">
			<CatalogueStep noun="album" mode="noresults" query="qwertz" />
		</Panel>
		<Panel title="Nothing typed" note="An empty query shows nothing">
			<CatalogueStep noun="album" mode="empty" />
		</Panel>
		<Panel title="URL: looking up" note="Checked when committed (change or Enter)">
			<UrlStep mode="loading" url="https://example.com/studio-nicholson" />
		</Panel>
		<Panel title="URL: invalid" note="No request is made">
			<UrlStep mode="invalid" url="studio nicholson" />
		</Panel>
		<Panel title="URL: no preview found" note="Blocked, JS-only or login-walled pages; the form stays usable">
			<UrlStep mode="none" url="https://www.instagram.com/studio.nicholson" />
		</Panel>
		<Panel title="HEIC rejected" note="A .heic file reads “Unsupported image type”; a file over 16 MB reads “Image is larger than 16 MB”">
			<section class="card w-form" data-surface="solid" aria-label="Image errors">
				<ImageField image="heic" />
				<ImageField image="large" />
			</section>
		</Panel>
		<Panel title="Validation: blank title, whole numbers" note="Messages sit under their field, focus moves to the first invalid field, a message clears when its field is edited" wide>
			<section class="card w-form" data-surface="solid" aria-label="Validation">
				<FormFields kind="album" prefix="val" compact errors={{ title: 'Title is required', year: 'Enter a whole number', tracks: 'Enter a whole number' }} tags={[]} />
			</section>
		</Panel>
		<Panel title="180-character title" note="The field stays one line and scrolls; the entry page shows the whole title" wide>
			<section class="card w-form" data-surface="solid" aria-label="Long title">
				<FormFields kind="album" prefix="long" title={long} compact tags={fx.worst ? fx.tags.slice(0, 20).map((t) => t.name) : ['favourite']} />
			</section>
		</Panel>
		<Panel title="Saving…" note="Save is disabled and reads “Saving…”, so repeated presses create one entry">
			<section class="card w-form" data-surface="solid" aria-label="Saving"><FormFoot saving /></section>
		</Panel>
		<Panel title="Already in your archive" note="A duplicate provider id shows the form again with a notice that links to the existing entry">
			<section class="card w-form" data-surface="solid" aria-label="Duplicate">
				<p class="w-error" role="alert"><Icon name="alert" size={16} /><span>Already in your archive. <a href={entryHref}>Open Kintsugi Summer</a></span></p>
				<FormFoot />
			</section>
		</Panel>
		<Panel title="Discard guard" note="Leaving with unsaved values asks first; an untouched form, Save and the move after a save never ask. Keep editing has the focus, Escape keeps editing">
			<Dialog title="Discard changes?" alert>
				<p>What you changed on this entry isn’t saved yet.</p>
				{#snippet actions()}
					<button type="button" class="w-btn" data-focus="halo">Keep editing</button>
					<button type="button" class="w-btn danger"><Icon name="trash" size={16} />Discard</button>
				{/snippet}
			</Dialog>
		</Panel>
		<Panel title="After saving" note="The toast shows on the entry page; a failed cover download adds its own line">
			<div class="w-stack">
				<Toast message="Saved" />
				<Toast message="Cover could not be downloaded" kind="error" />
			</div>
		</Panel>
	</div>
</Frame>
