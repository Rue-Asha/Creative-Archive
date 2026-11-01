<script lang="ts">
	import { tick } from 'svelte';
	import { DOMAIN_LABEL, type Domain } from '#lib/domains.ts';
	import { TYPES, TYPES_BY_DOMAIN } from '#lib/entries/config.ts';
	import { fadeSlide, hideOnOutro } from '#lib/motion.ts';
	import Button from '#lib/ui/Button.svelte';

	let { domain }: { domain: Domain } = $props();

	let open = $state(false);
	let root = $state<HTMLDivElement>();
	let menu = $state<HTMLUListElement>();

	async function show() {
		open = true;
		await tick();
		menu?.querySelector<HTMLElement>('a')?.focus();
	}

	function close(refocus = false) {
		open = false;
		if (refocus) root?.querySelector<HTMLElement>('button')?.focus();
	}

	function menuKeys(event: KeyboardEvent) {
		const items = [...(menu?.querySelectorAll<HTMLElement>('a') ?? [])];
		const at = items.indexOf(document.activeElement as HTMLElement);
		const moves: Record<string, number> = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: items.length - 1 };
		if (event.key === 'Escape') {
			event.preventDefault();
			close(true);
		} else if (event.key in moves) {
			event.preventDefault();
			items[(moves[event.key] + items.length) % items.length]?.focus();
		} else if (event.key === 'Tab') close();
	}

	function outside(event: PointerEvent) {
		if (open && root && !root.contains(event.target as Node)) close();
	}
</script>

<svelte:window onpointerdown={outside} />

<div class="add" bind:this={root}>
	<Button variant="accent" icon="plus" arrow={false} aria-haspopup="menu" aria-expanded={open} onclick={() => (open ? close() : show())}>Add</Button>
	{#if open}
		<ul class="menu liquid liquid-strong" role="menu" aria-label="Add to {DOMAIN_LABEL[domain]}" bind:this={menu} onkeydown={menuKeys} transition:fadeSlide={{ y: 6 }} use:hideOnOutro>
			{#each TYPES_BY_DOMAIN[domain] as type (type)}
				<li role="none"><a role="menuitem" href="/add/{type}" tabindex="-1" onclick={() => close()}>{TYPES[type].label}</a></li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.add {
		position: relative;
	}

	/* the hero clips its overflow, so the menu opens upward into the photo */
	.menu {
		position: absolute;
		inset-block-end: calc(100% + 8px);
		inset-inline-end: 0;
		z-index: 30;
		min-inline-size: 220px;
		margin: 0;
		padding: 6px;
		list-style: none;
		border-radius: var(--r-md);
		transform-origin: bottom right;
	}

	.menu a {
		display: flex;
		align-items: center;
		min-block-size: 44px;
		padding: 0 var(--s-3);
		border-radius: var(--r-sm);
		font-size: 15px;
		font-weight: 500;
		transition: background-color var(--d-fast) var(--ease-out);
	}

	.menu a:hover,
	.menu a:focus-visible {
		background: var(--accent-wash);
		box-shadow: none;
	}
</style>
