<script lang="ts">
	import { parseProgress } from '#lib/entries/progress.ts';
	import Button from '#lib/components/button/Button.svelte';
	import Icon from './Icon.svelte';

	let {
		label,
		name,
		current,
		total,
		onstep,
		onset,
		// kept for the callers; the control looks the same on every surface now
		tone = 'surface'
	}: {
		label: string;
		// the group's accessible name when several controls share a page (a card names its entry); `label` otherwise
		name?: string;
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

<!-- a narrow card has no room for the total beside the steps, so it reads "5 / 24 chapters" above them (hi-fi); the value button already names it -->
<p class="line" aria-hidden="true">{current.toLocaleString('en-GB')} / {total === null ? '?' : total.toLocaleString('en-GB')} {label.toLowerCase()}</p>
<div class="progress {tone}" role="group" aria-label={name ?? label}>
	<Button icon size="xs" label="{label}: one less" disabled={current <= 0} onclick={() => onstep(-1)}><Icon name="minus" size={16} /></Button>
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
			class="value"
			aria-label="{label} {current} of {total ?? 'unknown'}"
			onclick={() => (editing = true)}
		>
			{current}{' '}<span class="total" aria-hidden="true">/ {total ?? '?'}</span>
		</button>
	{/if}
	<Button icon size="xs" label="{label}: one more" disabled={atEnd} onclick={() => onstep(1)}><Icon name="plus" size={16} /></Button>
</div>

<style>
	.progress {
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-0-5);
		min-inline-size: 0;
		color: var(--ink);
	}

	.value {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-0-5);
		min-inline-size: var(--target-touch);
		min-block-size: var(--target-touch);
		padding: 0 var(--space-1-5);
		border: 0;
		border-radius: var(--radius-pill);
		background: transparent;
		color: var(--ink);
		font: inherit;
		font-size: var(--type-body-s-size);
		font-weight: var(--weight-medium);
		font-variant-numeric: var(--numeric-figures);
		white-space: nowrap;
		cursor: pointer;
	}

	input {
		flex: none;
		inline-size: var(--target-touch);
		block-size: var(--target-touch);
		padding: 0;
		border: 0;
		border-radius: var(--radius-text);
		background: transparent;
		color: var(--ink);
		font-size: var(--type-body-size);
		text-align: center;
		font-variant-numeric: var(--numeric-figures);
	}

	.total {
		color: var(--ink-secondary);
		font-weight: var(--weight-regular);
	}

	.line {
		display: none;
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		font-variant-numeric: var(--numeric-figures);
		text-align: center;
	}

	/* the card is the container: a shelf or phone card (165–168px, ~154px inside its padding) has no room for the total
	   beside the steps, so the line above carries it; a desktop grid card (~198px, ~186px inside) keeps it inline */
	@container (max-width: 170px) {
		.total {
			display: none;
		}
		.line {
			display: block;
		}
	}
</style>
