<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import Button from '#lib/components/button/Button.svelte';
	import Menu from '#lib/components/menu/Menu.svelte';
	import { portal } from '#lib/components/portal/portal.ts';
	import { COPY, withCount } from '#lib/copy.ts';
	import { POSTURE_SWITCH } from '#lib/shell/nav.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import type { Selection } from './selection.svelte.ts';

	// The selection bar (G4), shared by the list and the collection: desktop sticky above the list with every action; phone
	// docked at the bottom above the safe area with the count, actions[0] as the main action and the rest behind "More".
	type Action = { id: string; label: string; disabled?: boolean; onrun: () => void };
	let { selection, label, actions }: { selection: Selection; label: string; actions: Action[] } = $props();

	const id = $props.id();
	const wide = new MediaQuery(`min-width: ${POSTURE_SWITCH}px`, true);
	let more = $state(false);

	const none = $derived(selection.count === 0);
	const dock = $derived(!wide.current);
	const main = $derived(actions[0]);
	const rest = $derived(actions.slice(1));

	// the docked bar's height keeps a focused card scrolled clear of it (scroll-padding on the page)
	let dockHeight = $state(0);
	$effect(() => {
		if (!dock) return;
		const root = document.documentElement;
		root.setAttribute('data-select-docked', '');
		return () => {
			root.removeAttribute('data-select-docked');
			root.style.removeProperty('--select-dock-height');
		};
	});
	$effect(() => {
		if (dock) document.documentElement.style.setProperty('--select-dock-height', `${dockHeight}px`);
	});

	// The button that entered Select mode goes away with it, so focus moves to the first toggle on the way in and back
	// to "Select" on the way out instead of dropping to the body.
	onMount(() => document.querySelector<HTMLElement>('main [data-pick]')?.focus());

	async function leave() {
		selection.leave();
		await tick();
		document.querySelector<HTMLElement>('main [data-select-enter]')?.focus();
	}

	// focus lands on the title, but the ring is the whole card: on the phone bring all of it clear of the docked bar
	// (keyboard focus only; scrolling under a pointer would move the card away from the click)
	function onfocusin(event: FocusEvent) {
		const target = event.target as HTMLElement;
		if (dock && target.matches?.('[data-pick]:focus-visible')) target.closest('article, li')?.scrollIntoView({ block: 'nearest' });
	}

	// Escape leaves Select mode unless it closes something else first (a menu or a dialog)
	function onkeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape' || event.defaultPrevented || document.querySelector(':popover-open, dialog[open]')) return;
		leave();
	}

	function run(action: Action) {
		more = false;
		action.onrun();
	}
</script>

<svelte:window {onkeydown} {onfocusin} />

{#snippet bar()}
	<div class="bar" data-mode={dock ? 'phone' : 'desktop'} role="region" aria-label={label}>
		<p class="count" role="status"><span class="n figures">{selection.count}</span> {COPY.selected.replace('N ', '')}</p>
		{#if dock}
			<div class="dock-acts">
				{#if main}<Button variant="primary" size="s" disabled={none || main.disabled} onclick={() => run(main)}>{main.label}</Button>{/if}
				{#if rest.length}
					<Button variant="secondary" size="s" disabled={none} popovertarget="{id}-more" aria-haspopup="menu" aria-expanded={more}>
						{COPY.more}<Icon name="chevron-down" size={14} />
					</Button>
					<Menu id="{id}-more" name="More actions" align="end" bind:open={more}>
						{#each rest as action (action.id)}
							<button type="button" class="menu-item" role="menuitem" tabindex="-1" disabled={action.disabled} onclick={() => run(action)}>{action.label}</button>
						{/each}
					</Menu>
				{/if}
			</div>
			<Button variant="secondary" size="s" class="done" onclick={leave}><Icon name="check" size={16} />{COPY.done}</Button>
		{:else}
			<div class="acts">
				{#each actions as action (action.id)}
					<Button variant="secondary" size="s" disabled={none || action.disabled} onclick={() => run(action)}>{action.label}</Button>
				{/each}
			</div>
			<Button variant="primary" size="s" arrow class="done" onclick={leave}>{COPY.done}</Button>
		{/if}
	</div>
{/snippet}

{#if dock}
	<div class="sel-dock" use:portal bind:offsetHeight={dockHeight}>{@render bar()}</div>
{:else}
	<div class="inline">{@render bar()}</div>
{/if}

<style>
	.inline {
		position: sticky;
		inset-block-start: var(--sticky-block-start, var(--space-3));
		z-index: var(--z-rail);
		margin-inline: var(--space-5);
	}
	.bar {
		container-type: inline-size;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2) var(--space-4);
		padding: var(--space-1-5) var(--space-1-5) var(--space-1-5) var(--space-5);
		border-radius: var(--radius-bar);
		background: var(--surface-glass-strong);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--elevation-card);
		color: var(--ink);
	}
	.bar[data-mode='desktop'] {
		background: var(--surface-raised);
		-webkit-backdrop-filter: none;
		backdrop-filter: none;
		border: var(--stroke-hairline) solid var(--edge-control);
	}
	.count {
		min-inline-size: 7rem;
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--weight-semibold);
	}
	.n {
		margin-inline-end: var(--space-1-5);
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-s-size);
		line-height: 1;
		color: var(--accent-text);
	}
	.bar :global(.btn.secondary) {
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
	}
	.bar :global(.btn.secondary:disabled) {
		background: var(--surface-tint);
		box-shadow: none;
	}
	.acts {
		display: flex;
		flex: 1 1 26rem;
		flex-wrap: wrap;
		gap: var(--space-2);
		min-inline-size: 0;
	}
	.bar > :global(.done.arrow) {
		margin-inline-start: auto;
	}
	@container (max-width: 44rem) {
		.bar[data-mode='desktop'] > :global(.done) {
			order: 2;
		}
		.bar[data-mode='desktop'] .acts {
			order: 3;
			flex-basis: 100%;
		}
	}

	.bar[data-mode='phone'] {
		gap: var(--space-2);
		padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4);
		border-radius: var(--radius-bar-compact);
	}
	.bar[data-mode='phone'] .count {
		display: grid;
		flex: none;
		min-inline-size: 0;
		font-size: var(--type-caption-size);
		line-height: 1;
		color: var(--ink-secondary);
	}
	.dock-acts {
		display: flex;
		flex: 1 1 0;
		gap: var(--space-2);
		min-inline-size: 0;
		justify-content: flex-end;
	}
	.dock-acts :global(.btn) {
		white-space: nowrap;
	}
	@container (max-width: 24rem) {
		.bar[data-mode='phone'] .count {
			flex: 1 1 0;
		}
		.bar[data-mode='phone'] > :global(.done) {
			order: 2;
		}
		.bar[data-mode='phone'] .dock-acts {
			order: 3;
			flex-basis: 100%;
			justify-content: stretch;
		}
		.dock-acts > :global(.btn) {
			flex: 1;
		}
	}
	.sel-dock {
		position: fixed;
		inset-inline: var(--space-3);
		inset-block-end: max(var(--space-3), env(safe-area-inset-bottom));
		z-index: var(--z-rail);
	}
	:global(html[data-select-docked] .dock) {
		visibility: hidden;
	}
	:global(html[data-select-docked]) {
		scroll-padding-block-end: calc(var(--select-dock-height, 0px) + var(--space-3) * 2);
	}
	:global(html[data-select-docked] .screen-body) {
		padding-block-end: 9rem;
	}
</style>
