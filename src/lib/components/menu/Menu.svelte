<!--
	Menu: app-owned primitive on the fingerprint's Menu (DESIGN-reference "Menu").
	A popover (top layer, so a menu opened inside the frame is not clipped or re-anchored by the
	frame's backdrop-filter) anchored to the button that carries popovertarget={id}. Put
	aria-haspopup="menu" and aria-expanded={open} on that button. Items are plain buttons inside
	the children: class "menu-item" with role menuitem, menuitemradio or menuitemcheckbox and
	aria-checked; a leading svg is the check slot; a div.menu-rule separates. Opens and closes
	with a short fade and scale out of its button's corner (the bottom one when it flips above the
	button; --motion-quick; Rue, gate 7), at once under
	reduced motion; a closing menu is hidden from assistive tech and takes no input. Focus goes to the checked item, else the first; ArrowUp/Down,
	Home and End move; Escape closes and returns focus to the button; Tab closes. A checked
	radio item is the charcoal pill (one choice); a checked checkbox item is a check on a
	sunken row (several choices).
	Props: id, name (accessible name), open (bindable), align (start | end), children.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = { id: string; name: string; open?: boolean; align?: 'start' | 'end'; children: Snippet };
	let { id, name, open = $bindable(false), align = 'start', children }: Props = $props();

	const anchor = $derived(`--menu-${id}`);
	let menu = $state<HTMLDivElement>();
	let trigger: HTMLElement | null = null;
	// position-try flipped the menu above its button, so it grows out of its bottom corner
	let above = false;

	const items = () => [...(menu?.querySelectorAll<HTMLElement>('.menu-item:not(:disabled)') ?? [])];

	$effect(() => {
		if (!menu) return;
		trigger = document.querySelector<HTMLElement>(`[popovertarget="${id}"]`);
		trigger?.style.setProperty('anchor-name', anchor);
	});

	// position-try picks the side during layout, and a resize observer runs after layout but before that frame is painted, so
	// the menu has its corner on its first visible frame (the toggle event comes a frame or two late); the toggle check
	// below covers a menu reopened while it still fades out, which keeps its size
	$effect(() => {
		if (!menu) return;
		const observer = new ResizeObserver(() => menu!.matches(':popover-open') && face());
		observer.observe(menu);
		return () => observer.disconnect();
	});

	function face() {
		const flipped = menu!.getBoundingClientRect().top < (trigger?.getBoundingClientRect().top ?? 0);
		if (flipped === above) return false;
		above = flipped;
		menu!.style.transformOrigin = `${above ? 'bottom' : 'top'} ${align === 'end' ? 'right' : 'left'}`;
		return true;
	}

	$effect(() => {
		if (!menu) return;
		const shown = menu.matches(':popover-open');
		if (open && !shown) menu.showPopover();
		else if (!open && shown) menu.hidePopover();
	});

	function ontoggle(event: Event) {
		const next = (event as ToggleEvent).newState === 'open';
		open = next;
		// it stays rendered while it fades out; set before the focus below, which an inert menu would refuse
		menu!.inert = !next;
		if (next) menu!.removeAttribute('aria-hidden');
		else menu!.setAttribute('aria-hidden', 'true');
		if (next) {
			// a late flip starts the opening fade again from its new corner
			if (face()) for (const animation of menu!.getAnimations()) animation.currentTime = 0;
			const all = items();
			(all.find((el) => el.getAttribute('aria-checked') === 'true') ?? all[0])?.focus();
		} else if (!document.activeElement || document.activeElement === document.body || menu?.contains(document.activeElement)) {
			trigger?.focus();
		}
	}

	function onkeydown(event: KeyboardEvent) {
		const all = items();
		const at = all.indexOf(document.activeElement as HTMLElement);
		const moves: Record<string, number> = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: all.length - 1 };
		if (event.key in moves) {
			event.preventDefault();
			all[(moves[event.key] + all.length) % all.length]?.focus();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			open = false;
		} else if (event.key === 'Tab') {
			trigger?.focus();
			open = false;
		}
	}
</script>

<div bind:this={menu} class={['menu', align]} {id} role="menu" aria-label={name} popover="auto" tabindex="-1" style:position-anchor={anchor} {ontoggle} {onkeydown}>
	{@render children()}
</div>

<style>
	.menu {
		position: fixed;
		position-try-fallbacks: flip-block;
		inset: auto;
		top: anchor(bottom);
		left: anchor(left);
		margin: var(--space-1-5) 0;
		display: grid;
		align-content: start;
		gap: var(--space-0-5);
		min-inline-size: max(220px, anchor-size(width));
		max-inline-size: min(320px, 100vw - 2 * var(--space-4));
		max-block-size: min(22rem, 60dvh);
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: var(--space-1-5);
		border: 0;
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--elevation-menu);
		color: var(--ink);
		transform-origin: top left;
		transition:
			opacity var(--motion-quick) var(--ease-out),
			transform var(--motion-quick) var(--ease-out),
			display var(--motion-quick) allow-discrete,
			overlay var(--motion-quick) allow-discrete;
	}
	.menu.end {
		left: auto;
		right: anchor(right);
		transform-origin: top right;
	}
	.menu:not(:popover-open) {
		display: none;
		opacity: 0;
		transform: scale(var(--press-scale));
		pointer-events: none;
	}
	@starting-style {
		.menu:popover-open {
			opacity: 0;
			transform: scale(var(--press-scale));
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.menu {
			transition: none;
		}
	}

	.menu :global(.menu-item) {
		display: flex;
		align-items: center;
		gap: var(--space-2-5);
		inline-size: 100%;
		min-block-size: max(var(--control-height-s), var(--target));
		padding: 0 var(--space-3-5) 0 var(--space-3);
		border: 0;
		border-radius: var(--radius-item);
		background: none;
		color: var(--ink);
		font-size: var(--type-body-s-size);
		text-align: start;
		overflow-wrap: anywhere;
	}
	.menu :global(.menu-item > svg) {
		flex: none;
		visibility: hidden;
	}
	.menu :global(.menu-item[aria-checked='true']) {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}
	.menu :global(.menu-item[role='menuitemcheckbox'][aria-checked='true']) {
		background: var(--surface-sunken);
		color: var(--ink);
	}
	.menu :global(.menu-item[aria-checked='true'] > svg) {
		visibility: visible;
	}
	.menu :global(.menu-item.create > svg) {
		visibility: visible;
	}
	.menu :global(.menu-item:focus-visible) {
		outline-offset: calc(-1 * var(--focus-width));
	}
	.menu :global(.menu-item[role='menuitemradio'][aria-checked='true']:focus-visible) {
		outline-color: var(--focus-ring-on-inverse);
		box-shadow: var(--focus-halo);
	}
	@media (hover: hover) {
		.menu :global(.menu-item:not([role='menuitemradio'][aria-checked='true']):hover) {
			background: var(--surface-sunken);
		}
	}
	.menu :global(.menu-rule) {
		block-size: var(--stroke-hairline);
		margin: var(--space-1) var(--space-2);
		background: var(--hairline);
	}
</style>
