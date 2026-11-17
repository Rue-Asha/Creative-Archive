<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import Btn from './Btn.svelte';
	import Dialog from './Dialog.svelte';
	import Menu, { type Item } from './Menu.svelte';
	import Specimen from './Specimen.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const album = $derived(data.entry.album);
	const brand = $derived(data.list.find((e) => e.kind === 'brand') ?? data.list[0]);
	const collection = $derived(data.collections[0]);
	const quote = (title: string) => `“${title}”`;

	const memberOf = $derived(new Set(album.collections));
	const collectionItems: Item[] = $derived([
		...data.collections.map((c) => ({ label: c.name, checked: memberOf.has(c.name), hint: String(c.count) })),
		{ label: 'New collection', kind: 'create' as const, sep: true }
	]);
	const emptyCollections: Item[] = [{ label: 'New collection', kind: 'create' }];

	const mediaStatus: Item[] = [
		{ label: 'No status' },
		{ label: 'Want to listen' },
		{ label: 'Listening', checked: true },
		{ label: 'Listened' },
		{ label: 'Dropped' }
	];
	const pieceStatus: Item[] = [{ label: 'Wishlist' }, { label: 'Owned', checked: true }, { label: 'Gone' }];

	const musicAdd: Item[] = [{ label: 'Album' }, { label: 'Artist' }, { label: 'Song' }];
	const fashionAdd: Item[] = [{ label: 'Brand or shop' }, { label: 'Influencer' }, { label: 'Magazine' }, { label: 'Piece' }, { label: 'Look' }];

	// the picker lists tags already used; the new name is offered in add mode only
	const tags = $derived(data.tags);
	const typed = $derived(data.worst ? tags[1].name : 'autumn-rain');
	const onSelection = $derived(tags.slice(0, data.worst ? 40 : 3));
</script>

<svelte:head><title>Dialogs and menus (wireframe)</title></svelte:head>

{#snippet cancel(label = 'Cancel', focused = true)}<Btn {focused}>{label}</Btn>{/snippet}

<Frame world="home" section="home" plus="inert">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Overlays</li><li>Dialogs and menus</li></ul>
			<h1>Dialogs and menus</h1>
			<p class="lede">
				Everything is drawn open. Modal dialogs trap focus, Esc and a click outside cancel, and focus returns to the opener; Cancel holds focus first. On a phone a dialog is a bottom sheet, from 768 px it is centred. Menus: arrows, Home and End move, Esc closes and returns focus. Toasts are on the next page.
			</p>
			<p class="lede"><a href="/__mockups/redesign/overlays/toasts{data.worst ? '?data=worst' : ''}">Toasts</a></p>
		</div>
	</div>
	<div class="screen-body" data-settle>
		<section class="card panel" data-surface="solid" aria-labelledby="g-delete">
			<div class="card-head"><h2 id="g-delete">Delete confirmations</h2><span class="card-note">Delete is never the primary pill and never the focused button</span></div>
			<div class="grid">
				<Specimen label="Delete entry · album" note="From the entry page rail." sheet>
					<Dialog title="Delete this {album.kind}?" quote={quote(album.title)} text="It leaves your collections and its history goes with it.">
						{#snippet actions()}{@render cancel()}<Btn variant="danger" icon="trash">Delete</Btn>{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Delete entry · brand or shop" note="Brands and shops use their Kind label." sheet>
					<Dialog title="Delete this brand?" quote={quote(brand.title)} text="It leaves your collections and its history goes with it.">
						{#snippet actions()}{@render cancel()}<Btn variant="danger" icon="trash">Delete</Btn>{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Delete collection" note="From the collection page. The entries are not deleted." sheet>
					<Dialog title="Delete this collection?" quote={quote(collection.name)} text="Its entries stay in your archive.">
						{#snippet actions()}{@render cancel()}<Btn variant="danger" icon="trash">Delete</Btn>{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Discard changes?" note="Leaving a form with unsaved values. Escape keeps editing." sheet>
					<Dialog title="Discard changes?" text="What you entered has not been saved.">
						{#snippet actions()}{@render cancel('Keep editing')}<Btn>Discard</Btn>{/snippet}
					</Dialog>
				</Specimen>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="g-menus">
			<div class="card-head"><h2 id="g-menus">Menus</h2><span class="card-note">A checked item is charcoal with a check, never colour alone</span></div>
			<div class="grid">
				<Specimen label="Add to collection" note="Toggling a collection saves at once. The list scrolls past a screenful.">
					<Menu name="Add to collection" mode="check" items={collectionItems} maxBlock="22rem" />
				</Specimen>
				<Specimen label="Add to collection · no collections yet">
					<Menu name="Add to collection" items={emptyCollections} />
				</Specimen>
				<Specimen label="Add to collection · New collection" note="Opens in place of the list. Create adds the entry at once." sheet>
					<Dialog title="New collection">
						<div class="field">
							<label for="nc-name">Name</label>
							<input id="nc-name" type="text" value="" aria-invalid="true" aria-describedby="nc-err" />
							<p id="nc-err" class="error" role="alert">Name is required</p>
						</div>
						{#snippet actions()}{@render cancel()}<Btn variant="primary">Create</Btn>{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Status menu · media" note="Labels per domain: Want to listen, Plan to watch, Want to read…">
					<Menu name="Status" mode="radio" items={mediaStatus} />
				</Specimen>
				<Specimen label="Status menu · piece" note="Pieces: Wishlist, Owned, Gone. No status for other Fashion types.">
					<Menu name="Status" mode="radio" items={pieceStatus} />
				</Specimen>
				<Specimen label="Domain Add menu · Music" note="The same items as the “+” sheet inside a domain.">
					<Menu name="Add menu" items={musicAdd} />
				</Specimen>
				<Specimen label="Domain Add menu · Fashion" note="Brand and shop are one item; Piece opens with status Owned on Wardrobe.">
					<Menu name="Add menu" items={fashionAdd} />
				</Specimen>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="g-tags">
			<div class="card-head"><h2 id="g-tags">Tag picker</h2><span class="card-note">Select mode · applies to every selected entry at once</span></div>
			<div class="grid">
				<Specimen label="Add tag" note="Existing tags plus the typed name as a new one." sheet>
					<Dialog title="Add tag" wide>
						<div class="picker">
							<div class="field">
								<label for="tp-add">Tag</label>
								<input id="tp-add" type="text" value={typed} />
							</div>
							<ul class="chips" aria-label="Existing tags">
								<li><button type="button" class="chip new"><span class="t">Create “{typed}”</span></button></li>
								{#each tags as tag (tag.name)}
									<li><button type="button" class="chip" title={tag.name}><span class="t">{tag.name}</span><span class="c">{tag.count.toLocaleString('en')}</span></button></li>
								{/each}
							</ul>
						</div>
						{#snippet actions()}{@render cancel()}{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Remove tag" note="Only tags present on the selection, with how many entries carry each." sheet>
					<Dialog title="Remove tag" wide>
						<ul class="chips" aria-label="Tags on the selection">
							{#each onSelection as tag, i (tag.name)}
								<li><button type="button" class="chip" title={tag.name}><span class="t">{tag.name}</span><span class="c">{(i % 3) + 1} of 5</span></button></li>
							{/each}
						</ul>
						{#snippet actions()}{@render cancel()}{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Remove tag · none on the selection" sheet>
					<Dialog title="Remove tag" wide text="None of the selected entries has a tag.">
						{#snippet actions()}{@render cancel('Close')}{/snippet}
					</Dialog>
				</Specimen>
				<Specimen label="Set status · mixed types" note="No Set status action is offered when the selection mixes status sets, so there is no sheet to draw.">
					<p class="none">Offered only when every selected entry shares one status set.</p>
				</Specimen>
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
	.field {
		display: grid;
		gap: var(--space-1-5);
	}
	label {
		font-size: var(--type-label-size);
		font-weight: var(--type-label-weight);
	}
	input {
		inline-size: 100%;
		min-inline-size: 0;
		block-size: max(var(--control-height), var(--target));
		padding-inline: var(--space-5);
		border: 0;
		border-radius: var(--radius-control);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink);
		text-overflow: ellipsis;
	}
	input[aria-invalid='true'] {
		box-shadow: var(--ring-danger);
	}
	.error {
		color: var(--danger);
		font-size: var(--type-caption-size);
	}
	.picker {
		display: grid;
		gap: var(--space-3);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
		max-block-size: 16rem;
		overflow-y: auto;
	}
	.chips li {
		max-inline-size: 100%;
	}
	.chip {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		max-inline-size: 100%;
		min-block-size: max(var(--control-height-s), var(--target));
		padding-inline: var(--space-3-5);
		border: 0;
		border-radius: var(--radius-pill);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink);
	}
	.chip.new {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
		box-shadow: none;
	}
	.t {
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.c {
		flex: none;
		color: var(--ink-muted);
		font-size: var(--type-caption-size);
		font-variant-numeric: var(--numeric-figures);
	}
	.none {
		color: var(--ink-secondary);
	}
	@media (max-width: 767px) {
		.panel {
			padding: var(--space-4);
		}
	}
</style>
