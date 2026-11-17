<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import Specimen from '../Specimen.svelte';
	import Toast from '../Toast.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const title = $derived(data.collection.entries[0].title);
	const long = $derived(data.worst ? `“${title.slice(0, 120)}” removed from this collection` : 'Blue Hour Sessions removed from this collection');
</script>

<svelte:head><title>Toasts (wireframe)</title></svelte:head>

<Frame world="home" section="home" plus="inert">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Overlays</li><li>Toasts</li></ul>
			<h1>Toasts</h1>
			<p class="lede">
				Past tense, about 3 s, announced politely and never blocking. One is visible per region and older ones peek behind it; on a phone the page gains room above the phone bar while one is up. A toast raised before a redirect shows on the next page.
			</p>
		</div>
	</div>
	<div class="screen-body" data-settle>
		<section class="card panel" data-surface="solid" aria-labelledby="t-basic">
			<div class="card-head"><h2 id="t-basic">After a save</h2><span class="card-note">Messages the contract already fixes</span></div>
			<div class="grid">
				<Specimen label="Saved" note="After adding or editing an entry."><div class="toasts" role="status"><Toast message="Saved" /></div></Specimen>
				<Specimen label="Deleted" note="After deleting an entry or a collection."><div class="toasts" role="status"><Toast message="Deleted" /></div></Specimen>
				<Specimen label="Couldn't save — try again" note="A failed background save; the control or order returns to the saved value."><div class="toasts" role="status"><Toast message="Couldn't save — try again" /></div></Specimen>
				<Specimen label="Collection changed elsewhere" note="A reorder answered 409: the page reloads the saved order."><div class="toasts" role="status"><Toast message="Collection order changed elsewhere — reloaded" /></div></Specimen>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="t-bulk">
			<div class="card-head"><h2 id="t-bulk">Bulk actions</h2><span class="card-note">Every toast names the count; wording is chosen at gate 5</span></div>
			<div class="grid">
				<Specimen label="Status, several" note="Set status in a list."><div class="toasts" role="status"><Toast message="3 entries updated" /></div></Specimen>
				<Specimen label="Status, one" note="Singular is handled, never “1 entries”."><div class="toasts" role="status"><Toast message="1 entry updated" /></div></Specimen>
				<Specimen label="Tag added"><div class="toasts" role="status"><Toast message="Tag added to 12 entries" /></div></Specimen>
				<Specimen label="Tag removed"><div class="toasts" role="status"><Toast message="Tag removed from 4 entries" /></div></Specimen>
				<Specimen label="Moved to top or bottom"><div class="toasts" role="status"><Toast message="3 entries moved to the top" /></div></Specimen>
				<Specimen label="Moved before another entry"><div class="toasts" role="status"><Toast message="2 entries moved" /></div></Specimen>
				<Specimen label="Removed from the collection" note="The entries themselves stay in the archive."><div class="toasts" role="status"><Toast message="2 entries removed from this collection" /></div></Specimen>
				<Specimen label="Bulk action failed" note="Nothing changed; every value is kept."><div class="toasts" role="status"><Toast message="Couldn't save — try again" /></div></Specimen>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="t-stack">
			<div class="card-head"><h2 id="t-stack">Stack and long messages</h2><span class="card-note">Toasts never cover the only actions</span></div>
			<div class="grid">
				<Specimen label="Three in a row: the newest in front" note="Older ones peek at a smaller scale.">
					<div class="toasts stack" role="status">
						<div class="back2" aria-hidden="true"><Toast message="Cover could not be downloaded" quiet /></div>
						<div class="back1" aria-hidden="true"><Toast message="3 entries updated" quiet /></div>
						<div class="front"><Toast message="Collection order changed elsewhere — reloaded" /></div>
					</div>
				</Specimen>
				<Specimen label="Long message" note="Wraps inside the toast; the dismiss stays reachable.">
					<div class="toasts" role="status"><Toast message={long} /></div>
				</Specimen>
				<Specimen label="Cover not downloaded" note="Save still went through; the entry has no cover."><div class="toasts" role="status"><Toast message="Cover could not be downloaded" /></div></Specimen>
			</div>
		</section>
	</div>
</Frame>

<style>
	.panel {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-5);
		padding: var(--space-6);
		min-inline-size: 0;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
		gap: var(--space-5);
		align-items: start;
	}
	.toasts {
		inline-size: min(100%, 28rem);
		display: grid;
	}
	.stack {
		padding-block-start: var(--space-6);
	}
	.stack > div {
		grid-area: 1 / 1;
	}
	.stack .back1,
	.stack .back2 {
		scale: var(--toast-stack-scale);
	}
	.stack .back1 {
		translate: 0 calc(-1 * var(--space-3));
	}
	.stack .back2 {
		translate: 0 calc(-2 * var(--space-3));
	}
	.stack .front {
		position: relative;
		z-index: var(--z-raised);
	}
	@media (max-width: 767px) {
		.panel {
			padding: var(--space-4);
		}
	}
</style>
