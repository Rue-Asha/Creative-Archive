<script lang="ts">
	import Icon from '../shell/Icon.svelte';
	import { plural } from '../shell/data.ts';
	import Glyph from '../list/Glyph.svelte';
	import { statusSet, type ListDef } from '../list/data.ts';

	// Set status, Add tag and Remove tag on the sheet primitive: a bottom sheet on the phone, a centred dialog from 768 px.
	type Props = {
		kind: 'status' | 'tag-add' | 'tag-remove';
		def: ListDef;
		count: number;
		tags?: { name: string; count: number }[];
		query?: string;
		inline?: boolean;
		open?: boolean;
		onclose?: () => void;
	};
	let { kind, def, count, tags = [], query = '', inline = false, open = false, onclose }: Props = $props();

	const uid = $props.id();
	let dialog = $state<HTMLDialogElement>();
	$effect(() => {
		if (inline || !dialog) return;
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});

	const what = $derived(plural(count, def.one, def.many));
	const title = $derived(kind === 'status' ? `Set status for ${what}` : kind === 'tag-add' ? `Add a tag to ${what}` : `Remove a tag from ${what}`);
	const options = $derived(statusSet(def) ?? []);
	const shown = $derived(query ? tags.filter((t) => t.name.toLowerCase().includes(query.toLowerCase())) : tags);
	const exact = $derived(tags.some((t) => t.name.toLowerCase() === query.trim().toLowerCase()));
</script>

<dialog bind:this={dialog} class="sheet" class:inline data-sheet open={inline || undefined} aria-labelledby="{uid}-t" onclose={() => onclose?.()} onclick={(e) => !inline && e.target === dialog && dialog?.close()}>
	<header>
		<div>
			<p class="kicker">Selection</p>
			<h2 id="{uid}-t">{title}</h2>
		</div>
		<button type="button" class="close" aria-label="Close" data-press="round" onclick={() => (inline ? onclose?.() : dialog?.close())}><Icon name="close" /></button>
	</header>
	<div class="body">
		{#if kind === 'status'}
			<div class="list" role="menu" aria-label="Status">
				{#each options as s (s)}<button type="button" class="menu-item" role="menuitemradio" aria-checked="false"><Icon name="check" size={16} />{s}</button>{/each}
			</div>
			<p class="hint">Picking a row sets it for every selected entry at once. No row is checked while the selection mixes statuses.</p>
		{:else}
			{#if kind === 'tag-add'}
				<div class="field pill">
					<label for="{uid}-q">Add a tag</label>
					<div class="control"><input id="{uid}-q" type="text" value={query} placeholder="Tag name" autocomplete="off" /></div>
				</div>
			{:else}
				<p class="hint">Only tags on the selection are listed. The number says how many of the {count} carry it.</p>
			{/if}
			<div class="list" role="menu" aria-label="Tags">
				{#each shown as t (t.name)}
					<button type="button" class="menu-item tag" role="menuitem">
						<Glyph name="tag" size={16} /><span class="grow">{t.name}</span>
						<span class="meta figures">{kind === 'tag-add' ? plural(t.count, 'entry', 'entries') : `on ${Math.min(t.count, count)} of ${count}`}</span>
					</button>
				{/each}
				{#if kind === 'tag-add' && query.trim() && !exact}
					<button type="button" class="menu-item tag new" role="menuitem"><Icon name="plus" size={16} /><span class="grow">Create “{query.trim()}”</span></button>
				{/if}
			</div>
			{#if shown.length === 0 && !(kind === 'tag-add' && query.trim())}
				<p class="hint">{kind === 'tag-add' ? 'No tags yet. Type a name to create the first one.' : 'None of the selected entries has a tag.'}</p>
			{/if}
		{/if}
	</div>
	<footer><button type="button" class="btn secondary" data-press onclick={() => (inline ? onclose?.() : dialog?.close())}>Cancel</button></footer>
</dialog>

<style>
	dialog.inline { position: relative; max-block-size: none; inset: auto; display: flex; inline-size: 100%; max-inline-size: 32rem; margin: 0; border-radius: var(--radius-card); animation: none; box-shadow: var(--elevation-card); }
	.body { display: flex; flex-direction: column; gap: var(--space-4); -webkit-mask-image: linear-gradient(to bottom, var(--ink) calc(100% - var(--space-5)), transparent); mask-image: linear-gradient(to bottom, var(--ink) calc(100% - var(--space-5)), transparent); }
	.body > :global(*) { flex: none; }
	.list { display: grid; gap: var(--space-0-5); }
	.menu-item { inline-size: 100%; }
	.menu-item.tag > :global(svg) { visibility: visible; }
	.grow { flex: 1; min-inline-size: 0; overflow-wrap: anywhere; }
	.meta { flex: none; font-size: var(--type-caption-size); color: var(--ink-secondary); font-weight: var(--weight-regular); }
	.new { font-weight: var(--weight-medium); }
	.hint { font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-secondary); }
</style>
