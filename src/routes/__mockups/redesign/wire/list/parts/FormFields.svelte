<script lang="ts">
	import FormFoot from './FormFoot.svelte';
	import Icon from './Icon.svelte';
	import ImageField from './ImageField.svelte';
	import { entryHref, statusLabels, type Kind } from './data.ts';

	type FormKind = Extract<Kind, 'album' | 'artist' | 'song' | 'anime' | 'manga' | 'book' | 'brand' | 'influencer' | 'magazine' | 'piece' | 'look'>;
	type Props = {
		kind: FormKind;
		mode?: 'add' | 'edit';
		prefix?: string;
		title?: string;
		status?: string;
		errors?: Record<string, string>;
		tags?: string[];
		image?: 'none' | 'set' | 'heic' | 'large';
		saving?: boolean;
		artistLinked?: boolean;
		preview?: boolean;
		compact?: boolean;
	};
	let { kind, mode = 'add', prefix = 'f', title = '', status, errors = {}, tags = ['favourite', 'autumn'], image = 'none', saving = false, artistLinked = false, preview = false, compact = false }: Props = $props();

	const nameLabel = $derived(['artist', 'brand', 'influencer', 'magazine', 'piece'].includes(kind) ? 'Name' : 'Title');
	const media = $derived(['album', 'artist', 'song', 'anime', 'manga', 'book'].includes(kind));
	const labels = $derived(statusLabels(kind));
	const statusOptions = $derived(media ? ['No status', ...labels] : labels);
	const statusValue = $derived(status ?? (media ? 'No status' : 'Wishlist'));
	const hasStatus = $derived(mode === 'add' ? media || kind === 'piece' : kind === 'piece');
	const handles = $derived(kind === 'influencer' || kind === 'magazine');

	const sample: Record<string, string> = { year: '2019', tracks: '11', alt: 'ハーバー・ライツ', episodes: '24', chapters: '96', volumes: '12', authors: 'Odile Brandt\nJoséphine Aubry', url: 'https://example.com/shop', price: '€ 189', brandName: 'Studio Nicholson', description: 'A calm London label for wool, linen and well-cut basics.', album: 'Blue Hour Sessions', source: 'https://example.com/look/autumn-layers' };
	const value = (key: string) => (mode === 'edit' ? (sample[key] ?? '') : '');
	const err = (key: string) => errors[key];
</script>

{#snippet field(key: string, label: string, opts: { area?: boolean; inputmode?: 'numeric' | 'url'; hint?: string; val?: string } = {})}
	<label class="w-field" data-invalid={err(key) ? '' : undefined}>
		<span class="w-label">{label}</span>
		{#if opts.area}
			<textarea class="w-input" rows="3" aria-invalid={err(key) ? 'true' : undefined} aria-describedby={err(key) ? `${prefix}-${key}-e` : undefined}>{opts.val ?? value(key)}</textarea>
		{:else}
			<input class="w-input" type="text" inputmode={opts.inputmode} value={opts.val ?? value(key)} aria-invalid={err(key) ? 'true' : undefined} aria-describedby={err(key) ? `${prefix}-${key}-e` : undefined} />
		{/if}
		{#if opts.hint}<span class="w-hint">{opts.hint}</span>{/if}
		{#if err(key)}<span class="w-error" id="{prefix}-{key}-e" role="alert"><Icon name="alert" size={14} />{err(key)}</span>{/if}
	</label>
{/snippet}

<div class="w-form-grid" data-compact={compact || undefined}>
	<ImageField {image} {preview} />

	<div class="w-fields">
		<label class="w-field" data-invalid={err('title') ? '' : undefined}>
			<span class="w-label">{nameLabel}</span>
			<input class="w-input" type="text" value={title || (mode === 'edit' ? 'Kintsugi Summer' : '')} aria-invalid={err('title') ? 'true' : undefined} aria-describedby={err('title') ? `${prefix}-title-e` : undefined} />
			{#if err('title')}<span class="w-error" id="{prefix}-title-e" role="alert"><Icon name="alert" size={14} />{err('title')}</span>{/if}
		</label>

		{#if kind === 'album' || kind === 'song'}
			{#if artistLinked}
				<div class="w-field">
					<span class="w-label">Artist</span>
					<div class="w-controls">
						<a class="w-chip link" href="/__mockups/redesign/wire/entry/artist">Juno Ashby<span class="sr-only">, linked artist</span></a>
						<button type="button" class="w-btn s quiet">Unlink artist</button>
					</div>
				</div>
			{:else}
				{@render field('artist', 'Artist', { val: mode === 'edit' ? 'Juno Ashby' : '' })}
			{/if}
		{/if}
		{#if kind === 'song'}{@render field('album', 'Album')}{/if}
		{#if kind === 'anime' || kind === 'manga'}{@render field('alt', 'Alternative title')}{/if}
		{#if kind === 'book'}{@render field('authors', 'Authors', { area: true, hint: 'One per line, in the original script.' })}{/if}
		{#if kind === 'brand'}
			<label class="w-field">
				<span class="w-label">Kind</span>
				<span class="w-selectwrap"><select class="w-input"><option selected>Brand</option><option>Shop</option><option>Site</option></select><Icon name="chevron-down" size={16} /></span>
			</label>
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
			<div class="w-fields-2">
				{@render field('year', 'Year', { inputmode: 'numeric' })}
				{#if kind === 'album'}
					<label class="w-field">
						<span class="w-label">Type</span>
						<span class="w-selectwrap"><select class="w-input"><option selected>Album</option><option>EP</option></select><Icon name="chevron-down" size={16} /></span>
					</label>
					{@render field('tracks', 'Tracks', { inputmode: 'numeric' })}
				{/if}
				{#if kind === 'anime'}{@render field('episodes', 'Episodes total', { inputmode: 'numeric' })}{/if}
				{#if kind === 'manga'}
					{@render field('chapters', 'Chapters total', { inputmode: 'numeric' })}
					{@render field('volumes', 'Volumes total', { inputmode: 'numeric' })}
				{/if}
			</div>
		{/if}

		{#if handles}
			<div class="w-fields-2">
				{@render field('instagram', 'Instagram', { val: mode === 'edit' ? '@kinfolk' : '' })}
				{@render field('tiktok', 'TikTok')}
				{@render field('youtube', 'YouTube')}
				{@render field('website', 'Website', { inputmode: 'url' })}
			</div>
		{/if}

		{#if hasStatus}
			<label class="w-field">
				<span class="w-label">Status</span>
				<span class="w-selectwrap"><select class="w-input">{#each statusOptions as o (o)}<option selected={o === statusValue}>{o}</option>{/each}</select><Icon name="chevron-down" size={16} /></span>
				{#if kind === 'piece' && status === 'Owned' && mode === 'add'}<span class="w-hint">Preselected Owned because Add was opened from Wardrobe.</span>{/if}
			</label>
		{/if}

		<div class="w-field">
			<label class="w-label" for="{prefix}-tag">Tags</label>
			<input class="w-input" id="{prefix}-tag" type="text" placeholder="Add a tag" />
			{#if tags.length}
				<ul class="w-tags" aria-label="Selected tags">
					{#each tags as t (t)}
						<li class="w-chip"><span>{t}</span><button type="button" aria-label="Remove tag {t}"><Icon name="x" size={14} /></button></li>
					{/each}
				</ul>
			{/if}
		</div>

		<label class="w-field">
			<span class="w-label">Note</span>
			<textarea class="w-input" rows="3">{mode === 'edit' ? 'Found it through a friend; keep for a quiet evening.' : ''}</textarea>
		</label>
	</div>
</div>

{#if !compact}
	<FormFoot {saving} cancelHref={mode === 'edit' ? entryHref : undefined} />
{/if}
