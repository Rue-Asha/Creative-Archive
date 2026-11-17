<script lang="ts">
	import Cover from './Cover.svelte';
	import Icon from './Icon.svelte';
	import ProgressControl from './ProgressControl.svelte';
	import RatingCard from './RatingCard.svelte';
	import StatusMark from './StatusMark.svelte';
	import { base, domainLabel, entryInfo, fmtRating, langOf, statusLabels, statusOf, type EntryKey, type MockEntryFull, type Tone } from './data.ts';

	type Props = {
		kind: EntryKey;
		entry: MockEntryFull;
		rating?: { value: string | null; invalid?: boolean; confirmed?: boolean };
		current?: number;
		total?: number | null;
		progressMode?: 'view' | 'edit';
		typed?: string;
		done?: boolean;
	};
	let { kind, entry, rating, current = 7, total = 24, progressMode = 'view', typed = '', done = false }: Props = $props();

	const info = $derived(entryInfo[kind]);
	const media = $derived(['album', 'anime', 'book', 'artist'].includes(kind));
	const hasStatus = $derived(media || kind === 'piece');
	const tone: Tone = $derived(kind === 'book' || kind === 'anime' ? 'portrait' : kind === 'magazine' ? 'portrait' : kind === 'piece' ? 'tall' : 'square');
	const status = $derived(statusOf(entry));
	const statusText = $derived(done && kind === 'anime' ? statusLabels('anime')[2] : (status?.label ?? 'No status'));
	const ratingState = $derived(rating ?? { value: fmtRating(entry.rating) });
	const atTotal = $derived(total !== null && current >= total && !done);
	const markLabel = $derived(kind === 'anime' ? 'Mark as watched' : 'Mark as read');
</script>
	<div class="w-entry-layout">
		<section class="card w-entry" data-surface="solid" aria-label={info.label}>
			<Cover title={entry.title} cover={entry.cover} {tone} big />
			<div class="w-entry-main">
				<p class="w-type">{domainLabel[info.domain]}<span aria-hidden="true">&nbsp;·&nbsp;</span><span class="sr-only">, </span>{info.label}</p>
				{#if info.facts.length}
					<dl class="w-facts">
						{#each info.facts as [k, v] (k)}<div><dt>{k}</dt><dd lang={langOf(v)}>{v}</dd></div>{/each}
					</dl>
				{/if}
				{#if hasStatus}
					<div class="w-controls">
						<button type="button" class="w-btn" aria-haspopup="menu">Status: {statusText}<Icon name="chevron-down" size={14} /></button>
						{#if status && !done}<span class="w-meta"><StatusMark label={status.label} state={status.state} /></span>{/if}
					</div>
				{/if}
				{#if entry.tags.length}
					<ul class="w-tags" aria-label="Tags">
						{#each entry.tags as tag (tag)}<li class="w-chip link">{tag}</li>{/each}
					</ul>
				{/if}
				{#if entry.notes}<p class="w-note-text">{entry.notes}</p>{/if}
				{#if entry.sourceUrl}<a class="w-chip link" href={entry.sourceUrl}><Icon name="link" size={14} />{entry.sourceUrl.replace(/^https?:\/\//, '')}</a>{/if}
			</div>
		</section>

		<div class="w-side">
			{#if media && kind !== 'artist'}
				<RatingCard value={ratingState.value} invalid={ratingState.invalid} confirmed={ratingState.confirmed} prefix="{kind}-rating" />
			{:else if kind === 'artist'}
				<RatingCard value={ratingState.value} invalid={ratingState.invalid} confirmed={ratingState.confirmed} prefix="artist-rating" />
			{/if}
			{#if info.progress.length}
				<section class="card w-card-pad" data-surface="solid" aria-label="Progress">
					{#each info.progress as p (p.label)}
						<ProgressControl label={p.label} {current} {total} mode={progressMode} {typed} />
					{/each}
					{#if atTotal}<button type="button" class="w-btn"><Icon name="check" size={16} />{markLabel}</button>{/if}
				</section>
			{/if}
			<section class="card w-card-pad" data-surface="solid" aria-labelledby="{kind}-in-collections">
				<h2 id="{kind}-in-collections">In collections</h2>
				{#if entry.collections.length}
					<ul class="w-tags">
						{#each entry.collections as c, i (c + i)}<li><a class="w-chip link" href="{base}/collection">{c}</a></li>{/each}
					</ul>
				{:else}
					<p class="w-hint">Not in any collection yet.</p>
				{/if}
			</section>
		</div>
	</div>

	{#if kind === 'artist'}
		<section class="card w-card-pad" data-surface="solid" aria-labelledby="works-h">
			<div class="card-head"><h2 id="works-h">Works</h2><span class="card-note">{entry.works.length === 1 ? '1 work' : `${entry.works.length} works`}</span></div>
			{#if entry.works.length}
				<ul class="w-works">
					{#each entry.works as w (w.id)}
						<li>
							<a class="w-work" href="{base}/entry">
								<Cover title={w.title} cover={w.cover} tone="square" />
								<span class="w-result-text"><span class="w-result-title" lang={langOf(w.title)}>{w.title}</span><span class="w-result-by">{w.kind === 'album' ? 'Album' : 'Song'} · {w.year}</span></span>
								<span class="w-rating figures">{fmtRating(w.rating) ?? ''}{#if w.rating !== null}<span class="w-hint"> / 10</span>{/if}</span>
							</a>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="w-hint">No works yet. Albums and songs linked to this artist appear here.</p>
			{/if}
		</section>
	{/if}
