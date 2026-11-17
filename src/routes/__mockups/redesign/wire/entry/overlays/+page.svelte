<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { dataFor, entryFor, statusLabels } from '../../list/parts/data.ts';
	import Dialog from '../../list/parts/Dialog.svelte';
	import Icon from '../../list/parts/Icon.svelte';
	import Panel from '../../list/parts/Panel.svelte';
	import '../../list/parts/wire.css';

	const fx = $derived(dataFor(page.url));
	const title = $derived(entryFor(fx, 'album').title);
	const statuses = ['No status', ...statusLabels('album')];
	const collections = $derived(fx.collections.map((c) => c.name));
</script>

<svelte:head><title>Entry menus and dialogs (wireframe)</title></svelte:head>

<Frame world="music" section="music">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Music</li><li>Albums</li></ul>
			<h1>Entry <em class="accent-word">menus</em></h1>
			<p class="lede">Status, Add to collection and Delete as they open from the entry page.</p>
		</div>
	</div>
	<div class="screen-body w-gallery">
		<Panel title="Status menu" note="Exactly one row checked; the options are the domain’s labels plus No status. Arrows, Home, End, Escape; focus returns to the button">
			<div class="w-stack">
				<button type="button" class="w-btn" aria-haspopup="menu" aria-expanded="true">Status: Listening<Icon name="chevron-down" size={14} /></button>
				<ul class="w-menu" role="menu" aria-label="Status">
					{#each statuses as s (s)}
						<li role="none"><button type="button" class="w-menu-item" role="menuitemradio" aria-checked={s === 'Listening'}><Icon name="check" size={16} /><span class="w-grow">{s}</span></button></li>
					{/each}
				</ul>
			</div>
		</Panel>
		<Panel title="Add to collection" note="Every collection with a check for those holding this entry; a row toggles membership at once. New collection asks for a name">
			<div class="w-stack">
				<button type="button" class="w-btn" aria-haspopup="menu" aria-expanded="true"><Icon name="plus" size={16} />Add to collection<Icon name="chevron-down" size={14} /></button>
				<ul class="w-menu" role="menu" aria-label="Add to collection" data-scroll>
					{#each collections as c, i (c + i)}
						<li role="none"><button type="button" class="w-menu-item" role="menuitemcheckbox" aria-checked={i === 0}><Icon name="check" size={16} /><span class="w-grow">{c}</span></button></li>
					{/each}
					<li class="w-menu-rule" role="separator"></li>
					<li role="none"><button type="button" class="w-menu-item" role="menuitem" data-new><Icon name="plus" size={16} /><span class="w-grow">New collection</span></button></li>
				</ul>
			</div>
		</Panel>
		<Panel title="New collection" note="Creates the collection and adds this entry at once">
			<Dialog title="New collection">
				<label class="w-field" data-invalid="">
					<span class="w-label">Name</span>
					<input class="w-input" type="text" value="" aria-invalid="true" aria-describedby="nc-e" />
					<span class="w-error" id="nc-e" role="alert"><Icon name="alert" size={14} />Name is required</span>
				</label>
				{#snippet actions()}
					<button type="button" class="w-btn">Cancel</button>
					<button type="button" class="w-btn primary">Create<span class="circle" aria-hidden="true"><Icon name="arrow" size={14} /></span></button>
				{/snippet}
			</Dialog>
		</Panel>
		<Panel title="Delete this album?" note="Never the page’s primary action. Cancel has the focus, Escape cancels, focus returns to Delete. Brands and shops say “Delete this shop?” by Kind">
			<Dialog title="Delete this album?" alert>
				<p><strong>{title}</strong></p>
				<p>It leaves your collections and its history goes with it.</p>
				{#snippet actions()}
					<button type="button" class="w-btn" data-focus="halo">Cancel</button>
					<button type="button" class="w-btn danger"><Icon name="trash" size={16} />Delete</button>
				{/snippet}
			</Dialog>
		</Panel>
	</div>
</Frame>
