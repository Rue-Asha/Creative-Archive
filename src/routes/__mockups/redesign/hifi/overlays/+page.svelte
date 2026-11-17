<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import { base, langOf } from '../shell/data.ts';
	import { quote } from './copy.ts';
	import Icon from './Icon.svelte';
	import Menu, { type Item } from './Menu.svelte';
	import Sheet from './Sheet.svelte';
	import Specimen from './Specimen.svelte';
	import './overlays.css';

	const data = $derived(mockData(new URL(page.url.href)));
	const worst = $derived(data.worst);
	const album = $derived(data.entry.album);
	const brand = $derived(data.list.find((e) => e.kind === 'brand') ?? data.list[0]);
	const collection = $derived(data.collections[0]);
	const q = $derived(worst ? '?data=worst' : '');

	const memberOf = $derived(new Set(album.collections));
	const collectionItems: Item[] = $derived([
		...data.collections.map((c) => ({ label: c.name, checked: memberOf.has(c.name), hint: String(c.count), focus: c === data.collections[0] })),
		{ label: 'New collection', create: true, sep: true }
	]);
	const noCollections: Item[] = [{ label: 'New collection', create: true, focus: true }];

	const mediaStatus: Item[] = [{ label: 'No status' }, { label: 'Want to listen' }, { label: 'Listening', checked: true }, { label: 'Listened' }, { label: 'Dropped' }];
	const pieceStatus: Item[] = [{ label: 'Wishlist' }, { label: 'Owned', checked: true }, { label: 'Gone' }];
	const musicAdd: Item[] = [{ label: 'Album', focus: true }, { label: 'Artist' }, { label: 'Song' }];
	const fashionAdd: Item[] = [{ label: 'Brand or shop', focus: true }, { label: 'Influencer' }, { label: 'Magazine' }, { label: 'Piece' }, { label: 'Look' }];

	const midRow: Item[] = [{ label: 'Move up', icon: 'up', focus: true }, { label: 'Move down', icon: 'down' }, { label: 'Remove', danger: true, sep: true }];
	const firstRow: Item[] = [{ label: 'Move down', icon: 'down', focus: true }, { label: 'Remove', danger: true, sep: true }];
	const lastRow: Item[] = [{ label: 'Move up', icon: 'up', focus: true }, { label: 'Remove', danger: true, sep: true }];
	const listMore: Item[] = [{ label: 'Add tag', focus: true }, { label: 'Remove tag' }];
	const mixedMore: Item[] = [{ label: 'Remove tag', focus: true }];
	const collectionMore: Item[] = [{ label: 'Move to bottom', focus: true }, { label: 'Move before…' }, { label: 'Remove from collection', danger: true, sep: true }];

	const tags = $derived(data.tags);
	const typed = $derived(worst ? tags[1].name : 'autumn-rain');
	const onSelection = $derived(tags.slice(0, worst ? 40 : 3));
	const rowTitle = $derived(data.collection.entries[1]?.title ?? album.title);

	const dialogs = 8;
	const menus = 12;
</script>

<svelte:head><title>Dialogs and menus · Creative Archive</title></svelte:head>

{#snippet cancel(label = 'Cancel', initial = true)}<button type="button" class="btn secondary" data-initial={initial ? '' : undefined} data-drawn-focus={initial ? '' : undefined} data-press>{label}</button>{/snippet}
{#snippet remove(label: string)}<button type="button" class="btn danger" data-press><Icon name="trash" size={16} />{label}</button>{/snippet}

<Frame world="music" section="music">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Overlays</li><li>Dialogs and menus</li></ul>
			<h1>Dialogs and <em class="accent-word">menus</em></h1>
			<p class="lede">
				Everything is drawn open. A dialog traps focus, Escape and a click outside cancel, and focus returns to the opener; on a confirmation Cancel holds focus first, and on a phone a dialog is a bottom sheet. In a menu the arrows, Home and End move, Escape closes and returns focus. The ringed control is the one that has focus.
			</p>
			<p class="lede"><a class="link" href="{base}/hifi/overlays/toasts{q}">See the toasts</a></p>
		</div>
		<ul class="screen-facts" data-surface="inverse" aria-label="On this page">
			<li class="facts-caption">Drawn on this page</li>
			<li><span class="n">{dialogs}</span>Dialogs</li>
			<li><span class="n">{menus}</span>Menus</li>
		</ul>
	</div>

	<div class="screen-body" data-settle>
		<section class="card panel" data-surface="solid" aria-labelledby="g-delete">
			<div class="card-head"><h2 id="g-delete">Delete and discard</h2><span class="card-note">Delete is never the primary pill and never the focused button</span></div>
			<div class="grid">
				<Specimen label="Delete entry · album" note="From the entry page's rail." sheet>
					<Sheet inline alert mode="sheet" title="Delete this {album.kind}?">
						<p class="quote" lang={langOf(album.title)}>{quote(album.title)}</p>
						<p class="sheet-text">It leaves your collections and its history goes with it.</p>
						{#snippet actions()}{@render cancel()}{@render remove('Delete')}{/snippet}
					</Sheet>
				</Specimen>
				<Specimen label="Delete entry · brand or shop" note="Brands and shops use their own Kind in the title." sheet>
					<Sheet inline alert mode="sheet" title="Delete this brand?">
						<p class="quote" lang={langOf(brand.title)}>{quote(brand.title)}</p>
						<p class="sheet-text">It leaves your collections and its history goes with it.</p>
						{#snippet actions()}{@render cancel()}{@render remove('Delete')}{/snippet}
					</Sheet>
				</Specimen>
				<Specimen label="Delete collection" note="From the collection page. The entries are not deleted." sheet>
					<Sheet inline alert mode="sheet" title="Delete this collection?">
						<p class="quote" lang={langOf(collection.name)}>{quote(collection.name)}</p>
						<p class="sheet-text">Its entries stay in your archive.</p>
						{#snippet actions()}{@render cancel()}{@render remove('Delete')}{/snippet}
					</Sheet>
				</Specimen>
				<Specimen label="Discard changes?" note="Leaving a form with unsaved values. Escape keeps editing." sheet>
					<Sheet inline alert mode="sheet" title="Discard changes?">
						<p class="sheet-text">What you entered has not been saved.</p>
						{#snippet actions()}{@render cancel('Keep editing')}<button type="button" class="btn secondary" data-press>Discard</button>{/snippet}
					</Sheet>
				</Specimen>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="g-menus">
			<div class="card-head"><h2 id="g-menus">Menus</h2><span class="card-note">A checked item is charcoal with a check, never colour alone</span></div>
			<div class="grid">
				<Specimen label="Add to collection" note="Toggling a collection saves at once. The list scrolls past a screenful.">
					<Menu name="Add to collection" mode="check" items={collectionItems} maxBlock="22rem" />
				</Specimen>
				<Specimen label="Add to collection · none yet" note="Only the New collection item.">
					<Menu name="Add to collection" items={noCollections} />
				</Specimen>
				<Specimen label="Add to collection · New collection" note="Opens in place of the list. Create adds the entry at once." sheet>
					<Sheet inline mode="sheet" title="New collection">
						<div class="field pill invalid">
							<label for="nc-name">Name</label>
							<div class="control"><input id="nc-name" type="text" value="" aria-invalid="true" aria-describedby="nc-err" /></div>
							<p id="nc-err" class="error" role="alert"><Icon name="alert" size={14} />Name is required</p>
						</div>
						{#snippet actions()}{@render cancel('Cancel', false)}<button type="button" class="btn primary arrow" data-press data-focus="halo">Create<span class="circle" aria-hidden="true"><Icon name="arrow" /></span></button>{/snippet}
					</Sheet>
				</Specimen>
				<Specimen label="Status · media" note="Labels per domain: Want to listen, Plan to watch, Want to read.">
					<Menu name="Status" mode="radio" items={mediaStatus} />
				</Specimen>
				<Specimen label="Status · piece" note="Pieces: Wishlist, Owned, Gone. Other Fashion types have no status.">
					<Menu name="Status" mode="radio" items={pieceStatus} />
				</Specimen>
				<Specimen label="Add menu · Music" note="The same items as the “+” sheet inside a domain.">
					<Menu name="Add to Music" items={musicAdd} />
				</Specimen>
				<Specimen label="Add menu · Fashion" note="Brand and shop are one item; Piece opens as Owned on Wardrobe.">
					<Menu name="Add to Fashion" items={fashionAdd} />
				</Specimen>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="g-rows">
			<div class="card-head"><h2 id="g-rows">Row and selection menus</h2><span class="card-note">On a phone these hold what the desktop shows as buttons</span></div>
			<div class="grid">
				<Specimen label="Collection row" note="Named “Actions for {rowTitle.slice(0, 40)}”. Move up and Move down are left out where they don't apply.">
					<Menu name="Actions for {rowTitle}" items={midRow} />
				</Specimen>
				<Specimen label="Collection row · first entry" note="No Move up on the first entry.">
					<Menu name="Actions for {rowTitle}" items={firstRow} />
				</Specimen>
				<Specimen label="Collection row · last entry" note="No Move down on the last entry.">
					<Menu name="Actions for {rowTitle}" items={lastRow} />
				</Specimen>
				<Specimen label="Selection bar · More, in a list" note="On a phone the main action is Set status, else Add tag; the rest sits here.">
					<Menu name="More" items={listMore} />
				</Specimen>
				<Specimen label="Selection bar · More, mixed types" note="Set status is absent when the selection mixes status sets, so the main action is Add tag and More holds Remove tag.">
					<Menu name="More" items={mixedMore} />
				</Specimen>
				<Specimen label="Selection bar · More, in a collection" note="Move to top is the main action; the rest sits here.">
					<Menu name="More" items={collectionMore} />
				</Specimen>
			</div>
		</section>

		<section class="card panel" data-surface="solid" aria-labelledby="g-tags">
			<div class="card-head"><h2 id="g-tags">Tag picker</h2><span class="card-note">Select mode · applies to every selected entry at once</span></div>
			<div class="grid">
				<Specimen label="Add tag" note="Existing tags plus the typed name as a new one." sheet>
					<Sheet inline mode="sheet" title="Add tag">
						<div class="field pill">
							<label for="tp-add">Tag</label>
							<div class="control" data-drawn-focus><input id="tp-add" type="text" value={typed} /></div>
						</div>
						<ul class="chips" aria-label="Existing tags">
							<li><button type="button" class="chip" data-new><span class="lead"><Icon name="plus" size={16} /></span><span class="t">Create “{typed}”</span></button></li>
							{#each tags as tag (tag.name)}
								<li><button type="button" class="chip" title={tag.name}><span class="t">{tag.name}</span><span class="c">{tag.count.toLocaleString('en-GB')}</span></button></li>
							{/each}
						</ul>
						{#snippet actions()}{@render cancel('Cancel', false)}{/snippet}
					</Sheet>
				</Specimen>
				<Specimen label="Remove tag" note="Only tags present on the selection, with how many of the five entries carry each." sheet>
					<Sheet inline mode="sheet" title="Remove tag">
						<ul class="chips" aria-label="Tags on the selection">
							{#each onSelection as tag, i (tag.name)}
								<li><button type="button" class="chip" title={tag.name}><span class="t">{tag.name}</span><span class="c">{(i % 3) + 1} of 5</span></button></li>
							{/each}
						</ul>
						{#snippet actions()}{@render cancel('Cancel', false)}{/snippet}
					</Sheet>
				</Specimen>
				<Specimen label="Remove tag · none on the selection" sheet>
					<Sheet inline mode="sheet" title="Remove tag">
						<p class="sheet-text">None of the selected entries has a tag.</p>
						{#snippet actions()}{@render cancel('Close')}{/snippet}
					</Sheet>
				</Specimen>
				<Specimen label="Set status · mixed types" note="No Set status action is offered when the selection mixes status sets, so there is no sheet to draw.">
					<p class="sheet-text none">Offered only when every selected entry shares one status set.</p>
				</Specimen>
			</div>
		</section>
	</div>
</Frame>

<style>
	.panel { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-5); padding: var(--space-6); min-inline-size: 0; }
	.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr)); gap: var(--space-5); align-items: start; }
	.link { color: var(--ink); text-underline-offset: 0.2em; }
	.none { align-self: center; padding-inline: var(--space-4); text-align: center; }
	.chips { max-block-size: 16rem; overflow-y: auto; }
	.chip .lead { display: inline-flex; }
	@media (max-width: 767px) {
		.panel { padding: var(--space-4); }
	}
</style>
