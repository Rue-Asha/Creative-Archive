<script lang="ts">
	import Icon from '../shell/Icon.svelte';
	import Glyph from '../list/Glyph.svelte';
	import { href } from '../shell/data.ts';
	import FormFoot from './FormFoot.svelte';
	import ImageField from './ImageField.svelte';
	import { MEDIA, statusOptions, type FormKind } from './data.ts';

	// The add and edit form: one solid card, the image left of the fields from 768 px, one dark arrow pill "Save".
	type Props = {
		kind: FormKind;
		mode?: 'add' | 'edit';
		title?: string;
		status?: string;
		errors?: Record<string, string>;
		tags?: string[];
		image?: 'none' | 'set' | 'heic' | 'large';
		saving?: boolean;
		artistLinked?: boolean;
		preview?: boolean;
		compact?: boolean;
		cancelHref: string;
		worst?: boolean;
		label?: string;
		notice?: boolean;
		artistOpen?: boolean;
		tagSuggest?: boolean;
	};
	let { kind, mode = 'add', title = '', status, errors = {}, tags = [], image = 'none', saving = false, artistLinked = false, preview = false, compact = false, cancelHref, worst = false, label, notice = false, artistOpen = false, tagSuggest = false }: Props = $props();

	const uid = $props.id();
	const nameLabel = $derived(['artist', 'brand', 'influencer', 'magazine', 'piece'].includes(kind) ? 'Name' : 'Title');
	const options = $derived(statusOptions(kind));
	const hasStatus = $derived(options.length > 0 && (mode === 'add' || kind === 'piece'));
	const statusValue = $derived(status ?? (MEDIA.includes(kind) ? 'No status' : 'Wishlist'));
	const SAMPLE: Record<string, string> = { year: '2019', tracks: '11', alt: 'ハーバー・ライツ', episodes: '24', chapters: '96', volumes: '12', authors: 'Odile Brandt\nJoséphine Aubry', url: 'https://example.com/shop', price: '€ 189', brandName: 'Studio Nicholson', description: 'A calm London label for wool, linen and well-cut basics.', album: 'Blue Hour Sessions', source: 'https://example.com/look/autumn-layers', instagram: '@kinfolk', website: 'kinfolk.com' };
	const val = (key: string) => (mode === 'edit' ? (SAMPLE[key] ?? '') : '');
	const err = (key: string) => errors[key];
	const ARTISTS = ['Juno Ashby', 'Juno Ashby Quartet', 'June Ashby'];
	const SUGGEST = ['favourite', 'fabric', 'family'];
</script>

{#snippet field(key: string, text: string, o: { area?: boolean; inputmode?: 'numeric' | 'url'; hint?: string; v?: string; lang?: string } = {})}
	<div class="field pill" class:invalid={err(key)}>
		<label for="{uid}-{key}">{text}</label>
		{#if o.area}
			<textarea id="{uid}-{key}" rows="3" lang={o.lang} aria-invalid={err(key) ? 'true' : undefined} aria-describedby={err(key) ? `${uid}-${key}-e` : o.hint ? `${uid}-${key}-h` : undefined}>{o.v ?? val(key)}</textarea>
		{:else}
			<div class="control"><input id="{uid}-{key}" type="text" inputmode={o.inputmode} lang={o.lang} value={o.v ?? val(key)} aria-invalid={err(key) ? 'true' : undefined} aria-describedby={err(key) ? `${uid}-${key}-e` : undefined} /></div>
		{/if}
		{#if o.hint}<p class="hint" id="{uid}-{key}-h">{o.hint}</p>{/if}
		{#if err(key)}<p class="error" id="{uid}-{key}-e" role="alert"><Icon name="alert" size={14} />{err(key)}</p>{/if}
	</div>
{/snippet}

{#snippet select(key: string, text: string, opts: string[], value: string, hint?: string)}
	<div class="field pill select">
		<label for="{uid}-{key}">{text}</label>
		<div class="control">
			<select id="{uid}-{key}">{#each opts as o (o)}<option selected={o === value}>{o}</option>{/each}</select>
			<Glyph name="chevron-down" size={16} />
		</div>
		{#if hint}<p class="hint">{hint}</p>{/if}
	</div>
{/snippet}

<section class="card form" data-surface="solid" aria-label={label ?? kind}>
	{#if notice}
		<p class="notice" role="alert"><Icon name="alert" size={16} /><span>Already in your archive. <a href={href('entry', worst)}>Open Kintsugi Summer</a></span></p>
	{/if}
	<div class="grid" data-compact={compact || undefined}>
		<ImageField {image} {preview} />
		<div class="fields">
			<div class="field pill" class:invalid={err('title')}>
				<label for="{uid}-title">{nameLabel}</label>
				<div class="control"><input id="{uid}-title" type="text" value={title || (mode === 'edit' ? 'Kintsugi Summer' : '')} aria-invalid={err('title') ? 'true' : undefined} aria-describedby={err('title') ? `${uid}-title-e` : undefined} /></div>
				{#if err('title')}<p class="error" id="{uid}-title-e" role="alert"><Icon name="alert" size={14} />{err('title')}</p>{/if}
			</div>

			{#if kind === 'album' || kind === 'song'}
				{#if artistLinked}
					<div class="field pill">
						<span class="lbl">Artist</span>
						<div class="linked"><a class="chip link" href={href('entry', worst, 'k=artist')}>Juno Ashby<span class="sr-only">, linked artist</span></a><button type="button" class="btn quiet s" data-press>Unlink artist</button></div>
					</div>
				{:else if artistOpen}
					<div class="field pill combo-field">
						<label for="{uid}-artist">Artist</label>
						<div class="control"><input id="{uid}-artist" type="text" role="combobox" aria-expanded="true" aria-controls="{uid}-artist-l" aria-autocomplete="list" aria-activedescendant="{uid}-artist-o0" value="Ju" autocomplete="off" /></div>
						<ul class="options" id="{uid}-artist-l" role="listbox" aria-label="Artists">
							{#each ARTISTS as a, i (a)}<li id="{uid}-artist-o{i}" role="option" aria-selected={i === 0}>{a}</li>{/each}
						</ul>
					</div>
				{:else}{@render field('artist', 'Artist', { v: mode === 'edit' ? 'Juno Ashby' : '' })}{/if}
			{/if}
			{#if kind === 'song'}{@render field('album', 'Album')}{/if}
			{#if kind === 'anime' || kind === 'manga'}{@render field('alt', 'Alternative title', { lang: mode === 'edit' ? 'ja' : undefined })}{/if}
			{#if kind === 'book'}{@render field('authors', 'Authors', { area: true, hint: 'One per line, in the original script.' })}{/if}
			{#if kind === 'brand'}
				{@render select('kind', 'Kind', ['Brand', 'Shop', 'Site'], 'Brand')}
				{@render field('url', 'URL', { inputmode: 'url' })}
				{@render field('description', 'Description', { area: true })}
			{/if}
			{#if kind === 'piece'}
				{@render field('brandName', 'Brand')}
				{@render field('url', 'URL', { inputmode: 'url' })}
				{@render field('price', 'Price')}
			{/if}
			{#if kind === 'look'}{@render field('source', 'Source URL', { inputmode: 'url' })}{/if}

			{#if ['album', 'song', 'anime', 'manga', 'book'].includes(kind)}
				<div class="two">
					{@render field('year', 'Year', { inputmode: 'numeric' })}
					{#if kind === 'album'}
						{@render select('type', 'Type', ['Album', 'EP'], 'Album')}
						{@render field('tracks', 'Tracks', { inputmode: 'numeric' })}
					{/if}
					{#if kind === 'anime'}{@render field('episodes', 'Episodes total', { inputmode: 'numeric' })}{/if}
					{#if kind === 'manga'}
						{@render field('chapters', 'Chapters total', { inputmode: 'numeric' })}
						{@render field('volumes', 'Volumes total', { inputmode: 'numeric' })}
					{/if}
				</div>
			{/if}
			{#if kind === 'influencer' || kind === 'magazine'}
				<div class="two">
					{@render field('instagram', 'Instagram')}
					{@render field('tiktok', 'TikTok')}
					{@render field('youtube', 'YouTube')}
					{@render field('website', 'Website', { inputmode: 'url' })}
				</div>
			{/if}
			{#if hasStatus}
				{@render select('status', 'Status', options, statusValue, kind === 'piece' && status === 'Owned' && mode === 'add' ? 'Preselected Owned because Add was opened from Wardrobe.' : undefined)}
			{/if}

			<div class="field pill">
				<label for="{uid}-tag">Tags</label>
				<div class="control"><input id="{uid}-tag" type="text" placeholder="Add a tag" value={tagSuggest ? 'fa' : ''} autocomplete="off" /></div>
				{#if tagSuggest}
					<div class="suggest" role="group" aria-label="Tag suggestions">
						{#each SUGGEST as t (t)}<button type="button" class="chip add" data-press><Icon name="plus" size={14} /><span>{t}</span></button>{/each}
					</div>
				{/if}
				{#if tags.length}
					<ul class="tags" aria-label="Selected tags">
						{#each tags as t, i (t + i)}
							<li class="chip"><span title={t}>{t}</span><button type="button" class="x" aria-label="Remove tag {t}"><Icon name="close" size={14} /></button></li>
						{/each}
					</ul>
				{/if}
			</div>

			<div class="field pill">
				<label for="{uid}-note">Note</label>
				<textarea id="{uid}-note" rows="3">{mode === 'edit' ? 'Found it through a friend; keep for a quiet evening.' : ''}</textarea>
			</div>
		</div>
	</div>
	{#if !compact}<FormFoot {saving} {cancelHref} />{/if}
</section>

<style>
	.form { display: grid; gap: var(--space-5); padding: var(--space-5); }
	.grid { display: grid; gap: var(--space-5); min-inline-size: 0; }
	.fields { display: grid; gap: var(--space-4); min-inline-size: 0; align-content: start; }
	.two { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr)); gap: var(--space-4); }
	@media (min-width: 768px) {
		.grid { grid-template-columns: minmax(10rem, 14rem) minmax(0, 1fr); gap: var(--space-7); }
		.form { padding: var(--space-6); }
	}
	@media (max-width: 767px) { .form { padding: var(--space-4); } }
	.lbl { font-size: var(--type-label-size); line-height: var(--type-label-line); font-weight: var(--type-label-weight); }
	textarea {
		inline-size: 100%;
		min-block-size: 5.5rem;
		padding: var(--space-3) var(--space-4);
		border: 0;
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink);
		font: inherit;
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
		resize: vertical;
	}
	textarea:focus-visible { outline: var(--focus-width) solid var(--focus-ring); outline-offset: var(--focus-offset); }
	.field.invalid textarea { box-shadow: var(--ring-danger); }
	.field.select select:focus-visible { outline: var(--focus-width) solid var(--focus-ring); outline-offset: var(--focus-offset); }
	.combo-field { position: relative; }
	.options { position: absolute; inset-inline: 0; inset-block-start: calc(100% - var(--space-2)); z-index: var(--z-menu); display: grid; gap: var(--space-0-5); margin: 0; padding: var(--space-1-5); list-style: none; border-radius: var(--radius-panel); background: var(--surface-raised); box-shadow: var(--elevation-menu); }
	.options li { display: flex; align-items: center; min-block-size: max(var(--control-height-s), var(--target)); padding-inline: var(--space-3); border-radius: var(--radius-item); font-size: var(--type-body-s-size); overflow-wrap: anywhere; }
	.options li[aria-selected="true"] { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.suggest { display: flex; flex-wrap: wrap; gap: var(--space-1-5); }
	.chip.add { border: 0; padding-inline: var(--space-3) var(--space-3-5); cursor: default; }
	.linked { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); }
	.tags { display: flex; flex-wrap: wrap; gap: var(--space-1-5); margin: 0; padding: 0; list-style: none; }
	.chip { display: inline-flex; align-items: center; gap: var(--space-1); max-inline-size: 100%; min-block-size: var(--control-height-xs); padding-inline: var(--space-3) var(--space-1); border-radius: var(--radius-pill); background: var(--surface-sunken); box-shadow: var(--ring-hairline); font-size: var(--type-caption-size); color: var(--ink); text-decoration: none; }
	.chip > span { min-inline-size: 0; max-inline-size: 22ch; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.chip.link { padding-inline: var(--space-3-5); font-weight: var(--weight-medium); }
	.x { display: grid; place-items: center; flex: none; inline-size: max(24px, var(--target)); block-size: max(24px, var(--target)); border: 0; border-radius: var(--radius-round); background: none; color: var(--ink); }
	.notice { display: flex; align-items: flex-start; gap: var(--space-2); padding: var(--space-3) var(--space-4); border-radius: var(--radius-panel); background: var(--danger-soft); box-shadow: var(--ring-danger); color: var(--danger); font-size: var(--type-body-s-size); font-weight: var(--weight-semibold); }
	.notice a { color: inherit; text-underline-offset: 0.2em; }
	.notice > :global(svg) { flex: none; margin-block-start: var(--space-0-5); }
	@media (hover: hover) { .x:hover { background: var(--surface-tint); } }
</style>
