<script module lang="ts">
	export type BarAction = { id: string; label: string; disabled?: boolean; danger?: boolean; menu?: boolean; onrun?: () => void };
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { MediaQuery } from 'svelte/reactivity';
	import Icon from '../shell/Icon.svelte';
	import Glyph from '../list/Glyph.svelte';
	import { fmt } from '../shell/data.ts';
	import { portal } from '../overlays/portal.ts';

	// The selection bar (G4), shared with the collection's Select (U11): desktop sticky above the list with every action;
	// phone docked at the bottom above the safe area with the count, actions[0] as the main action and the rest behind "More".
	// `posture` forces one of them inline for the state galleries; `auto` follows the 1024 px posture switch.
	type Props = {
		count: number;
		actions: BarAction[];
		doneHref?: string;
		ondone?: () => void;
		posture?: 'auto' | 'desktop' | 'phone';
		open?: string | null;
		moreOpen?: boolean;
		onselect?: (id: string) => void;
	};
	let { count, actions, doneHref = '#', ondone, posture = 'auto', open = null, moreOpen = false, onselect }: Props = $props();

	const uid = $props.id();
	const wide = new MediaQuery('min-width: 1024px', true);
	const mode = $derived(posture === 'auto' ? (wide.current ? 'desktop' : 'phone') : posture);
	const live = $derived(posture === 'auto');
	const none = $derived(count === 0);
	const text = $derived(none ? 'Nothing selected' : `${fmt(count)} selected`);
	const main = $derived(actions[0]);
	const rest = $derived(actions.slice(1));
	const run = (a: BarAction) => {
		a.onrun?.();
		onselect?.(a.id);
	};

	$effect(() => {
		if (!live || mode !== 'phone') return;
		document.documentElement.setAttribute('data-select-docked', '');
		return () => document.documentElement.removeAttribute('data-select-docked');
	});
</script>

<svelte:window onkeydown={(e) => live && !ondone && e.key === 'Escape' && !document.querySelector(':popover-open') && goto(doneHref)} />

{#snippet countText()}
	<p class="count" role="status"><span class="n figures">{none ? '0' : fmt(count)}</span>{none ? ' selected' : ' selected'}<span class="sr-only">{none ? ', nothing selected' : ''}</span></p>
{/snippet}

{#snippet actionButton(a: BarAction, primary: boolean)}
	<button
		type="button"
		class="btn s {a.danger ? 'danger' : primary ? 'primary' : 'secondary'}"
		disabled={a.disabled || none}
		aria-haspopup={a.menu ? 'menu' : undefined}
		aria-expanded={a.menu ? open === a.id : undefined}
		data-press
		data-focus={primary ? 'halo' : undefined}
		onclick={() => run(a)}
	>{a.label}{#if a.menu}<Glyph name="chevron-down" size={14} />{/if}</button>
{/snippet}

{#snippet done()}
	{#if mode === 'desktop'}
		{#if ondone}
			<button type="button" class="btn primary arrow s" data-press data-focus="halo" onclick={ondone}>Done<span class="circle" aria-hidden="true"><Icon name="check" size={16} /></span></button>
		{:else}
			<a class="btn primary arrow s" href={doneHref} data-press data-focus="halo">Done<span class="circle" aria-hidden="true"><Icon name="check" size={16} /></span></a>
		{/if}
	{:else if ondone}
		<button type="button" class="btn secondary s done" data-press onclick={ondone}><Icon name="check" size={16} /><span class="done-label">Done</span></button>
	{:else}
		<a class="btn secondary s done" href={doneHref} data-press><Icon name="check" size={16} /><span class="done-label">Done</span></a>
	{/if}
{/snippet}

{#snippet bar()}
	<div class="bar" data-mode={mode} role="region" aria-label="Selection">
		{@render countText()}
		{#if mode === 'desktop'}
			<div class="acts">{#each actions as a (a.id)}{@render actionButton(a, false)}{/each}</div>
		{:else}
			<div class="dock-acts">
				{#if main}{@render actionButton(main, true)}{/if}
				{#if rest.length}
					<span class="more-host">
						<button
							type="button"
							class="btn s secondary"
							aria-haspopup="menu"
							aria-expanded={moreOpen}
							aria-controls="{uid}-more"
							popovertarget={live ? `${uid}-more` : undefined}
							style:anchor-name="--{uid}-more"
							disabled={none}
							data-press
						>More<Glyph name="chevron-down" size={14} /></button>
						{#if live}
							<div class="menu" id="{uid}-more" role="menu" popover aria-label="More actions" style:position-anchor="--{uid}-more">
								{#each rest as a (a.id)}<button type="button" class="menu-item" class:danger={a.danger} role="menuitem" onclick={() => run(a)}>{a.label}</button>{/each}
							</div>
						{:else if moreOpen}
							<div class="static-menu" role="menu" aria-label="More actions">
								{#each rest as a (a.id)}<button type="button" class="menu-item" class:danger={a.danger} role="menuitem">{a.label}</button>{/each}
							</div>
						{/if}
					</span>
				{/if}
			</div>
		{/if}
		{@render done()}
	</div>
{/snippet}

{#if live && mode === 'phone'}
	<div class="sel-dock" use:portal>{@render bar()}</div>
{:else}
	<div class="inline" data-mode={mode}>{@render bar()}</div>
{/if}

<style>
	.inline[data-mode="desktop"] { position: sticky; inset-block-start: var(--space-3); z-index: var(--z-rail); }
	@media (min-width: 1024px) {
		.inline[data-mode="desktop"] { inset-block-start: var(--sticky-block-start); }
		.inline[data-mode="desktop"] { margin-inline: var(--space-5); }
		.bar[data-mode="desktop"] { background: var(--surface-raised); -webkit-backdrop-filter: none; backdrop-filter: none; border: var(--stroke-hairline) solid var(--edge-control); }
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
	}
	.count { min-inline-size: 7rem; font-size: var(--type-label-size); line-height: var(--type-label-line); font-weight: var(--weight-semibold); }
	.count .n { margin-inline-end: var(--space-1-5); font-family: var(--font-display); font-weight: var(--weight-display); font-size: var(--type-display-s-size); line-height: 1; color: var(--accent-text); }
	.bar :global(.btn.secondary) { background: var(--surface-raised); box-shadow: var(--ring-control); }
	.bar :global(.btn.secondary:disabled) { background: var(--surface-tint); box-shadow: none; }
	.acts { display: flex; flex: 1; flex-wrap: wrap; gap: var(--space-2); min-inline-size: 0; }
	.bar > :global(.btn.arrow) { margin-inline-start: auto; }
	.acts { flex: 1 1 26rem; }
	@container (max-width: 44rem) {
		.bar[data-mode="desktop"] > :global(.btn.arrow) { order: 2; }
		.bar[data-mode="desktop"] .acts { order: 3; flex-basis: 100%; }
	}

	.bar[data-mode="phone"] { flex-wrap: wrap; gap: var(--space-2); padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4); border-radius: var(--radius-bar-compact); }
	.bar[data-mode="phone"] .count { display: grid; flex: none; min-inline-size: 0; font-size: var(--type-caption-size); line-height: 1; color: var(--ink-secondary); }
	.bar[data-mode="phone"] .count .n { font-size: var(--type-display-s-size); }
	.dock-acts { display: flex; flex: 1 1 0; gap: var(--space-2); min-inline-size: 0; justify-content: flex-end; }
	.dock-acts :global(.btn) { white-space: nowrap; }
	.bar[data-mode="phone"] > :global(.done) { flex: none; }
	@container (max-width: 24rem) {
		.bar[data-mode="phone"] .count { flex: 1 1 0; }
		.bar[data-mode="phone"] > :global(.done) { order: 2; }
		.bar[data-mode="phone"] .dock-acts { order: 3; flex-basis: 100%; justify-content: stretch; }
		.bar[data-mode="phone"] .dock-acts > :global(.btn), .more-host { flex: 1; }
		.more-host > :global(.btn) { inline-size: 100%; }
	}
	.dock-acts > :global(.btn) { flex: 0 1 auto; }
	.more-host { position: relative; display: inline-flex; }
	.more-host :global(.menu) { top: auto; bottom: anchor(top); left: auto; right: anchor(right); position-try-fallbacks: none; }
	.static-menu { position: absolute; inset-block-end: calc(100% + var(--space-1-5)); inset-inline-end: 0; z-index: var(--z-menu); display: grid; gap: var(--space-0-5); min-inline-size: 12rem; padding: var(--space-1-5); border-radius: var(--radius-panel); background: var(--surface-raised); box-shadow: var(--elevation-menu); }
	.done-label { display: inline; }
	@container (max-width: 21rem) { .done-label { display: none; } .done { padding-inline: 0; inline-size: var(--h); } }

	.sel-dock {
		position: fixed;
		inset-inline: var(--space-3);
		inset-block-end: max(var(--space-3), env(safe-area-inset-bottom));
		z-index: var(--z-rail);
	}
	:global(html[data-select-docked] .dock) { visibility: hidden; }
	:global(html[data-select-docked] .screen-body) { padding-block-end: 9rem; }
</style>
