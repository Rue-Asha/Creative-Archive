<script lang="ts">
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

	function commit(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const raw = input.value.trim();
		const next = Number(raw);
		if (raw === '' || !Number.isInteger(next) || next < 0 || (total !== null && next > total)) {
			input.value = String(current);
			return;
		}
		if (next !== current) onset(next);
	}
</script>

<div class="progress {tone}" class:liquid={tone === 'glass'} class:liquid-strong={tone === 'glass'} role="group" aria-label={label}>
	<button type="button" class="step" aria-label="{label}: one less" disabled={current <= 0} onclick={() => onstep(-1)}>
		<Icon name="minus" size={18} />
	</button>
	<span class="value tnum">
		<input
			type="text"
			inputmode="numeric"
			aria-label={label}
			value={current}
			onchange={commit}
			onkeydown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
		/>
		<span class="total">/ {total ?? '?'}</span>
	</span>
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
		align-items: baseline;
		gap: 2px;
		padding-inline-end: 6px;
		font-size: 15px;
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
</style>
