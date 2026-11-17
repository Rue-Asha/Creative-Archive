<script lang="ts">
	import Icon from './Icon.svelte';
	import type { Item } from './Menu.svelte';
	import './overlays.css';

	// The live menu: a "…" button and a popover anchored to it (DESIGN-reference "Menu"): arrows, Home and End move, Escape closes and
	// returns focus to the button (a "…" icon button, or a labelled one such as the selection bar's "More"), picking an item runs it and closes. Items that don't apply are left out, not disabled.
	type Entry = Item & { onrun?: () => void };
	let { name, items, text, open = $bindable(false), shown = false }: { name: string; items: Entry[]; text?: string; open?: boolean; shown?: boolean } = $props();
	const id = $props.id();
	let menu = $state<HTMLElement>();
	let button = $state<HTMLButtonElement>();

	const buttons = () => [...(menu?.querySelectorAll<HTMLButtonElement>('button.menu-item:not(:disabled)') ?? [])];
	function ontoggle(e: Event) {
		open = (e as ToggleEvent).newState === 'open';
		if (open) buttons()[0]?.focus();
	}
	function onkey(e: KeyboardEvent) {
		const all = buttons();
		const at = all.indexOf(document.activeElement as HTMLButtonElement);
		const to = e.key === 'ArrowDown' ? (at + 1) % all.length : e.key === 'ArrowUp' ? (at - 1 + all.length) % all.length : e.key === 'Home' ? 0 : e.key === 'End' ? all.length - 1 : -1;
		if (to < 0) return;
		e.preventDefault();
		all[to].focus();
	}
	// a specimen opens the menu on load, when its button is on screen
	$effect(() => {
		if (!shown || !button?.offsetParent) return;
		button.scrollIntoView({ block: 'center' });
		menu?.showPopover();
	});
	function run(item: Entry) {
		menu?.hidePopover();
		item.onrun?.();
	}
</script>

<button
	bind:this={button}
	type="button"
	class="btn s"
	class:icon={!text}
	class:secondary={true}
	aria-label={text ? undefined : name}
	aria-haspopup="menu"
	aria-expanded={open}
	aria-controls="m-{id}"
	popovertarget="m-{id}"
	style="anchor-name: --m-{id}"
	data-press="round"
>{#if text}{text}<Icon name="chevron" size={16} />{:else}<Icon name="more" size={20} />{/if}</button>
<div bind:this={menu} class="menu end" id="m-{id}" role="menu" tabindex="-1" popover aria-label={name} style="position-anchor: --m-{id}" {ontoggle} onkeydown={onkey}>
	{#each items as item, i (i)}
		{#if item.sep}<div class="menu-rule" role="separator"></div>{/if}
		<button type="button" class="menu-item" class:danger={item.danger} role="menuitem" tabindex="-1" disabled={item.disabled} onclick={() => run(item)}>
			{#if item.danger}<span class="lead"><Icon name="trash" size={16} /></span>{:else if item.icon}<span class="lead"><Icon name={item.icon} size={16} /></span>{/if}
			<span class="text">{item.label}</span>
		</button>
	{/each}
</div>
