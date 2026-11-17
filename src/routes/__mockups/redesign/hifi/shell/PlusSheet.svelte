<script lang="ts">
	import type { Domain } from '../../fixtures.ts';
	import { addGroups, href, sheetTitle } from './data.ts';
	import Icon from './Icon.svelte';

	type Props = { scope: Domain | 'all'; list?: string; worst?: boolean; open?: boolean; inline?: boolean; onclose?: () => void };
	let { scope, list, worst = false, open = false, inline = false, onclose }: Props = $props();

	const groups = $derived(addGroups(scope));
	const uid = $props.id();
	let dialog = $state<HTMLDialogElement>();

	$effect(() => {
		if (inline || !dialog) return;
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});
</script>

<dialog
	bind:this={dialog}
	class="sheet"
	class:inline
	data-sheet
	open={inline || undefined}
	aria-labelledby="{uid}-title"
	onclose={() => onclose?.()}
	onclick={(e) => !inline && e.target === dialog && dialog?.close()}
>
	<header>
		<div>
			<p class="kicker">New entry</p>
			<h2 id="{uid}-title">{sheetTitle(scope)}</h2>
		</div>
		<button type="button" class="close" aria-label="Close" data-press="round" onclick={() => (inline ? onclose?.() : dialog?.close())}><Icon name="close" /></button>
	</header>
	<div class="body">
		{#each groups as group (group.domain)}
			<div class="group" role="group" aria-labelledby={scope === 'all' ? `${uid}-${group.domain}` : `${uid}-title`}>
				{#if scope === 'all'}<h3 class="ruled" id="{uid}-{group.domain}">{group.label}</h3>{/if}
				<ul>
					{#each group.items as item (item.type)}
						<li>
							<a class="chip" href={href('add', worst, `type=${item.type}`)} data-press data-type={item.type}>
								{item.label}{#if list === 'wardrobe' && item.type === 'piece'}<span class="n">Owned</span>{/if}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
		{#if list === 'wardrobe'}<p class="hint">Opened from Wardrobe: a new piece starts as Owned.</p>{/if}
	</div>
</dialog>

<style>
	dialog.inline { position: relative; inset: auto; display: flex; inline-size: 100%; max-inline-size: 32rem; margin: 0; border-radius: var(--radius-card); animation: none; box-shadow: var(--elevation-card); }
	.body { display: grid; gap: var(--space-5); align-content: start; padding-block-end: max(var(--space-6), env(safe-area-inset-bottom)); }
	.group { display: grid; gap: var(--space-3); min-inline-size: 0; }
	ul { display: flex; flex-wrap: wrap; gap: var(--space-2); margin: 0; padding: 0; list-style: none; }
	.chip {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		max-inline-size: 100%;
		min-block-size: max(var(--control-height), var(--target));
		padding-inline: var(--space-5);
		border-radius: var(--radius-pill);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
		text-decoration: none;
		overflow-wrap: anywhere;
	}
	.chip .n { font-weight: var(--weight-regular); color: var(--ink-secondary); }
	.chip .n::before { content: "· " / ""; }
	@media (hover: hover) {
		.chip:hover { background: var(--surface-sunken); }
	}
	.hint { font-size: var(--type-caption-size); line-height: var(--type-caption-line); color: var(--ink-secondary); }
</style>
