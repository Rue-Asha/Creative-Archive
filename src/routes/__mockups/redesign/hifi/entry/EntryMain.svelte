<script lang="ts">
	import type { MockEntryFull } from '../../fixtures.ts';
	import Cover from '../shell/Cover.svelte';
	import Icon from '../shell/Icon.svelte';
	import { DOMAIN_LABEL, href, langOf, ratingText } from '../shell/data.ts';
	import StatusMark from '../list/StatusMark.svelte';
	import Glyph from '../list/Glyph.svelte';
	import { nested } from '../list/data.ts';
	import MenuButton from './MenuButton.svelte';
	import ProgressControl from './ProgressControl.svelte';
	import RatingCard from './RatingCard.svelte';
	import { INFO, TAGS_SHOWN, tagsToggle, type EntryKey } from './data.ts';

	type Props = {
		kind: EntryKey;
		entry: MockEntryFull;
		worst?: boolean;
		rating?: { value: string | null; invalid?: boolean; confirmed?: boolean; held?: boolean };
		current?: number;
		total?: number | null;
		progressMode?: 'view' | 'edit';
		typed?: string;
		done?: boolean;
		statusOpen?: boolean;
		status?: string | null;
	};
	let { kind, entry, worst = false, rating, current = 7, total = 24, progressMode = 'view', typed = '', done = false, statusOpen = false, status }: Props = $props();

	const info = $derived(INFO[kind]);
	const media = $derived(['album', 'anime', 'book', 'artist'].includes(kind));
	const hasStatus = $derived(media || kind === 'piece');
	const set = $derived(kind === 'piece' ? info.statusSet : info.statusSet);
	const order = $derived(kind === 'piece' ? ['wishlist', 'owned', 'gone'] : ['want', 'doing', 'done', 'dropped']);
	const at = $derived(order.indexOf(entry.status as string));
	const current_ = $derived(done && kind === 'anime' ? { label: set[2], state: 'done' as const } : status !== undefined ? (status ? { label: status, state: (order[set.indexOf(status)] ?? 'want') as 'want' } : null) : at >= 0 ? { label: set[at], state: order[at] as 'want' } : null);
	const options = $derived(kind === 'piece' ? set : ['No status', ...set]);
	const rate = $derived(rating ?? { value: entry.rating === null ? null : String(Number(entry.rating.toFixed(2))) });
	const atTotal = $derived(total !== null && current >= total && !done);
	const markLabel = $derived(kind === 'anime' ? 'Mark as watched' : 'Mark as read');
	const pos = $derived(ratingText(entry.rating));
	let tagsOpen = $state(false);
	const tagList = $derived(tagsOpen ? entry.tags : entry.tags.slice(0, TAGS_SHOWN));
</script>

<div class="entry-wrap">
	<div class="entry-body">
		<section class="card entry-card" data-surface="solid" aria-label={info.label}>
			<figure class="cover-box"><Cover title={entry.title} src={entry.cover} year={entry.year} ratio={info.ratio} large /></figure>
			<div class="main">
				<p class="type-label">{DOMAIN_LABEL[info.domain]}<span class="sep" aria-hidden="true">·</span><span class="sr-only">, </span>{info.label}</p>
				{#if info.facts.length}
					<dl class="facts">
						{#each info.facts as [k, v] (k)}<div><dt>{k}</dt><dd lang={langOf(v)}>{v}</dd></div>{/each}
					</dl>
				{/if}
				{#if hasStatus}
					<div class="controls">
						<MenuButton label="Status: {current_?.label ?? 'No status'}" menuLabel="Status" shown={statusOpen} wide>
							{#each options as s (s)}
								<button type="button" class="menu-item" role="menuitemradio" aria-checked={s === (current_?.label ?? 'No status')}><Icon name="check" size={16} />{s}</button>
							{/each}
						</MenuButton>
						{#if current_}<span class="mark"><StatusMark label={current_.label} state={current_.state} /></span>{/if}
					</div>
				{/if}
				{#if entry.tags.length}
					<div class="tag-block">
						<ul class="tags" id="tags-{kind}" aria-label="Tags">{#each tagList as tag, i (tag + i)}<li class="chip"><span class="t" title={tag}>{tag}</span></li>{/each}</ul>
						{#if entry.tags.length > TAGS_SHOWN}
							<button type="button" class="btn quiet s more" aria-expanded={tagsOpen} aria-controls="tags-{kind}" onclick={() => (tagsOpen = !tagsOpen)}>{tagsToggle(tagsOpen, entry.tags.length)}</button>
						{/if}
					</div>
				{/if}
				{#if entry.notes}<p class="note">{entry.notes}</p>{/if}
				{#if entry.sourceUrl}<a class="chip link" href={entry.sourceUrl} target="_blank" rel="noreferrer"><Glyph name="link" size={14} /><span>{entry.sourceUrl.replace(/^https?:\/\//, '')}</span></a>{/if}
			</div>
		</section>

		<div class="side">
			{#if media}<RatingCard value={rate.value} invalid={rate.invalid} confirmed={rate.confirmed} held={rate.held} />{/if}
			{#if info.progress.length}
				<section class="card pad" data-surface="solid" aria-label="Progress">
					{#each info.progress as p (p.label)}<ProgressControl label={p.label} {current} {total} mode={progressMode} {typed} />{/each}
					{#if atTotal}<div><button type="button" class="btn secondary s" data-press><Icon name="check" size={16} />{markLabel}</button></div>{/if}
				</section>
			{/if}
			<section class="card pad" data-surface="solid" aria-labelledby="coll-h-{kind}">
				<h2 class="ruled" id="coll-h-{kind}">In collections</h2>
				{#if entry.collections.length}
					<ul class="tags">{#each entry.collections as c, i (c + i)}<li><a class="chip link" href={href('collection', worst)}><span class="t" title={c}>{c}</span></a></li>{/each}</ul>
				{:else}
					<p class="hint">Not in any collection yet.</p>
				{/if}
			</section>
		</div>

		{#if kind === 'artist'}
			<section class="card pad works" data-surface="solid" aria-labelledby="works-h">
				<div class="card-head"><h2 id="works-h">Works</h2><span class="card-note">{entry.works.length === 1 ? '1 work' : `${entry.works.length} works`}</span></div>
				{#if entry.works.length}
					<ul class="work-list">
						{#each entry.works as w (w.id)}
							<li>
								<a class="row interactive" href={href('entry', worst)}>
									<span class="main">
										<span class="leading"><Cover title={w.title} src={w.cover} ratio="1 / 1" /></span>
										<span class="text"><span class="title" lang={langOf(w.title)}>{w.title}</span><span class="meta">{w.kind === 'album' ? 'Album' : 'Song'} · {w.year}</span></span>
										{#if w.rating !== null}<span class="value figures">{Number(w.rating.toFixed(2))} / 10</span>{/if}
									</span>
								</a>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="hint">No works yet. Albums and songs linked to this artist appear here.</p>
				{/if}
			</section>
		{/if}
	</div>
</div>

<style>
	.entry-wrap { container-type: inline-size; min-inline-size: 0; }
	.entry-body { display: grid; gap: var(--space-4); align-items: start; min-inline-size: 0; }
	.entry-body > * { min-inline-size: 0; }
	.side { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-4); }
	.pad { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-3); padding: var(--space-5); }
	@container (min-width: 60rem) {
		.entry-body { grid-template-columns: minmax(0, 1fr) 19rem; }
		.entry-card { grid-column: 1; grid-row: 1; }
		.side { grid-column: 2; grid-row: 1 / span 2; }
		.works { grid-column: 1; grid-row: 2; }
	}
	.entry-card { display: grid; grid-template-columns: minmax(9rem, 14.75rem) minmax(0, 1fr); gap: var(--space-6); padding: var(--space-3-5); }
	.cover-box { min-inline-size: 0; }
	.cover-box :global(.cover.large .mono), .cover-box :global(.mono) { font-size: var(--type-figure-size); }
	.main { display: grid; align-content: start; gap: var(--space-5); min-inline-size: 0; padding: var(--space-2-5) var(--space-2) var(--space-2) 0; }
	.type-label { justify-self: start; display: inline-flex; align-items: center; min-block-size: 28px; padding: 0 var(--space-3); border-radius: var(--radius-pill); background: var(--surface-tint); font-size: var(--type-overline-size); line-height: 1; letter-spacing: var(--type-overline-tracking); font-weight: var(--type-overline-weight); text-transform: uppercase; }
	.type-label .sep { margin-inline: 0.6em; }
	.facts { display: flex; flex-wrap: wrap; gap: var(--space-3) var(--space-8); }
	.facts > div { display: grid; gap: var(--space-0-5); min-inline-size: 0; padding-inline-start: var(--space-3); box-shadow: var(--rule-start); }
	.facts dt { font-size: var(--type-overline-size); line-height: var(--type-overline-line); letter-spacing: var(--type-overline-tracking); font-weight: var(--type-overline-weight); text-transform: uppercase; color: var(--ink-secondary); }
	.facts dd { font-size: var(--type-body-size); line-height: var(--type-body-s-line); font-variant-numeric: var(--numeric-figures); overflow-wrap: anywhere; }
	.controls { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3); min-inline-size: 0; }
	.mark { font-size: var(--type-caption-size); }
	.tag-block { display: grid; justify-items: start; gap: var(--space-2); min-inline-size: 0; }
	.tags { display: flex; flex-wrap: wrap; gap: var(--space-1-5); margin: 0; padding: 0; list-style: none; }
	.tags > li:not(.chip) { display: flex; min-inline-size: 0; max-inline-size: 100%; }
	.chip { display: inline-flex; align-items: center; gap: var(--space-1-5); max-inline-size: 100%; min-block-size: max(var(--control-height-xs), var(--target-min)); padding-inline: var(--space-3-5); border-radius: var(--radius-pill); background: var(--surface-sunken); box-shadow: var(--ring-hairline); font-size: var(--type-caption-size); color: var(--ink); text-decoration: none; overflow-wrap: anywhere; }
	.tag-block .chip .t { max-inline-size: 14ch; }
	.chip.link { font-weight: var(--weight-medium); }
	.chip .t { min-inline-size: 0; max-inline-size: 22ch; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.chip.link:has(> :global(svg)) { align-items: flex-start; padding-block: var(--space-2-5); border-radius: var(--radius-item); }
	.chip.link > :global(svg) { flex: none; margin-block-start: 0.2em; }
	.chip.link > span:not(.t) { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; overflow-wrap: anywhere; }
	.note { max-inline-size: var(--measure); font-size: var(--type-body-size); line-height: var(--type-body-line); color: var(--ink-secondary); overflow-wrap: anywhere; display: -webkit-box; -webkit-line-clamp: 12; line-clamp: 12; -webkit-box-orient: vertical; overflow: hidden; }
	.hint { font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-secondary); }
	.work-list { display: grid; gap: var(--space-2); margin: 0; padding: 0; list-style: none; }
	.row { background: var(--surface-sunken); box-shadow: none; text-decoration: none; }
	.row .leading { inline-size: 3.5rem; }
	.row .leading :global(.mono) { font-size: var(--type-display-s-size); }
	.row .leading :global(.year) { display: none; }
	.row .main { display: flex; padding: var(--space-2) var(--space-3) var(--space-2) var(--space-2); }
	.row .title { overflow-wrap: anywhere; }
	@media (hover: hover) { .row.interactive:hover { background: var(--surface-control-solid); } }
	@media (max-width: 767px) {
		.entry-card { grid-template-columns: 6.5rem minmax(0, 1fr); gap: var(--space-4); padding: var(--space-3); }
		.main { display: contents; }
		.type-label { align-self: center; }
		.cover-box :global(.mono) { font-size: var(--type-display-m-size); }
		.cover-box :global(.plate) { gap: var(--space-1-5); }
		.cover-box :global(.plate::before) { inset: var(--space-2); }
		.facts, .controls, .tag-block, .note, .chip.link { grid-column: 1 / -1; }
		.facts { gap: var(--space-3) var(--space-5); padding-inline: var(--space-1); }
		.chip.link { justify-self: start; }
		.pad { padding: var(--space-4); }
	}
</style>
