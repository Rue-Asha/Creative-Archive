<script lang="ts">
	import Icon from './Icon.svelte';
	import EntryMain from './EntryMain.svelte';
	import { base, dirOf, domainLabel, entryInfo, langOf, splitTitle, type EntryKey, type MockEntryFull } from './data.ts';

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
	let { kind, entry, rating, current, total, progressMode, typed, done }: Props = $props();

	const info = $derived(entryInfo[kind]);
	const t = $derived(splitTitle(entry.title));
	const artist = $derived(kind === 'album' ? (entry.by ?? 'Juno Ashby') : null);
</script>


<div class="screen-head">
	<div class="screen-lead">
		<nav aria-label="Breadcrumb">
			<ol class="kicker">
				<li><a href="{base}/domain">{domainLabel[info.domain]}</a></li>
				<li><a href="{base}/list">{info.list}</a></li>
			</ol>
		</nav>
		<h1 data-long={entry.title.length > 60 ? '' : undefined} lang={langOf(entry.title)} dir={dirOf(entry.title)}>{t.head}{#if t.word}<em class="accent-word">{t.word}</em>{/if}</h1>
		{#if artist}<p class="lede" lang={langOf(artist)}><a href="{base}/entry/artist">{artist}</a></p>{/if}
	</div>
	<div class="w-actions" role="group" aria-label="Entry actions">
		<a class="w-btn icon" href="{base}/list" aria-label="Back to {info.list}"><Icon name="back" size={18} /></a>
		<button type="button" class="w-btn" aria-haspopup="menu"><Icon name="plus" size={16} />Add to collection<Icon name="chevron-down" size={14} /></button>
		<button type="button" class="w-btn quiet danger"><Icon name="trash" size={16} />Delete</button>
		<a class="w-btn primary w-grow" href="{base}/edit">Edit<span class="circle" aria-hidden="true"><Icon name="arrow" size={14} /></span></a>
	</div>
</div>


<div class="screen-body" data-settle>
	<EntryMain {kind} {entry} {rating} {current} {total} {progressMode} {typed} {done} />
</div>
