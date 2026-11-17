<script lang="ts">
	import { tick } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData, type MockEntry } from '../../fixtures.ts';
	import { TOAST, quote } from '../overlays/copy.ts';
	import Icon from '../overlays/Icon.svelte';
	import RowMenu from '../overlays/RowMenu.svelte';
	import Sheet from '../overlays/Sheet.svelte';
	import Toaster, { type ToastItem } from '../overlays/Toaster.svelte';
	import '../overlays/overlays.css';
	import { entries as entriesText, fmt, href, initials, kindLabel, headTitle, langOf, plural, real } from '../shell/data.ts';
	import { moveSelection, type Target } from './data.ts';
	import SelectionBar, { type BarAction } from '../select/SelectionBar.svelte';

	type Props = {
		mode?: 'view' | 'select' | 'rename' | 'rename-blank' | 'empty' | 'one';
		// Select mode: which rows start picked
		pick?: 'none' | 'range' | 'all';
		// one more entry than the page loaded with, as after a reload on a 409
		extra?: boolean;
		toast?: { message: string; kind?: 'error' };
		chooser?: boolean;
		confirm?: boolean;
		menu?: boolean;
	};
	let { mode = 'view', pick = 'range', extra = false, toast, chooser = false, confirm = false, menu = false }: Props = $props();

	const data = $derived(mockData(new URL(page.url.href)));
	const worst = $derived(data.worst);
	const c = $derived(data.collection);
	const base: MockEntry[] = $derived.by(() => {
		if (mode === 'empty') return [];
		if (mode === 'one') return c.entries.slice(0, 1);
		const added = extra ? [data.list.find((e) => !c.entries.some((x) => x.id === e.id)) ?? data.list[data.list.length - 1]] : [];
		return [...c.entries, ...added];
	});
	const firstPicked = $derived(pick === 'all' ? new Set(base.map((e) => e.id)) : pick === 'none' ? new Set<number>() : new Set(base.slice(1, 4).map((e) => e.id)));

	// what Rue changed on this page sits over the loaded data
	let moved = $state<MockEntry[] | null>(null);
	let selectOn = $state<boolean | null>(null);
	let picks = $state<Set<number> | null>(null);
	let renameOn = $state<boolean | null>(null);
	let confirmOn = $state<boolean | null>(null);
	let chooserOn = $state<boolean | null>(null);
	let said = $state<ToastItem[]>([]);
	let hushed = $state(false);

	const list = $derived(moved ?? base);
	const selecting = $derived(selectOn ?? mode === 'select');
	const picked = $derived(picks ?? (mode === 'select' ? firstPicked : new Set<number>()));
	const renaming = $derived(renameOn ?? (mode === 'rename' || mode === 'rename-blank'));
	const asking = $derived(confirmOn ?? confirm);
	const choosing = $derived(chooserOn ?? chooser);
	const toasts = $derived<ToastItem[]>([...(toast && !hushed ? [{ id: -1, ...toast }] : []), ...said]);

	let seq = 0;
	function say(message: string, kind?: 'error') {
		const id = ++seq;
		said = [...said, { id, message, kind }];
		if (kind !== 'error') setTimeout(() => (said = said.filter((t) => t.id !== id)), 3000);
	}
	const dismiss = (id: number) => (id < 0 ? (hushed = true) : (said = said.filter((t) => t.id !== id)));

	const digits = $derived(Math.max(2, String(list.length).length));
	const pos = (i: number) => String(i + 1).padStart(digits, '0');
	const types = $derived(new Set(list.map((e) => kindLabel(e.kind))).size);
	const targets = $derived(list.filter((e) => !picked.has(e.id)));

	let nameField = $state<HTMLInputElement>();
	let opener = $state<HTMLButtonElement>();
	let name = $state<string | null>(null);
	let nameErrorOn = $state<boolean | null>(null);
	const nameError = $derived(nameErrorOn ?? mode === 'rename-blank');
	let description = $state<string | null>(null);
	let renamed = $state<{ name: string; description: string | null } | null>(null);
	const shownName = $derived(renamed?.name ?? c.name);
	const shownDescription = $derived(renamed ? renamed.description : c.description);
	const shownTitle = $derived(headTitle(shownName));

	$effect(() => {
		if (mode === 'rename' || mode === 'rename-blank') nameField?.focus({ preventScroll: true });
	});

	async function startRename() {
		renameOn = true;
		await tick();
		nameField?.focus({ preventScroll: true });
	}
	async function endRename() {
		renameOn = false;
		await tick();
		opener?.focus();
	}
	function saveRename(e: SubmitEvent) {
		e.preventDefault();
		const next = (name ?? (mode === 'rename-blank' && nameErrorOn === null ? '' : shownName)).trim();
		nameErrorOn = !next;
		if (!next) return nameField?.focus();
		renamed = { name: next, description: (description ?? shownDescription ?? '').trim() || null };
		name = description = null;
		say(TOAST.saved);
		endRename();
	}

	// one move, saved at once; focus stays on the moved entry's control
	async function step(i: number, dir: -1 | 1) {
		const next = [...list];
		const [e] = next.splice(i, 1);
		next.splice(i + dir, 0, e);
		moved = next;
		await tick();
		const want = dir < 0 ? 'up' : 'down';
		(document.querySelector<HTMLElement>(`[data-move="${want}-${e.id}"]`) ?? document.querySelector<HTMLElement>(`[data-move="${want === 'up' ? 'down' : 'up'}-${e.id}"]`))?.focus();
	}
	function removeOne(e: MockEntry) {
		moved = list.filter((x) => x.id !== e.id);
		say(TOAST.removed(1));
	}

	let last = -1;
	function toggle(i: number, ev: MouseEvent) {
		const next = new Set(picked);
		if (ev.shiftKey && last >= 0) {
			const [a, b] = [Math.min(last, i), Math.max(last, i)];
			for (const e of list.slice(a, b + 1)) next.add(e.id);
		} else if (next.has(list[i].id)) next.delete(list[i].id);
		else next.add(list[i].id);
		picks = next;
		last = i;
	}
	function leave() {
		selectOn = false;
		picks = new Set();
		last = -1;
	}
	function apply(target: Target) {
		const n = picked.size;
		moved = moveSelection(list, picked, target);
		say(target === 'top' ? TOAST.movedTop(n) : target === 'bottom' ? TOAST.movedBottom(n) : TOAST.moved(n));
	}
	function removeSelected() {
		const n = picked.size;
		moved = list.filter((e) => !picked.has(e.id));
		picks = new Set();
		say(TOAST.removed(n));
	}
	function before(e: MockEntry) {
		chooserOn = false;
		apply({ before: e.id });
	}
	const barActions: BarAction[] = $derived([
		{ id: 'top', label: 'Move to top', onrun: () => apply('top') },
		{ id: 'bottom', label: 'Move to bottom', onrun: () => apply('bottom') },
		{ id: 'before', label: 'Move before…', disabled: targets.length === 0, onrun: () => (chooserOn = true) },
		{ id: 'remove', label: 'Remove from collection', danger: true, onrun: removeSelected }
	]);

	// drag by the handle (a fine pointer only): the row follows the pointer with transform, the drop line shows where it lands
	let dragFrom = $state(-1);
	let dragTo = $state(-1);
	let dy = $state(0);
	let startY = 0;
	let rects: DOMRect[] = [];
	function grab(ev: PointerEvent, i: number) {
		if (ev.button !== 0) return;
		const rows = [...(ev.currentTarget as HTMLElement).closest('ol')!.querySelectorAll<HTMLElement>(':scope > li')];
		rects = rows.map((r) => r.getBoundingClientRect());
		(ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
		startY = ev.clientY;
		dragFrom = dragTo = i;
		dy = 0;
	}
	function drag(ev: PointerEvent) {
		if (dragFrom < 0) return;
		dy = ev.clientY - startY;
		const mid = rects[dragFrom].top + rects[dragFrom].height / 2 + dy;
		dragTo = rects.filter((r, j) => j !== dragFrom && r.top + r.height / 2 < mid).length;
	}
	function drop() {
		if (dragFrom < 0) return;
		if (dragTo !== dragFrom) {
			const next = [...list];
			const [e] = next.splice(dragFrom, 1);
			next.splice(dragTo, 0, e);
			moved = next;
		}
		dragFrom = dragTo = -1;
		dy = 0;
	}
	const dropEdge = (i: number) => (dragFrom < 0 || dragTo === dragFrom ? undefined : i === dragTo ? (dragTo < dragFrom ? 'before' : 'after') : undefined);

	function onkeydown(e: KeyboardEvent) {
		if (e.key !== 'Escape') return;
		if (dragFrom >= 0) {
			dragFrom = dragTo = -1;
			dy = 0;
		} else if (selecting && !choosing) leave();
	}
	const fine = new MediaQuery('(pointer: fine)');
	const wide = new MediaQuery('(min-width: 1024px)');
	const how = $derived(fine.current ? (wide.current ? 'Drag by the handle, or use Move up and Move down' : 'Drag by the handle, or open a row’s menu') : wide.current ? 'Use Move up and Move down' : 'Open a row’s menu to move or remove it');
	const lift = $derived(selecting ? 'calc(var(--space-16) * 2 + var(--space-4))' : undefined);
	const q = $derived(worst ? '?data=worst' : '');
</script>

<svelte:window {onkeydown} />

<Frame world="home" section="collections" plus="shown">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker">
				<li><a href={href('collections', worst)}>Collections</a></li>
				<li>{plural(list.length, 'entry', 'entries')}</li>
				{#if selecting}<li>Select</li>{/if}
			</ul>
			<h1 data-long={shownName.length > 60 ? '' : undefined} lang={langOf(shownName)}>{shownTitle.head}{#if shownTitle.word}<em class="accent-word">{shownTitle.word}</em>{/if}{shownTitle.rest}</h1>
			{#if shownDescription}<p class="lede" lang={langOf(shownDescription)}>{shownDescription}</p>{/if}
			{#if !selecting && !renaming}
				<div class="actions" role="group" aria-label="Collection actions">
					{#if list.length}
						<button type="button" class="btn primary arrow" data-press data-focus="halo" onclick={() => ((selectOn = true), (picks = new Set()))}>
							Select<span class="circle" aria-hidden="true"><svg data-nudge viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
						</button>
					{/if}
					<button bind:this={opener} type="button" class="btn secondary" data-press onclick={startRename}>Rename</button>
					<button type="button" class="btn danger" data-press onclick={() => (confirmOn = true)}><Icon name="trash" size={16} />Delete collection</button>
				</div>
			{/if}
		</div>
		{#if list.length}
			<ul class="screen-facts" data-surface="inverse" aria-label="This collection at a glance">
				<li class="facts-caption">This collection</li>
				<li><span class="n">{fmt(list.length)}</span>{list.length === 1 ? 'Entry' : 'Entries'}</li>
				<li><span class="n">{fmt(types)}</span>{types === 1 ? 'Type' : 'Types'}</li>
			</ul>
		{/if}
	</div>

	<div class="screen-body" data-settle>
		<div class="scope">
			{#if renaming}
				<form class="card form" data-surface="solid" aria-labelledby="rn-h" onsubmit={saveRename} novalidate>
					<div class="card-head"><h2 id="rn-h">Rename</h2><span class="card-note">Name and description, as they are now</span></div>
					<div class="field pill" class:invalid={nameError}>
						<label for="r-name">Name</label>
						<div class="control"><input id="r-name" bind:this={nameField} bind:value={() => name ?? (mode === 'rename-blank' && nameErrorOn === null ? '' : shownName), (v) => ((name = v), (nameErrorOn = false))} type="text" autocomplete="off" aria-invalid={nameError ? 'true' : undefined} aria-describedby={nameError ? 'r-name-e' : undefined} /></div>
						{#if nameError}<p class="error" id="r-name-e" role="alert"><Icon name="alert" size={14} />Name is required</p>{/if}
					</div>
					<div class="field pill">
						<label for="r-desc">Description <span class="opt">optional</span></label>
						<div class="control area"><textarea id="r-desc" rows="3" bind:value={() => description ?? shownDescription ?? '', (v) => (description = v)}></textarea></div>
					</div>
					<div class="row-actions">
						<button type="button" class="btn secondary" data-press onclick={endRename}>Cancel</button>
						<button type="submit" class="btn primary arrow" data-press data-focus="halo">Save<span class="circle" aria-hidden="true"><Icon name="arrow" /></span></button>
					</div>
				</form>
			{/if}

			{#if selecting}
				<SelectionBar count={picked.size} actions={barActions} ondone={leave} />
			{/if}

			{#if list.length}
				<section class="card entries" data-surface="solid" aria-labelledby="e-h">
					<div class="card-head">
						<h2 id="e-h">In order</h2>
						<span class="card-note">{selecting ? 'Tap or click an entry to pick it' : list.length < 2 ? 'One entry, so there is nothing to reorder' : how}</span>
					</div>
					<ol class="rows" class:dragging={dragFrom >= 0} class:solo={list.length < 2} style:--digits={digits}>
						{#each list as e, i (e.id)}
							{@const on = picked.has(e.id)}
							<li class="item" class:on class:lifted={dragFrom === i} data-drop={dropEdge(i)} style:transform={dragFrom === i ? `translateY(${dy}px)` : undefined}>
								{#if selecting}
									<button type="button" class="pick" aria-pressed={on} onclick={(ev) => toggle(i, ev)}>
										<span class="check" class:filled={on} aria-hidden="true">{#if on}<Icon name="check" size={16} />{/if}</span>
										<span class="position"><span class="sr-only">Position </span>{pos(i)}</span>
										{@render thumb(e)}
										<span class="text">
											<span class="title" lang={langOf(e.title)}>{e.title}</span>
											<span class="meta">{kindLabel(e.kind)}{e.by ? ` · ${e.by}` : ''}</span>
										</span>
									</button>
								{:else}
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<span class="grip" aria-hidden="true" onpointerdown={(ev) => grab(ev, i)} onpointermove={drag} onpointerup={drop} onpointercancel={drop}><Icon name="grip" size={20} /></span>
									<span class="position"><span class="sr-only">Position </span>{pos(i)}<span class="of"><span class="sr-only"> of </span><span class="slash" aria-hidden="true">/</span>{String(list.length).padStart(digits, '0')}</span></span>
									{@render thumb(e)}
									<span class="text">
										<a class="title" href={href('entry', worst)} lang={langOf(e.title)}>{e.title}</a>
										<span class="meta">{kindLabel(e.kind)}{e.by ? ` · ${e.by}` : ''}</span>
									</span>
									<span class="moves">
										{#if i > 0}<button type="button" class="btn quiet icon s" aria-label="Move {e.title} up" data-move="up-{e.id}" data-press="round" onclick={() => step(i, -1)}><Icon name="up" size={18} /></button>{:else}<span class="gap" aria-hidden="true"></span>{/if}
										{#if i < list.length - 1}<button type="button" class="btn quiet icon s" aria-label="Move {e.title} down" data-move="down-{e.id}" data-press="round" onclick={() => step(i, 1)}><Icon name="down" size={18} /></button>{:else}<span class="gap" aria-hidden="true"></span>{/if}
										<button type="button" class="btn quiet icon s" aria-label="Remove {e.title}" data-press="round" onclick={() => removeOne(e)}><Icon name="trash" size={18} /></button>
									</span>
									<span class="slot">
										<RowMenu
											name="Actions for {e.title}"
											shown={menu && i === 1}
											items={[
												...(i > 0 ? [{ label: 'Move up', icon: 'up' as const, onrun: () => step(i, -1) }] : []),
												...(i < list.length - 1 ? [{ label: 'Move down', icon: 'down' as const, onrun: () => step(i, 1) }] : []),
												{ label: 'Remove', danger: true, sep: true, onrun: () => removeOne(e) }
											]}
										/>
									</span>
								{/if}
							</li>
						{/each}
					</ol>
				</section>
			{:else}
				<section class="card empty-card" data-surface="solid" aria-labelledby="em-h">
					<div class="empty">
						<h2 class="title" id="em-h">Nothing in here yet</h2>
						<p class="body">Use “Add to collection” on any entry's page.</p>
					</div>
				</section>
			{/if}
		</div>
	</div>
</Frame>

{#snippet thumb(e: MockEntry)}
	{#if real(e.cover)}<img class="thumb" src={real(e.cover)} alt="" />{:else}<span class="thumb plate" role="img" aria-label="No photo yet" lang={langOf(e.title)}>{initials(e.title)}</span>{/if}
{/snippet}

<Sheet open={asking} onclose={() => (confirmOn = false)} alert mode="sheet" title="Delete this collection?">
	<p class="quote" lang={langOf(shownName)}>{quote(shownName)}</p>
	<p class="sheet-text">Its entries stay in your archive.</p>
	{#snippet actions()}
		<button type="button" class="btn secondary" data-initial data-press onclick={() => (confirmOn = false)}>Cancel</button>
		<a class="btn danger" href={href('collections', worst)} data-press><Icon name="trash" size={16} />Delete</a>
	{/snippet}
</Sheet>

<Sheet open={choosing} onclose={() => (chooserOn = false)} mode="sheet" title="Move {plural(picked.size, 'entry', 'entries')} before…">
	<p class="sheet-text">Pick the entry they go in front of. They keep their order among themselves.</p>
	<ul class="choose" aria-label="Target entry" style:--digits={digits}>
		{#each targets as e (e.id)}
			<li>
				<button type="button" class="target" data-initial={e === targets[0] ? '' : undefined} onclick={() => before(e)}>
					<span class="position">{pos(list.indexOf(e))}</span>
					<span class="name" lang={langOf(e.title)}>{e.title}</span>
				</button>
			</li>
		{/each}
	</ul>
	{#snippet actions()}<button type="button" class="btn secondary" data-press onclick={() => (chooserOn = false)}>Cancel</button>{/snippet}
</Sheet>

<Toaster {toasts} ondismiss={dismiss} {lift} />

<style>
	h1[data-long] { font-size: var(--type-display-l-size); line-height: var(--type-display-l-line); }
	h1, .lede { overflow-wrap: anywhere; }
	.lede { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; line-clamp: 3; overflow: hidden; }
	.actions { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3); max-inline-size: 100%; }
	.kicker a { color: inherit; text-decoration: none; }
	@media (hover: hover) {
		.kicker a:hover { text-decoration: underline; text-underline-offset: 0.2em; }
	}

	/* one flex column so the desktop selection bar can stick against the whole list (a grid item only sticks inside its own cell) */
	.scope { display: flex; flex-direction: column; gap: var(--space-4); min-inline-size: 0; }
	.form { display: grid; gap: var(--space-4); padding: var(--space-6); max-inline-size: 40rem; }
	.opt { color: var(--ink-secondary); font-weight: var(--weight-regular); }
	.row-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--space-2); }

	.entries { display: grid; gap: var(--space-4); padding: var(--space-5); min-inline-size: 0; }
	.rows { display: grid; gap: var(--space-1); margin: 0; padding: 0; list-style: none; }
	.item {
		--thumb: var(--space-12);
		position: relative;
		display: grid;
		grid-template-columns: auto auto minmax(0, 1fr) auto;
		grid-template-areas: 'pos thumb text slot';
		align-items: center;
		gap: var(--space-3);
		min-block-size: var(--target-touch);
		padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
		min-inline-size: 0;
	}
	.item.on { background: var(--surface-selected); box-shadow: var(--ring-selected); }
	.position { grid-area: pos; color: var(--ink); min-inline-size: calc(var(--digits) * 2ch + 3ch); }
	.position :global(.slash) { margin-inline: 0.45em; }
	.item > :global(.thumb), .pick > :global(.thumb) { grid-area: thumb; }
	.text { grid-area: text; display: grid; gap: var(--space-0-5); min-inline-size: 0; }
	.text .title {
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
	a.title { justify-self: start; max-inline-size: 100%; }
	@media (hover: hover) {
		a.title:hover { text-decoration: underline; text-underline-offset: 0.2em; }
	}
	.meta { color: var(--ink-secondary); font-size: var(--type-caption-size); line-height: var(--type-caption-line); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.slot { grid-area: slot; display: flex; align-items: center; }
	.moves { grid-area: slot; display: none; align-items: center; }
	.gap { display: block; flex: none; inline-size: max(var(--control-height-s), var(--target)); }
	.grip { grid-area: grip; display: none; place-items: center; color: var(--ink-secondary); cursor: grab; touch-action: none; }

	.pick {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: auto auto auto minmax(0, 1fr);
		grid-template-areas: none;
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
	.pick .position, .pick > :global(.thumb), .pick .text { grid-area: auto; }
	.pick .position { min-inline-size: calc(var(--digits) * 1ch); }
	.check {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: var(--space-6);
		block-size: var(--space-6);
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
	}
	.check.filled { background: var(--accent); color: var(--accent-ink); box-shadow: none; }
	@media (hover: hover) {
		.pick:hover .check:not(.filled) { background: var(--surface-sunken); }
		.item:not(.on):has(.pick:hover) { background: var(--surface-hover); }
	}

	.item.lifted { z-index: var(--z-raised); background: var(--surface-raised); box-shadow: var(--shadow-lift); cursor: grabbing; }
	.item[data-drop]::after { content: ""; position: absolute; inset-inline: 0; block-size: var(--stroke-strong); border-radius: var(--radius-pill); background: var(--surface-inverse); }
	.item[data-drop='before']::after { inset-block-start: calc(-1 * var(--space-1) / 2 - var(--stroke-strong) / 2); }
	.item[data-drop='after']::after { inset-block-end: calc(-1 * var(--space-1) / 2 - var(--stroke-strong) / 2); }
	.rows.dragging { user-select: none; -webkit-user-select: none; }

	.empty-card { padding: var(--space-6); max-inline-size: 40rem; }
	.choose { display: grid; gap: var(--space-0-5); max-block-size: 18rem; overflow-y: auto; margin: 0; padding: var(--space-1); list-style: none; border-radius: var(--radius-panel); background: var(--surface-sunken); }
	.target {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: center;
		gap: var(--space-3);
		inline-size: 100%;
		min-block-size: var(--target-touch);
		padding: var(--space-1) var(--space-3);
		border: 0;
		border-radius: var(--radius-item);
		background: none;
		color: var(--ink);
		text-align: start;
	}
	.target .position { grid-area: auto; min-inline-size: calc(var(--digits, 2) * 1ch); }
	.target .name { min-inline-size: 0; overflow-wrap: anywhere; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; overflow: hidden; }
	@media (hover: hover) {
		.target:hover { background: var(--surface-raised); }
	}

	/* the drag handle shows on a fine pointer only; Move up and Move down are the keyboard and touch way */
	@media (pointer: fine) {
		.item:not(:has(.pick)) { grid-template-columns: auto auto auto minmax(0, 1fr) auto; grid-template-areas: 'grip pos thumb text slot'; }
		.grip { display: grid; }
		.solo .item:not(:has(.pick)) { grid-template-columns: auto auto minmax(0, 1fr) auto; grid-template-areas: 'pos thumb text slot'; }
		.solo .grip { display: none; }
	}
	@media (min-width: 1024px) {
		.moves { display: flex; }
		.slot { display: none; }
	}
	@media (max-width: 767px) {
		.lede { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 6; line-clamp: 6; overflow: hidden; }
		.position { min-inline-size: calc(var(--digits) * 1ch); }
		.position .of { display: none; }
		.form { padding: var(--space-5) var(--space-4); }
		.empty-card { padding: var(--space-5) var(--space-4); }
		.entries { padding: var(--space-4) var(--space-3); }
		.item { --thumb: var(--space-10); gap: var(--space-2-5); }
	}
</style>
