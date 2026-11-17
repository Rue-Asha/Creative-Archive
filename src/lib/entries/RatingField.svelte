<script lang="ts">
	import { tick } from 'svelte';
	import Button from '#lib/components/button/Button.svelte';
	import Icon from '#lib/ui/Icon.svelte';
	import { formatRating, parseRating, stepRating } from './rating-input.ts';

	// The charcoal card: the typed figure out of 10 with round "Rating: one less" / "Rating: one more" buttons (step 0.25),
	// typing kept. A committed text that differs from the saved rating draws the confirm line; steps and arrows save without it.
	let { value, onchange }: { value: number | null; onchange: (next: number | null) => void } = $props();

	const id = $props.id();
	const MESSAGE = 'Rating must be between 0 and 10 with up to two decimals';
	let text = $state('');
	let invalid = $state(false);
	let confirmed = $state<HTMLDivElement>();
	let input = $state<HTMLInputElement>();

	// the saved rating (or the one an in-flight save is about to make) owns the text; typing is local until committed
	$effect(() => {
		text = formatRating(value);
		invalid = false;
	});

	async function confirmLine() {
		await tick();
		if (!confirmed || !input) return;
		const wrap = confirmed.getBoundingClientRect();
		const box = input.getBoundingClientRect();
		confirmed.style.setProperty('--confirm-x', `${box.left - wrap.left}px`);
		confirmed.style.setProperty('--confirm-w', `${box.width}px`);
		confirmed.style.setProperty('--confirm-bottom', `${wrap.bottom - box.bottom}px`);
		confirmed.removeAttribute('data-confirmed');
		void confirmed.offsetWidth;
		confirmed.setAttribute('data-confirmed', '');
	}

	function commit() {
		const parsed = parseRating(text);
		if (!parsed.ok) {
			invalid = true;
			return;
		}
		invalid = false;
		text = formatRating(parsed.value);
		if (parsed.value === value) return;
		onchange(parsed.value);
		void confirmLine();
	}

	function step(direction: 1 | -1) {
		confirmed?.removeAttribute('data-confirmed');
		const next = stepRating(value, direction);
		if (next !== value) onchange(next);
	}

	function keydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			commit();
		} else if (event.key === 'Escape') {
			text = formatRating(value);
			invalid = false;
		} else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			event.preventDefault();
			step(event.key === 'ArrowUp' ? 1 : -1);
		}
	}
</script>

<section class="card rating" data-surface="inverse" aria-label="Rating">
	<div class="field" class:invalid>
		<label for="{id}-f">Rating</label>
		<div class="row">
			<Button variant="quiet" icon label="Rating: one less" disabled={value === null || value <= 0} onclick={() => step(-1)}><Icon name="minus" size={18} /></Button>
			<div class="figwrap" bind:this={confirmed} data-confirm-line>
				<div class="control">
					<input
						bind:this={input}
						id="{id}-f"
						type="text"
						inputmode="decimal"
						autocomplete="off"
						spellcheck="false"
						enterkeyhint="done"
						role="spinbutton"
						aria-valuemin="0"
						aria-valuemax="10"
						aria-valuenow={value ?? undefined}
						aria-valuetext={value === null ? 'Not rated' : `${value} of 10`}
						aria-invalid={invalid ? 'true' : undefined}
						aria-describedby="{id}-h"
						placeholder="–"
						bind:value={text}
						onkeydown={keydown}
						onblur={commit}
					/>
					{#if text !== ''}<span class="affix" aria-hidden="true">/ 10</span>{/if}
				</div>
			</div>
			<Button variant="quiet" icon label="Rating: one more" disabled={value !== null && value >= 10} onclick={() => step(1)}><Icon name="plus" size={18} /></Button>
		</div>
		{#if invalid}
			<p class="error" id="{id}-h">{MESSAGE}</p>
		{:else}
			<p class="hint" id="{id}-h">0 to 10, up to two decimals. Leave empty for no rating.</p>
		{/if}
	</div>
	{#if value !== null}<Button variant="quiet" size="s" class="clear" onclick={() => onchange(null)}>Clear rating</Button>{/if}
</section>

<style>
	.rating {
		container-type: inline-size;
		display: grid;
		align-content: space-between;
		gap: var(--space-4);
		padding: var(--space-6) var(--space-5) var(--space-5);
	}

	.field {
		display: grid;
		gap: var(--space-3);
		min-inline-size: 0;
		color: var(--ink-on-inverse);
	}

	label {
		font-size: var(--type-overline-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
		letter-spacing: var(--type-kicker-tracking);
		text-transform: uppercase;
		color: var(--ink-on-inverse-secondary);
	}

	.row {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-inline-size: 0;
	}

	.row :global(.btn) {
		flex: none;
		background: var(--surface-inverse-tint);
		box-shadow: var(--ring-on-inverse);
		color: var(--ink-on-inverse);
	}

	.row :global(.btn:disabled) {
		background: none;
		color: var(--ink-on-inverse-secondary);
		opacity: var(--disabled-opacity);
	}

	.figwrap {
		display: inline-grid;
		min-inline-size: 0;
	}

	.control {
		display: flex;
		align-items: baseline;
		gap: var(--space-2-5);
		inline-size: fit-content;
		max-inline-size: 100%;
		min-block-size: max(var(--control-height), var(--target));
		margin-block: var(--space-2) var(--space-1);
	}

	input {
		field-sizing: content;
		flex: none;
		min-inline-size: max(1.6ch, var(--target));
		min-block-size: var(--target);
		padding: 0 0 var(--space-1);
		border: 0;
		border-block-end: var(--stroke-rule) solid var(--edge-control-on-inverse);
		background: none;
		color: inherit;
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-figure-size);
		line-height: var(--type-figure-line);
		letter-spacing: var(--type-figure-tracking);
		font-variant-numeric: var(--numeric-figures);
	}

	input:focus-visible {
		outline: var(--focus-width) solid var(--focus-ring-on-inverse);
		outline-offset: var(--focus-offset);
	}

	input::placeholder {
		color: var(--ink-on-inverse-muted);
		opacity: 1;
	}

	.invalid input {
		border-block-end-color: var(--danger-on-inverse);
	}

	.affix {
		font-family: var(--font-display);
		font-size: var(--type-display-s-size);
		line-height: 1;
		color: var(--ink-on-inverse-secondary);
	}

	.hint,
	.error {
		max-inline-size: 30ch;
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
	}

	.hint {
		color: var(--ink-on-inverse-secondary);
	}

	.error {
		font-weight: var(--weight-semibold);
		color: var(--danger-on-inverse);
	}

	.rating :global(.clear) {
		justify-self: start;
		padding-inline: 0;
		color: var(--ink-on-inverse);
		text-decoration: underline;
		text-underline-offset: 0.3em;
	}

	@container (max-width: 21rem) {
		input {
			font-size: var(--type-display-l-size);
			line-height: var(--type-display-l-line);
		}

		.affix {
			font-size: var(--type-body-size);
		}

		.row {
			gap: var(--space-2);
		}
	}
</style>
