<script lang="ts">
	import { tick } from 'svelte';
	import { fadeSlide, hideOnOutro } from '#lib/motion.ts';
	import Icon from './Icon.svelte';

	let {
		label,
		options,
		value,
		onchange,
		disabled = false
	}: {
		label: string;
		options: { value: string; label: string }[];
		value: string;
		onchange: (value: string) => void;
		disabled?: boolean;
	} = $props();

	let open = $state(false);
	let root = $state<HTMLDivElement>();
	let toggle = $state<HTMLButtonElement>();
	let menu = $state<HTMLUListElement>();
	const current = $derived(options.find((o) => o.value === value)?.label ?? value);

	async function show() {
		open = true;
		await tick();
		menu?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
	}

	function close(refocus = false) {
		open = false;
		if (refocus) toggle?.focus();
	}

	function choose(next: string) {
		close(true);
		if (next !== value) onchange(next);
	}

	function menuKeys(event: KeyboardEvent) {
		const items = [...(menu?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [])];
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

<div class="status" class:open class:disabled bind:this={root}>
	<span class="current">
		<span class="dot" aria-hidden="true"></span>
		{#key current}<span class="text" data-status-label in:fadeSlide={{ y: 8 }}>{current}</span>{/key}
	</span>
	<button
		bind:this={toggle}
		type="button"
		class="toggle"
		aria-haspopup="menu"
		aria-expanded={open}
		aria-label="{label}: {current}"
		{disabled}
		onclick={() => (open ? close() : show())}
	>
		<Icon name="chevron-down" size={18} />
	</button>
	{#if open}
		<ul class="menu liquid liquid-strong" role="menu" aria-label={label} bind:this={menu} onkeydown={menuKeys} transition:fadeSlide={{ y: -6 }} use:hideOnOutro>
			{#each options as option (option.value)}
				<li role="none">
					<button
						type="button"
						role="menuitemradio"
						aria-checked={option.value === value}
						tabindex="-1"
						onclick={() => choose(option.value)}
					>
						<span>{option.label}</span>
						{#if option.value === value}<Icon name="check" size={16} />{/if}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.status {
		position: relative;
		display: inline-flex;
		align-items: stretch;
		min-block-size: 48px;
		border-radius: var(--r-pill);
		background: var(--accent);
		color: var(--accent-ink);
		box-shadow: var(--shadow-card);
	}

	.current {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding-inline: var(--s-5) var(--s-4);
		font-size: 15px;
		font-weight: 600;
		white-space: nowrap;
	}

	.dot {
		inline-size: 7px;
		block-size: 7px;
		border-radius: var(--r-pill);
		background: currentColor;
	}

	.toggle {
		display: grid;
		place-items: center;
		min-inline-size: 48px;
		border: 0;
		border-inline-start: 1px solid currentColor;
		border-start-end-radius: var(--r-pill);
		border-end-end-radius: var(--r-pill);
		background: transparent;
		color: inherit;
	}

	.toggle :global(.icon) {
		transition: transform var(--d-base) var(--ease-out);
	}

	.open .toggle :global(.icon) {
		transform: rotate(180deg);
	}

	.toggle:disabled {
		cursor: default;
		opacity: 0.5;
	}

	.toggle:focus-visible {
		border-radius: 0 var(--r-pill) var(--r-pill) 0;
	}

	.menu {
		position: absolute;
		inset-block-start: calc(100% + 8px);
		inset-inline-start: 0;
		z-index: 30;
		min-inline-size: max(100%, 220px);
		padding: 6px;
		border-radius: var(--r-md);
		transform-origin: top left;
	}

	.menu button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--s-3);
		inline-size: 100%;
		min-block-size: 44px;
		padding: 0 var(--s-3);
		border: 0;
		border-radius: var(--r-sm);
		background: transparent;
		font-size: 15px;
		font-weight: 500;
		text-align: start;
		transition: background-color var(--d-fast) var(--ease-out);
	}

	.menu button:hover,
	.menu button:focus-visible {
		background: var(--accent-wash);
		box-shadow: none;
	}

	.menu [aria-checked='true'] {
		font-weight: 650;
	}
</style>
