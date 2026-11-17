<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import { base } from '../../shell/data.ts';
	import { TOAST } from '../copy.ts';
	import Specimen from '../Specimen.svelte';
	import Toaster, { type ToastItem } from '../Toaster.svelte';
	import '../overlays.css';

	const data = $derived(mockData(new URL(page.url.href)));
	const q = $derived(data.worst ? '?data=worst' : '');
	const first = $derived(data.collection.entries[0].title);
	const long = $derived(data.worst ? `“${first.slice(0, 120)}” removed from this collection` : 'Margaret Howell and Studio Nicholson removed from this collection');

	let seq = 0;
	const one = (message: string, extra: Partial<ToastItem> = {}): ToastItem[] => [{ id: ++seq, message, ...extra }];

	const saves: { label: string; note: string; message: string; kind?: 'error' }[] = [
		{ label: 'Saved', note: 'After adding or editing an entry.', message: TOAST.saved },
		{ label: 'Deleted', note: 'After deleting an entry or a collection.', message: TOAST.deleted },
		{ label: 'Couldn’t save', note: 'A failed background save; the control or the order returns to the saved value. Stays until dismissed.', message: TOAST.failed, kind: 'error' },
		{ label: 'Cover not downloaded', note: 'The save went through; the entry has no cover.', message: TOAST.cover }
	];
	const bulk: { label: string; note?: string; message: string; kind?: 'error' }[] = [
		{ label: 'Status, several', note: 'Set status in a list.', message: TOAST.statusSet('Listened', 3) },
		{ label: 'Status, one', note: 'The singular is handled, never “1 entries”.', message: TOAST.statusSet('Listened', 1) },
		{ label: 'Tag added', message: TOAST.tagAdded(12) },
		{ label: 'Tag removed', message: TOAST.tagRemoved(4) },
		{ label: 'Moved to the top', note: 'Move to bottom reads the same with “bottom”.', message: TOAST.movedTop(3) },
		{ label: 'Moved to the bottom', message: TOAST.movedBottom(1) },
		{ label: 'Moved before another entry', message: TOAST.moved(2) },
		{ label: 'Removed from the collection', note: 'The entries themselves stay in the archive.', message: TOAST.removed(2) },
		{ label: 'Bulk action failed', note: 'Nothing changed, every value is kept. Stays until dismissed.', message: TOAST.bulkFailed(3), kind: 'error' }
	];

	const shown = saves.length + 2 + bulk.length;

	let live = $state<ToastItem[]>([]);
	const raise = (message: string, kind?: 'error') => {
		const id = ++seq;
		live = [...live, { id, message, kind }];
		if (kind !== 'error') setTimeout(() => (live = live.filter((t) => t.id !== id)), 3000);
	};
	const drop = (id: number) => (live = live.filter((t) => t.id !== id));
</script>

<svelte:head><title>Toasts · Creative Archive</title></svelte:head>

<Frame world="music" section="music">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Overlays</li><li>Toasts</li></ul>
			<h1>Toasts that stay <em class="accent-word">quiet</em></h1>
			<p class="lede">
				Past tense, about 3 seconds, announced politely and never blocking; an error stays until dismissed and is announced as an alert. One toast shows per region and older ones peek behind it. On a phone the page gains room at its end and the toast sits above the phone bar while one is up. A toast raised before a redirect shows on the next page.
			</p>
			<p class="lede"><a class="link" href="{base}/hifi/overlays{q}">See the dialogs and menus</a></p>
		</div>
		<ul class="screen-facts" data-surface="inverse" aria-label="On this page">
			<li class="facts-caption">Drawn on this page</li>
			<li><span class="n">{shown}</span>Messages</li>
		</ul>
	</div>

	<div class="screen-body" data-settle>
		<section class="card panel" data-surface="solid" aria-labelledby="t-live">
			<div class="card-head"><h2 id="t-live">Try one</h2><span class="card-note">The real region, fixed to the viewport</span></div>
			<div class="actions">
				<button type="button" class="btn secondary" data-press onclick={() => raise(TOAST.saved)}>Saved</button>
				<button type="button" class="btn secondary" data-press onclick={() => raise(TOAST.conflict)}>Changed elsewhere</button>
				<button type="button" class="btn secondary" data-press onclick={() => raise(TOAST.failed, 'error')}>Couldn’t save</button>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="t-basic">
			<div class="card-head"><h2 id="t-basic">After a save</h2><span class="card-note">Messages the contract already fixes</span></div>
			<div class="grid">
				{#each saves as s (s.label)}
					<Specimen label={s.label} note={s.note}><Toaster inline toasts={one(s.message, { kind: s.kind })} /></Specimen>
				{/each}
				<Specimen label="Collection changed elsewhere" note="A reorder answered 409: the page reloads the saved order and says so.">
					<Toaster inline toasts={one(TOAST.conflict)} />
				</Specimen>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="t-bulk">
			<div class="card-head"><h2 id="t-bulk">Bulk actions</h2><span class="card-note">Past tense with the count; status names the action</span></div>
			<div class="grid">
				{#each bulk as b (b.label)}
					<Specimen label={b.label} note={b.note}><Toaster inline toasts={one(b.message, { kind: b.kind })} /></Specimen>
				{/each}
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="t-stack">
			<div class="card-head"><h2 id="t-stack">Stack and long messages</h2><span class="card-note">Toasts never cover the only actions</span></div>
			<div class="grid">
				<Specimen label="Three in a row: the newest in front" note="Older ones peek behind at a smaller scale and come forward when the newest goes.">
					<Toaster inline hidden={[9001, 9002]} toasts={[{ id: 9001, message: TOAST.cover }, { id: 9002, message: TOAST.statusSet('Listened', 3) }, { id: 9003, message: TOAST.conflict }]} />
				</Specimen>
				<Specimen label="Long message" note="Wraps inside the toast; Dismiss stays reachable.">
					<Toaster inline toasts={one(long)} />
				</Specimen>
				<Specimen label="Long error" note="An error with a long name keeps its alert mark.">
					<Toaster inline toasts={one(data.worst ? `Couldn’t save “${first.slice(0, 120)}” — try again` : 'Couldn’t save Night Train to Aomori — try again', { kind: 'error' })} />
				</Specimen>
			</div>
		</section>
	</div>
</Frame>

<Toaster toasts={live} ondismiss={drop} />

<style>
	.panel { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-5); padding: var(--space-6); min-inline-size: 0; }
	.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr)); gap: var(--space-5); align-items: start; }
	.actions { display: flex; flex-wrap: wrap; gap: var(--space-2); }
	.link { color: var(--ink); text-underline-offset: 0.2em; }
	.panel :global(.well) { align-content: center; min-block-size: 8rem; }
	@media (max-width: 767px) {
		.panel { padding: var(--space-4); }
	}
</style>
