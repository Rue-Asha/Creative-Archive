<script lang="ts">
	import { tick } from 'svelte';
	import { applyAction, deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import AddToCollection from '#lib/collections/AddToCollection.svelte';
	import Button from '#lib/components/button/Button.svelte';
	import Menu from '#lib/components/menu/Menu.svelte';
	import { MARK_DONE } from '#lib/copy.ts';
	import { DOMAIN_LABEL } from '#lib/domains.ts';
	import { TYPES } from '#lib/entries/config.ts';
	import { atTotal, listHref, statusLabel } from '#lib/entries/derive.ts';
	import ArtistWorks from '#lib/entries/ArtistWorks.svelte';
	import DeleteEntry from '#lib/entries/DeleteEntry.svelte';
	import DetailPanel from '#lib/entries/DetailPanel.svelte';
	import { clampProgress } from '#lib/entries/progress.ts';
	import RatingField from '#lib/entries/RatingField.svelte';
	import { glide, rise } from '#lib/motion.ts';
	import { createWriteQueue } from '#lib/shell/writeQueue.ts';
	import type { Entry, ProgressKey, Status } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import ProgressControl from '#lib/ui/ProgressControl.svelte';
	import StatusPill from '#lib/ui/StatusPill.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const entry = $derived(data.entry);
	const config = $derived(TYPES[entry.type]);

	// Controls answer at once from `local` while their writes queue up one by one; when the queue is empty the
	// reloaded entry takes over again.
	let local = $state<{ status?: Status | null; rating?: number | null; progress?: Entry['progress'] }>({});
	const enqueue = createWriteQueue(() => (local = {}));

	const status = $derived(local.status !== undefined ? local.status : entry.status);
	const rating = $derived(local.rating !== undefined ? local.rating : entry.rating);
	const progress = $derived(local.progress ?? entry.progress);
	const PROGRESS_LABELS: Record<ProgressKey, string> = { episodes: 'Episodes', chapters: 'Chapters', volumes: 'Volumes' };
	// the first key is the one that finishes the work: episodes, or chapters (not volumes)
	const finishing = $derived(config.progress[0] ? progress[config.progress[0]] : undefined);
	const statusOptions = $derived(
		(config.status === 'piece' ? ['wishlist', 'owned', 'gone'] : ['none', 'want', 'progress', 'done', 'dropped']).map((value) => ({
			value,
			label: statusLabel(entry.type, value as Status)!
		}))
	);
	const inCollections = $derived(data.collections.filter((c) => data.memberOf.includes(c.id)));

	// the last word of the title carries the accent; the whole title always stays in the heading
	const title = $derived.by(() => {
		const m = entry.title.trim().match(/^(.*?)(\S*[\p{L}\p{N}]\S*)([^\p{L}\p{N}]*)$/su);
		return m ? { head: m[1], word: m[2], rest: m[3] } : { head: entry.title, word: '', rest: '' };
	});

	function send(action: string, fields: Record<string, string>) {
		enqueue(async () => {
			const body = new FormData();
			for (const [key, value] of Object.entries(fields)) body.set(key, value);
			const res = await fetch(`?/${action}`, {
				method: 'POST',
				body,
				headers: { accept: 'application/json', 'x-sveltekit-action': 'true' }
			});
			const result = deserialize(await res.text());
			if (result.type === 'success') await invalidateAll();
			else if (result.type === 'redirect') await applyAction(result);
			else throw new Error(result.type);
		});
	}

	function moveProgress(key: ProgressKey, next: number, fields: Record<string, string>) {
		const p = progress[key]!;
		local.progress = { ...progress, [key]: { ...p, current: clampProgress(next, p.total) } };
		if (status === 'want' && next > 0) local.status = 'progress';
		send('progress', { key, ...fields });
	}

	function setRating(next: number | null) {
		local.rating = next;
		send('rating', { rating: next === null ? '' : String(next) });
	}

	function setStatus(next: string) {
		local.status = next as Status;
		send('status', { status: next });
	}

	const menuId = $props.id();
	let menuOpen = $state(false);
	let deleting = $state(false);
	let host = $state<HTMLSpanElement>();

	// the menu closes and focus goes back to the button before the dialog opens, so the dialog returns focus there
	async function askDelete() {
		menuOpen = false;
		await tick();
		host?.querySelector<HTMLElement>('.btn')?.focus();
		deleting = true;
	}
</script>

<svelte:head><title>{entry.title} · Creative Archive</title></svelte:head>

<div class="screen-head">
	<div class="bar">
		<nav class="path" aria-label="Breadcrumb">
			<ol class="kicker">
				<li><a href="/{config.domain}">{DOMAIN_LABEL[config.domain]}</a></li>
				<li><a href={listHref(entry.type)}>{config.plural}</a></li>
			</ol>
		</nav>
		<div class="detail-actions">
			<span class="host" bind:this={host}>
				<Button variant="quiet" icon label="Entry menu" popovertarget={menuId} aria-haspopup="menu" aria-expanded={menuOpen}>
					<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><circle cx="5.5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="18.5" cy="12" r="1.6" /></svg>
				</Button>
			</span>
		</div>
		<Menu id={menuId} name="Entry menu" align="end" bind:open={menuOpen}>
			<a class="menu-item" role="menuitem" href="/entries/{entry.id}/edit" tabindex="-1" onclick={() => (menuOpen = false)}>Edit</a>
			<div class="menu-rule" role="separator"></div>
			<button type="button" class="menu-item danger" role="menuitem" tabindex="-1" onclick={askDelete}>
				<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5" /></svg>Delete
			</button>
		</Menu>
	</div>
	<div class="screen-lead">
		<h1 data-long={entry.title.length > 60 ? '' : undefined}>{title.head}{#if title.word}<em class="accent-word">{title.word}</em>{/if}{title.rest}</h1>
		{#if config.artist && entry.artistName}
			<p class="lede">
				{#if entry.artistId !== null}<a class="artist" href="/entries/{entry.artistId}">{entry.artistName}</a>{:else}{entry.artistName}{/if}
			</p>
		{/if}
	</div>
</div>

<DeleteEntry bind:open={deleting} trigger={false} title={entry.title} typeLabel={config.label} />

<div class="screen-body" data-settle>
	<div class="entry-body">
		<DetailPanel {entry}>
			{#snippet controls()}
				{#if status}<StatusPill label="Status" options={statusOptions} value={status} onchange={setStatus} />{/if}
			{/snippet}
		</DetailPanel>

		<div class="side">
			{#if config.ratable}<RatingField value={rating} onchange={setRating} />{/if}
			{#if config.progress.length}
				<section class="card pad" data-surface="solid" aria-label="Progress">
					{#each config.progress as key (key)}
						{@const p = progress[key]!}
						<div class="progress">
							<span class="name">{PROGRESS_LABELS[key]}</span>
							<ProgressControl
								label={PROGRESS_LABELS[key]}
								current={p.current}
								total={p.total}
								onstep={(delta) => moveProgress(key, p.current + delta, { delta: String(delta) })}
								onset={(value) => moveProgress(key, value, { value: String(value) })}
							/>
						</div>
					{/each}
					{#if finishing && atTotal(finishing) && status !== 'done'}
						<div><Button size="s" onclick={() => setStatus('done')}><Icon name="check" size={16} />{MARK_DONE[entry.type as 'anime' | 'manga']}</Button></div>
					{/if}
				</section>
			{/if}
			<section class="card pad" data-surface="solid" aria-labelledby="collections-title">
				<h2 class="ruled" id="collections-title">In collections</h2>
				<!-- keyed by the entry: another entry's chips render afresh, so only a chip added on this page rises -->
				{#key entry.id}
					{#if inCollections.length}
						<ul class="chips">
							{#each inCollections as collection (collection.id)}
								<li in:rise animate:glide><a class="chip" href="/collections/{collection.id}"><span>{collection.name}</span></a></li>
							{/each}
						</ul>
					{:else}
						<p class="hint">Not in any collection yet.</p>
					{/if}
				{/key}
				<div><AddToCollection collections={data.collections} memberOf={data.memberOf} /></div>
			</section>
		</div>

		{#if entry.type === 'artist'}<div class="works"><ArtistWorks works={data.works} /></div>{/if}
	</div>
</div>

<style>
	.screen-head {
		gap: var(--space-5);
	}

	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		min-inline-size: 0;
	}

	.path {
		min-inline-size: 0;
	}

	/* The breadcrumb sits above the head's haze, so below the wide scrim it gets the same text scrim of its own */
	@media (max-width: 1099px) {
		.bar {
			position: relative;
		}
		.bar::before {
			content: '';
			position: absolute;
			z-index: -1;
			pointer-events: none;
			inset: calc(-1 * var(--space-3)) calc(-1 * var(--pad-inline)) calc(-1 * var(--space-5)) calc(-1 * var(--pad-inline));
			background: linear-gradient(90deg, var(--scrim-text) 0, var(--scrim-text) calc(100% - var(--haze-fade)), var(--scrim-clear));
			-webkit-mask-image: linear-gradient(180deg, transparent, var(--ink) var(--space-3), var(--ink) calc(100% - var(--space-5)), transparent);
			mask-image: linear-gradient(180deg, transparent, var(--ink) var(--space-3), var(--ink) calc(100% - var(--space-5)), transparent);
		}
	}
	@media (max-width: 767px) {
		.bar::before {
			background: var(--scrim-text);
		}
	}

	.path .kicker {
		flex-wrap: nowrap;
	}

	.path :global(.kicker a) {
		min-block-size: var(--target);
	}

	/* one line: only the last crumb gives way */
	.path :global(.kicker li) {
		flex: none;
	}

	.path :global(.kicker li:last-child) {
		flex: 0 1 auto;
		min-inline-size: 0;
	}

	.path :global(.kicker li:last-child a) {
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		display: block;
		line-height: var(--target);
	}

	.host {
		display: inline-flex;
	}

	/* the hi-fi's lead: a two- or three-word title stays on one line on the desktop */
	.screen-lead {
		max-inline-size: 46rem;
	}

	h1[data-long] {
		max-inline-size: 20em;
		font-size: var(--type-display-l-size);
		line-height: var(--type-display-l-line);
		letter-spacing: var(--type-display-l-tracking);
		overflow-wrap: anywhere;
	}

	.artist {
		display: inline-flex;
		align-items: center;
		min-block-size: var(--target);
		color: var(--ink);
		font-weight: var(--weight-medium);
		text-decoration: underline;
		text-decoration-color: var(--edge-control);
		text-underline-offset: 0.25em;
	}

	:global(.menu[role='menu'] .menu-item.danger) {
		color: var(--danger);
	}

	/* the menu keeps a leading svg hidden as its check slot; Delete's trash icon shows */
	:global(.menu[role='menu'] .menu-item.danger > svg) {
		visibility: visible;
	}

	:global(.menu[role='menu'] a.menu-item) {
		text-decoration: none;
	}

	.entry-body {
		display: grid;
		gap: var(--space-4);
		align-items: start;
		min-inline-size: 0;
	}

	.entry-body > :global(*) {
		min-inline-size: 0;
	}

	.side {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-4);
	}

	.pad {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-3);
		padding: var(--space-5);
	}

	.progress {
		display: grid;
		gap: var(--space-2);
	}

	.name {
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1-5);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		max-inline-size: 100%;
		min-block-size: max(var(--control-height-xs), var(--target-min));
		padding-inline: var(--space-3-5);
		border-radius: var(--radius-pill);
		background: var(--surface-sunken);
		box-shadow: var(--ring-hairline);
		font-size: var(--type-caption-size);
		font-weight: var(--weight-medium);
		color: var(--ink);
		text-decoration: none;
		overflow-wrap: anywhere;
	}

	.hint {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}

	@media (max-width: 767px) {
		h1[data-long] {
			font-size: var(--type-display-m-size);
			line-height: var(--type-display-m-line);
			letter-spacing: var(--type-display-m-tracking);
		}
	}

	@media (min-width: 1100px) {
		.entry-body {
			grid-template-columns: minmax(0, 1fr) 19rem;
		}

		.entry-body > :global(.entry-card) {
			grid-column: 1;
			grid-row: 1;
		}

		.side {
			grid-column: 2;
			grid-row: 1 / span 2;
		}

		.works {
			grid-column: 1;
			grid-row: 2;
		}
	}
</style>
