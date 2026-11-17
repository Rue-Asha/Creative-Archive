<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import State from '../../shell/State.svelte';
	import { href } from '../../shell/data.ts';
	import Crumbs from '../../add/Crumbs.svelte';
	import type { FormKind } from '../../add/data.ts';
	import FormCard from '../../add/FormCard.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const kinds: { kind: FormKind; title: string; note: string }[] = [
		{ kind: 'anime', title: 'Anime', note: 'Alternative title, year and the episodes total; the current count stays on the entry page.' },
		{ kind: 'manga', title: 'Manga', note: 'Chapters total and Volumes total, both optional.' },
		{ kind: 'book', title: 'Book', note: 'Authors, one per line, original script kept.' },
		{ kind: 'song', title: 'Song', note: 'Artist as a link or free text, Album as text.' },
		{ kind: 'artist', title: 'Artist', note: 'Name only.' },
		{ kind: 'brand', title: 'Brand, shop or site', note: 'Kind is an ordinary field; changing it keeps the entry in Brands & shops.' },
		{ kind: 'influencer', title: 'Influencer', note: 'Four handles: Instagram, TikTok, YouTube, Website.' },
		{ kind: 'magazine', title: 'Magazine', note: 'The same four handles.' },
		{ kind: 'look', title: 'Look', note: 'Title and a source URL.' }
	];
	const names = $derived(data.tags.slice(0, data.worst ? 8 : 1).map((t) => t.name));
	const entry = $derived(href('entry', data.worst));
</script>

<svelte:head><title>Edit forms by kind · Creative Archive</title></svelte:head>

<Frame world="music" section="music" plus="inert">
	<Crumbs kind="album" last="Every kind" worst={data.worst} head="Edit forms" word="by kind" lede="One form shape for all types. Media forms carry no status, rating or progress; the footer (Cancel, Save) is the same everywhere." />
	<div class="screen-body" data-settle>
		<State label="Song: artist suggestions open" note="Artist is a combobox on Song and Album forms: matches from your archive, or free text.">
			<FormCard kind="song" mode="edit" compact artistOpen tags={names} image="set" cancelHref={entry} worst={data.worst} label="Song, artist suggestions" />
		</State>
		<State label="Album: tag suggestions" note="The tag field offers existing tags as chips while typing.">
			<FormCard kind="album" mode="edit" compact tagSuggest tags={names} image="set" cancelHref={entry} worst={data.worst} label="Album, tag suggestions" />
		</State>
		{#each kinds as k (k.kind)}
			<State label={k.title} note={k.note}>
				<FormCard kind={k.kind} mode="edit" compact tags={names} image={k.kind === 'artist' ? 'none' : 'set'} cancelHref={entry} worst={data.worst} label={k.title} />
			</State>
		{/each}
	</div>
</Frame>
