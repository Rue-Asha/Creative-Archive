<script lang="ts">
	import { parseProgress } from '#lib/entries/progress.ts';
	import Icon from './Icon.svelte';

	let {
		label,
		current,
		total,
		onstep,
		onset,
		tone = 'surface'
	}: {
		label: string;
		current: number;
		total: number | null;
		onstep: (delta: 1 | -1) => void;
		onset: (value: number) => void;
		tone?: 'surface' | 'glass';
	} = $props();

	const atEnd = $derived(total !== null && current >= total);

	let editing = $state(false);
	let valueButton: HTMLButtonElement | undefined = $state();

	function focusSelect(node: HTMLInputElement) {
		node.focus();
		node.select();
	}

	function finish(input: HTMLInputElement, save: boolean) {
		if (!editing) return;
		editing = false;
		if (!save) return;
		const next = parseProgress(input.value, total);
		if (next !== null && next !== current) onset(next);
	}

	function leave(input: HTMLInputElement, save: boolean) {
		finish(input, save);
		// focusing the button inside the keydown would let the same Enter press activate it again
		setTimeout(() => valueButton?.focus());
	}

	function keydown(event: KeyboardEvent) {
		const input = event.currentTarget as HTMLInputElement;
		if (event.key === 'Enter') leave(input, true);
		else if (event.key === 'Escape') leave(input, false);
	}
</script>

<div class="progress {tone}" class:liquid={tone === 'glass'} class:liquid-strong={tone === 'glass'} role="group" aria-label={label}>
	<button type="button" class="step" aria-label="{label}: one less" disabled={current <= 0} onclick={() => onstep(-1)}>
		<Icon name="minus" size={18} />
	</button>
	{#if editing}
		<input
			use:focusSelect
			type="text"
			inputmode="numeric"
			aria-label={label}
			value={current}
			onkeydown={keydown}
			onblur={(e) => finish(e.currentTarget, true)}
		/>
	{:else}
		<button
			bind:this={valueButton}
			type="button"
			class="value tnum"
			aria-label="{label} {current} of {total ?? 'unknown'}"
			onclick={() => (editing = true)}
		>
			{current}{' '}<span class="total" aria-hidden="true">/ {total ?? '?'}</span>
		</button>
	{/if}
	<button type="button" class="step" aria-label="{label}: one more" disabled={atEnd} onclick={() => onstep(1)}>
		<Icon name="plus" size={18} />
	</button>
</div>

<style>
	.progress {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		padding: 2px;
		border-radius: var(--r-pill);
		background: var(--surface);
		border: 1px solid var(--line);
		color: var(--ink);
	}

	/* the control's own surface fill would win over .liquid */
	.glass {
		background: var(--grain), var(--glass-strong);
		border-color: var(--glass-border);
		box-shadow: var(--glass-rim);
	}

	.step {
		flex: none;
		display: grid;
		place-items: center;
		inline-size: 44px;
		block-size: 44px;
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
		transition:
			transform var(--d-fast) var(--ease-out),
			background-color var(--d-fast) var(--ease-out);
	}

	.step:hover:not(:disabled) {
		background: var(--accent-wash);
	}

	.step:active:not(:disabled) {
		transform: scale(0.9);
	}

	.step:disabled {
		opacity: 0.35;
		cursor: default;
	}

	.value {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 2px;
		min-inline-size: 44px;
		block-size: 44px;
		padding: 0 6px;
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
		font-size: var(--t-body);
		font-weight: 600;
		white-space: nowrap;
	}

	input {
		flex: none;
		inline-size: 44px;
		block-size: 44px;
		padding: 0;
		border: 0;
		border-radius: var(--r-xs);
		background: transparent;
		text-align: center;
		font-variant-numeric: tabular-nums;
	}

	input:focus-visible {
		border-radius: var(--r-xs);
	}

	.total {
		color: var(--ink-2);
		font-weight: 500;
	}

	/* the card is the container. A desktop grid card is ~227px, so the spec's 230px line would hide the total there;
	   the total needs ~190px of control, which a 209px card still gives */
	@container (max-width: 209px) {
		.total {
			display: none;
		}
	}
</style>
