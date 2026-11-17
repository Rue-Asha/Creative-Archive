<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { dataFor } from '../../list/parts/data.ts';
	import FormFields from '../../list/parts/FormFields.svelte';
	import Panel from '../../list/parts/Panel.svelte';
	import '../../list/parts/wire.css';

	const fx = $derived(dataFor(page.url));
	const kinds = [
		{ kind: 'anime', title: 'Anime', note: 'Alternative title, year and the episodes total; the current count stays on the entry page' },
		{ kind: 'manga', title: 'Manga', note: 'Chapters total and Volumes total, both optional' },
		{ kind: 'book', title: 'Book', note: 'Authors, one per line, original script kept' },
		{ kind: 'song', title: 'Song', note: 'Artist as a link or free text, Album as text' },
		{ kind: 'artist', title: 'Artist', note: 'Name only' },
		{ kind: 'brand', title: 'Brand, shop or site', note: 'Kind is an ordinary field; changing it keeps the entry in Brands & shops' },
		{ kind: 'influencer', title: 'Influencer', note: 'Four handles: Instagram, TikTok, YouTube, Website' },
		{ kind: 'magazine', title: 'Magazine', note: 'The same four handles' },
		{ kind: 'look', title: 'Look', note: 'Title and a source URL' }
	] as const;
	const names = (n: number) => fx.tags.slice(0, n).map((t) => t.name);
</script>

<svelte:head><title>Edit forms by kind (wireframe)</title></svelte:head>

<Frame world="music" section="music" plus="inert">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Edit</li><li>Every kind</li></ul>
			<h1>Edit forms <em class="accent-word">by kind</em></h1>
			<p class="lede">One form shape for all types. Media forms carry no status, rating or progress; the footer (Cancel, Save) is the same everywhere.</p>
		</div>
	</div>
	<div class="screen-body w-gallery">
		{#each kinds as k (k.kind)}
			<Panel title={k.title} note={k.note}>
				<section class="card w-form" data-surface="solid" aria-label={k.title}>
					<FormFields kind={k.kind} mode="edit" prefix={k.kind} compact tags={names(fx.worst ? 8 : 1)} image={k.kind === 'artist' ? 'none' : 'set'} />
				</section>
			</Panel>
		{/each}
	</div>
</Frame>
