<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData, type Kind, type MockEntry } from '../../fixtures.ts';
	import Btn from '../overlays/Btn.svelte';
	import Dialog from '../overlays/Dialog.svelte';
	import Icon from '../overlays/Icon.svelte';
	import Toast from '../overlays/Toast.svelte';

	type Props = {
		mode?: 'view' | 'select' | 'rename' | 'empty';
		// Select mode: which rows are picked
		pick?: 'none' | 'range' | 'all';
		// the drag affordance drawn mid-gesture (desktop only)
		drag?: boolean;
		// one more entry than the page loaded with, as after a reload on a 409
		extra?: boolean;
		toast?: string;
		chooser?: boolean;
		note?: string;
	};
	let { mode = 'view', pick = 'range', drag = false, extra = false, toast, chooser = false, note }: Props = $props();

	const kindLabel: Record<Kind, string> = {
		album: 'Album',
		artist: 'Artist',
		song: 'Song',
		anime: 'Anime',
		manga: 'Manga',
		book: 'Book',
		magazine: 'Magazine',
		brand: 'Brand or shop',
		site: 'Brand or shop',
		influencer: 'Influencer',
		piece: 'Piece',
		look: 'Look'
	};

	const data = $derived(mockData(new URL(page.url.href)));
	const worst = $derived(data.worst);
	const c = $derived(data.collection);
	const entries: MockEntry[] = $derived.by(() => {
		if (mode === 'empty') return [];
		const added = extra ? [data.list.find((e) => !c.entries.some((x) => x.id === e.id)) ?? data.list[data.list.length - 1]] : [];
		return [...c.entries, ...added];
	});
	const selecting = $derived(mode === 'select');
	const picked = $derived.by(() => {
		if (!selecting) return new Set<number>();
		if (pick === 'all') return new Set(entries.map((e) => e.id));
		if (pick === 'none') return new Set<number>();
		return new Set(entries.slice(1, 4).map((e) => e.id));
	});
	const q = $derived(worst ? '?data=worst' : '');
	const digits = $derived(Math.max(2, String(entries.length).length));
	const pos = (i: number) => String(i + 1).padStart(digits, '0');
	const plural = (n: number, one: string, many: string) => `${n.toLocaleString('en')} ${n === 1 ? one : many}`;
	const types = $derived(new Set(entries.map((e) => kindLabel[e.kind])).size);
	const targets = $derived(entries.filter((e) => !picked.has(e.id)));
	const draftName = $derived(c.name);
</script>

<Frame world="home" section="collections" plus="shown">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker">
				<li><a href="/__mockups/redesign/wire/collections{q}">Collections</a></li>
				<li>{plural(entries.length, 'entry', 'entries')}</li>
				{#if selecting}<li>Select</li>{/if}
			</ul>
			<h1 data-long={c.name.length > 60 ? '' : undefined}>{c.name}</h1>
			{#if c.description}<p class="lede">{c.description}</p>{/if}
			{#if !selecting && mode !== 'rename'}
				<div class="actions" role="group" aria-label="Collection actions">
					{#if entries.length}<Btn variant="primary" icon="select">Select</Btn>{/if}
					<Btn>Rename</Btn>
					<Btn variant="danger" icon="trash">Delete collection</Btn>
				</div>
			{/if}
		</div>
		{#if entries.length}
			<ul class="screen-facts" data-surface="inverse" aria-label="This collection at a glance">
				<li><span class="n">{entries.length.toLocaleString('en')}</span>{entries.length === 1 ? 'Entry' : 'Entries'}</li>
				<li><span class="n">{types.toLocaleString('en')}</span>{types === 1 ? 'Type' : 'Types'}</li>
			</ul>
		{/if}
	</div>

	<div class="screen-body" data-settle>
		{#if note}<p class="annot" role="note"><span class="type-overline">Wireframe note</span>{note}</p>{/if}

		{#if mode === 'rename'}
			<form class="card form" data-surface="solid" aria-labelledby="rn-h" onsubmit={(e) => e.preventDefault()}>
				<div class="card-head"><h2 id="rn-h">Rename</h2><span class="card-note">Name and description, prefilled</span></div>
				<div class="field">
					<label for="r-name">Name</label>
					<input id="r-name" type="text" value={draftName} />
				</div>
				<div class="field">
					<label for="r-desc">Description <span class="opt">optional</span></label>
					<textarea id="r-desc" rows="3">{c.description ?? ''}</textarea>
				</div>
				<div class="row-actions">
					<Btn>Cancel</Btn>
					<Btn variant="primary" arrow>Save</Btn>
				</div>
			</form>
		{/if}

		{#if selecting}
			<div class="selbar" role="toolbar" aria-label="Selection">
				<div class="count">
					<p class="n" aria-live="polite">{picked.size.toLocaleString('en')} selected</p>
					<p class="hint">{picked.size === 0 ? 'Pick entries to move or remove them.' : 'Shift-click selects a range.'}</p>
				</div>
				<div class="bar-actions">
					<Btn disabled={picked.size === 0}>Move to top</Btn>
					<Btn disabled={picked.size === 0}>Move to bottom</Btn>
					<Btn disabled={picked.size === 0 || targets.length === 0}>Move before…</Btn>
					<Btn variant="danger" icon="trash" disabled={picked.size === 0}>Remove from collection</Btn>
					<Btn variant="primary">Done</Btn>
				</div>
			</div>
		{/if}

		{#if entries.length}
			<section class="card entries" data-surface="solid" aria-labelledby="e-h">
				<div class="card-head">
					<h2 id="e-h">In order</h2>
					<span class="card-note">{selecting ? 'Tap or click an entry to pick it' : 'Drag by the handle · or use Move up and Move down'}</span>
				</div>
				<ol class="rows">
					{#if drag && !selecting}<li class="drop" aria-hidden="true"><span>Drop here</span></li>{/if}
					{#each entries as e, i (e.id)}
						{@const on = picked.has(e.id)}
						<li class="row" class:on class:dragging={drag && !selecting && i === 2}>
							{#if selecting}
								<button type="button" class="pick" aria-pressed={on} aria-label="{pos(i)} {e.title}">
									<span class="check" class:filled={on} aria-hidden="true">{#if on}<Icon name="check" size={16} />{/if}</span>
									<span class="pos">{pos(i)}</span>
									<span class="thumb" class:plate={!e.cover} aria-hidden="true">{e.cover ? '' : e.title.slice(0, 1)}</span>
									<span class="text">
										<span class="title">{e.title}</span>
										<span class="meta">{kindLabel[e.kind]}{e.by ? ` · ${e.by}` : ''}</span>
									</span>
								</button>
							{:else}
								<span class="grip" aria-hidden="true"><Icon name="grip" size={20} /></span>
								<span class="pos">{pos(i)}</span>
								<span class="thumb" class:plate={!e.cover} role={e.cover ? undefined : 'img'} aria-label={e.cover ? undefined : 'No photo yet'}>{e.cover ? '' : e.title.slice(0, 1)}</span>
								<span class="text">
									<a class="title" href="/__mockups/redesign/wire/collection{q}">{e.title}</a>
									<span class="meta">{kindLabel[e.kind]}{e.by ? ` · ${e.by}` : ''}</span>
								</span>
								<span class="moves">
									{#if i > 0}<Btn variant="quiet" icon="up" label="Move {e.title} up" />{:else}<span class="gap" aria-hidden="true"></span>{/if}
									{#if i < entries.length - 1}<Btn variant="quiet" icon="down" label="Move {e.title} down" />{:else}<span class="gap" aria-hidden="true"></span>{/if}
									<Btn variant="quiet" icon="trash" label="Remove {e.title}" />
								</span>
							{/if}
						</li>
					{/each}
				</ol>
			</section>
		{:else}
			<section class="card empty" data-surface="solid" aria-labelledby="em-h">
				<h2 id="em-h">Nothing in here yet</h2>
				<p>Use “Add to collection” on any entry's page.</p>
			</section>
		{/if}
	</div>

	{#if toast}
		<div class="toast-region" role="status"><Toast message={toast} /></div>
	{/if}

	{#if chooser}
		<div class="scrim">
			<Dialog title="Move {plural(picked.size, 'entry', 'entries')} before…" text="Pick the entry they go in front of. They keep their order among themselves." wide>
				<ul class="choose" role="listbox" aria-label="Target entry">
					{#each targets as e (e.id)}
						<li class="target" role="option" aria-selected="false">
							<span class="pos">{pos(entries.indexOf(e))}</span>
							<span class="name">{e.title}</span>
						</li>
					{/each}
				</ul>
				{#snippet actions()}<Btn focused>Cancel</Btn>{/snippet}
			</Dialog>
		</div>
	{/if}
</Frame>

<style>
	h1[data-long] {
		font-size: var(--type-display-l-size);
		line-height: var(--type-display-l-line);
	}
	.lede {
		overflow-wrap: anywhere;
	}
	.actions,
	.row-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		max-inline-size: 100%;
	}
	.row-actions {
		justify-content: flex-end;
	}
	.annot {
		display: grid;
		gap: var(--space-0-5);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
		box-shadow: var(--ring-hairline);
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
	}
	.annot .type-overline {
		color: var(--ink-muted);
	}
	.form {
		display: grid;
		gap: var(--space-4);
		padding: var(--space-6);
		max-inline-size: 40rem;
	}
	.field {
		display: grid;
		gap: var(--space-1-5);
		min-inline-size: 0;
	}
	label {
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
	}
	.opt {
		color: var(--ink-muted);
	}
	input,
	textarea {
		inline-size: 100%;
		min-inline-size: 0;
		padding-inline: var(--space-5);
		border: 0;
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink);
		font: inherit;
	}
	input {
		block-size: max(var(--control-height), var(--target));
		border-radius: var(--radius-control);
		text-overflow: ellipsis;
	}
	textarea {
		padding-block: var(--space-3);
		border-radius: var(--radius-panel);
		resize: none;
		overflow-y: auto;
	}
	.selbar {
		position: sticky;
		inset-block-start: var(--space-3);
		z-index: var(--z-rail);
		display: grid;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-card);
		background: var(--surface-glass-strong);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--elevation-glass);
	}
	.count {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-1) var(--space-3);
	}
	.count .n {
		font-family: var(--font-display);
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		font-variant-numeric: var(--numeric-figures);
	}
	.count .hint {
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
	}
	.bar-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.entries {
		display: grid;
		gap: var(--space-4);
		padding: var(--space-5);
		min-inline-size: 0;
	}
	.rows {
		display: grid;
		gap: var(--space-1);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.row {
		position: relative;
		display: grid;
		grid-template-columns: auto auto minmax(0, 1fr) auto;
		grid-template-areas: 'grip pos text moves';
		align-items: center;
		gap: var(--space-3);
		min-block-size: var(--target-touch);
		padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
		min-inline-size: 0;
	}
	.row.on {
		background: var(--surface-tint-strong);
	}
	.row > .grip {
		grid-area: grip;
		display: grid;
		place-items: center;
		color: var(--ink-secondary);
		cursor: grab;
	}
	.row > .pos {
		grid-area: pos;
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		font-variant-numeric: var(--numeric-figures);
	}
	.thumb {
		display: none;
	}
	.row > .text {
		grid-area: text;
		display: grid;
		gap: var(--space-0-5);
		min-inline-size: 0;
	}
	.title {
		color: var(--ink);
		font-size: var(--type-title-size);
		line-height: var(--type-title-line);
		font-weight: var(--type-title-weight);
		text-decoration: none;
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}
	.meta {
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.row > .moves {
		grid-area: moves;
		display: flex;
		align-items: center;
	}
	.gap {
		display: block;
		inline-size: var(--target-touch);
		flex: none;
	}
	.pick {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: auto auto auto minmax(0, 1fr);
		align-items: center;
		gap: var(--space-3);
		min-block-size: var(--target-touch);
		margin: calc(-1 * var(--space-2)) calc(-1 * var(--space-2)) calc(-1 * var(--space-2)) calc(-1 * var(--space-3));
		padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
		border: 0;
		border-radius: var(--radius-panel);
		background: transparent;
		color: var(--ink);
		text-align: start;
		min-inline-size: 0;
	}
	.check {
		display: grid;
		place-items: center;
		inline-size: var(--space-6);
		block-size: var(--space-6);
		border-radius: var(--radius-round);
		box-shadow: var(--ring-control);
		background: var(--surface-raised);
	}
	.check.filled {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
		box-shadow: none;
	}
	.drop {
		display: none;
	}
	.empty {
		display: grid;
		justify-items: start;
		gap: var(--space-2);
		padding: var(--space-8) var(--space-6);
		max-inline-size: 40rem;
	}
	.empty h2 {
		font-size: var(--type-display-m-size);
		line-height: var(--type-display-m-line);
	}
	.empty p {
		color: var(--ink-secondary);
	}
	.toast-region {
		position: fixed;
		inset-inline: var(--space-3);
		inset-block-end: calc(var(--toast-clearance) + var(--space-3));
		z-index: var(--z-toast);
		display: grid;
		justify-items: center;
		pointer-events: none;
	}
	.toast-region :global(.toast) {
		inline-size: min(100%, 28rem);
	}
	.scrim {
		position: fixed;
		inset: 0;
		z-index: var(--z-sheet);
		display: grid;
		place-items: center;
		padding: var(--space-4);
		background: var(--scrim-soft);
	}
	.choose {
		display: grid;
		gap: var(--space-0-5);
		max-block-size: 18rem;
		overflow-y: auto;
		margin: 0;
		padding: var(--space-1);
		list-style: none;
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
	}
	.target {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		gap: var(--space-3);
		min-block-size: var(--target-touch);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-item);
	}
	.name {
		min-inline-size: 0;
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
	}
	@media (min-width: 768px) {
		.row.dragging {
			z-index: var(--z-raised);
			translate: var(--space-3) 0;
			background: var(--surface-raised);
			box-shadow: var(--shadow-lift);
		}
		.thumb {
			display: grid;
			place-items: center;
			flex: none;
			inline-size: var(--space-10);
			block-size: var(--space-10);
			border-radius: var(--radius-round);
			background: var(--surface-tint-strong);
			color: var(--ink);
			font-family: var(--font-display);
		}
		.row > .thumb {
			grid-area: thumb;
		}
		.thumb.plate {
			background: var(--surface-plate-2);
		}
		.row {
			grid-template-columns: auto auto auto minmax(0, 1fr) auto;
			grid-template-areas: 'grip pos thumb text moves';
		}
		.pick {
			grid-template-columns: auto auto auto minmax(0, 1fr);
		}
		.selbar {
			grid-template-columns: auto minmax(0, 1fr);
			align-items: center;
		}
		.bar-actions {
			justify-content: flex-end;
		}
		.drop {
			display: grid;
			align-items: center;
			block-size: var(--space-3);
			margin-block: calc(-1 * var(--space-1));
		}
		.drop span {
			display: block;
			block-size: var(--stroke-strong);
			border-radius: var(--radius-pill);
			background: var(--surface-inverse);
			font-size: 0;
		}
	}
	@media (max-width: 767px) {
		.grip {
			display: none;
		}
		.row {
			grid-template-columns: auto minmax(0, 1fr);
			grid-template-areas:
				'pos text'
				'moves moves';
			align-items: start;
		}
		.moves {
			justify-content: flex-end;
		}
		.pick {
			grid-template-columns: auto auto minmax(0, 1fr);
		}
		.pick .thumb {
			display: none;
		}
		.scrim {
			place-items: end center;
			padding: 0;
		}
		.form,
		.empty {
			padding: var(--space-5) var(--space-4);
		}
		.entries {
			padding: var(--space-4) var(--space-3);
		}
	}
</style>
