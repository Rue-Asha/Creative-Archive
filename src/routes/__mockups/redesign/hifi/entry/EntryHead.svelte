<script lang="ts">
	import Icon from '../shell/Icon.svelte';
	import Glyph from '../list/Glyph.svelte';
	import { DOMAIN_LABEL, headTitle, href, langOf } from '../shell/data.ts';
	import { nested } from '../list/data.ts';
	import MenuButton from './MenuButton.svelte';
	import CollectionMenu from './CollectionMenu.svelte';
	import { INFO, LISTNAME, type EntryKey } from './data.ts';

	type Props = { kind: EntryKey; title: string; artist?: string | null; worst?: boolean; collections?: string[]; collectionsOpen?: boolean };
	let { kind, title, artist = null, worst = false, collections = [], collectionsOpen = false }: Props = $props();
	const info = $derived(INFO[kind]);
	const t = $derived(headTitle(title));
	const list = $derived(nested('list', worst, `d=${info.domain}&t=${info.list}`));
</script>

<div class="screen-head">
	<div class="screen-lead">
		<nav aria-label="Breadcrumb">
			<ol class="kicker">
				<li><a href={href('domain', worst, `d=${info.domain}`)}>{DOMAIN_LABEL[info.domain]}</a></li>
				<li><a href={list}>{LISTNAME(kind)}</a></li>
			</ol>
		</nav>
		<h1 data-long={title.length > 60 ? '' : undefined} lang={langOf(title)} dir={langOf(title) === 'ar' ? 'rtl' : undefined}>{t.head}{#if t.word}<em class="accent-word">{t.word}</em>{/if}{t.rest}</h1>
		{#if artist}<p class="lede" lang={langOf(artist)}><a class="artist" href={href('entry', worst, 'k=artist')}>{artist}</a></p>{/if}
	</div>
	<div class="acts" role="group" aria-label="Entry actions">
		<a class="btn quiet icon back" href={list} aria-label="Back to {LISTNAME(kind)}" data-press="round"><Glyph name="back" size={18} /></a>
		<MenuButton label="Add to collection" menuLabel="Add to collection" shown={collectionsOpen}>
			{#snippet lead()}<Icon name="plus" size={16} />{/snippet}
			<CollectionMenu {collections} />
		</MenuButton>
		<button type="button" class="btn danger" data-press><Icon name="trash" size={16} />Delete</button>
		<a class="btn primary arrow" href={href('edit', worst)} data-press data-focus="halo">Edit<span class="circle" aria-hidden="true"><Icon name="arrow" size={18} /></span></a>
	</div>
</div>

<style>
	.artist { color: var(--ink); font-weight: var(--weight-medium); text-decoration: underline; text-decoration-color: var(--edge-control); text-underline-offset: 0.25em; }
	.screen-lead h1[data-long] { max-inline-size: 20em; font-size: var(--type-display-l-size); line-height: var(--type-display-l-line); letter-spacing: var(--type-display-l-tracking); overflow-wrap: anywhere; }
	.screen-lead { max-inline-size: 46rem; }
	.acts {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-self: start;
		gap: var(--space-2);
		margin: 0;
		padding: var(--space-1-5);
		border-radius: var(--radius-bar);
		background: var(--surface-glass-strong);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--elevation-card);
	}
	.back { flex: none; }
	.acts > :global(.btn.arrow) { margin-inline-start: var(--space-2); }
	.acts :global(.menu-button) { background: var(--surface-raised); box-shadow: var(--ring-control); }
	@media (max-width: 767px) {
		.acts { inline-size: 100%; justify-self: stretch; border-radius: var(--radius-bar-compact); display: grid; grid-template-columns: auto minmax(0, 1fr); }
		.acts > :global(.btn.arrow) { grid-column: 1 / -1; margin: 0; justify-content: space-between; }
		.acts > :global(.btn.danger) { grid-column: 1 / -1; }
	}
</style>
