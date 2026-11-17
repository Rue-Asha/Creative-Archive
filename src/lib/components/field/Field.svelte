<!--
	Field: copy-in reference primitive from Design-System (sync.sh <app> --primitive field).
	The app owns this copy; restyle it with fingerprint tokens only.
	Props: label, value (bindable), hint, error, variant (pill | line | figure), type,
	inputmode (numbers are typed text: inputmode="decimal", never type="number"), prefix,
	suffix (text or snippet), hideLabel, id, plus any <input> attribute.
	The typed rating is variant="figure" inputmode="decimal" suffix="/ 10"; put
	data-surface="inverse" on the charcoal card around it, and data-confirm-line on a wrapper
	for the motion.css rating line. An empty figure shows a dash in the number's place (its
	placeholder, unless you pass one), so the suffix never stands alone over the line.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = {
		label: string;
		value?: string;
		hint?: string;
		error?: string;
		variant?: 'pill' | 'line' | 'figure';
		type?: 'text' | 'email' | 'search' | 'url' | 'tel' | 'password';
		prefix?: string | Snippet;
		suffix?: string | Snippet;
		hideLabel?: boolean;
		id?: string;
	} & Omit<HTMLInputAttributes, 'type' | 'value' | 'prefix'>;

	const uid = $props.id();
	let {
		label,
		value = $bindable(''),
		hint,
		error,
		variant = 'pill',
		type = 'text',
		prefix,
		suffix,
		hideLabel = false,
		id = uid,
		...rest
	}: Props = $props();

	const describedby = $derived(
		[typeof prefix === 'string' && `${id}-prefix`, typeof suffix === 'string' && `${id}-suffix`, hint && `${id}-hint`, error && `${id}-error`]
			.filter(Boolean)
			.join(' ') || undefined
	);
</script>

{#snippet affix(part: string | Snippet, side: 'prefix' | 'suffix')}
	{#if typeof part === 'string'}
		<span class="affix" id="{id}-{side}">{part}</span>
	{:else}
		<span class="affix" aria-hidden="true">{@render part()}</span>
	{/if}
{/snippet}

<div class={['field', variant, { invalid: !!error, disabled: rest.disabled }]}>
	<label class={{ 'sr-only': hideLabel }} for={id}>{label}</label>
	<div class="control">
		{#if prefix}{@render affix(prefix, 'prefix')}{/if}
		<input
			{...rest}
			{id}
			{type}
			placeholder={rest.placeholder ?? (variant === 'figure' ? '–' : undefined)}
			bind:value
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={describedby}
		/>
		{#if suffix}{@render affix(suffix, 'suffix')}{/if}
	</div>
	{#if hint}<p class="hint" id="{id}-hint">{hint}</p>{/if}
	{#if error}
		<p class="error" id="{id}-error">
			<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16.5h.01" /></svg>
			{error}
		</p>
	{/if}
</div>

<style>
	.field {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-1-5);
		min-inline-size: 0;
	}
	label {
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
		color: var(--ink);
	}

	.control {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-block-size: max(var(--control-height), var(--target));
		padding-inline: var(--space-4);
		border-radius: var(--radius-control);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
	}
	/* The ring sits on the whole control, so a prefix or suffix stays inside it. */
	.control:has(input:focus-visible) {
		outline: var(--focus-width) solid var(--focus-color, var(--focus-ring));
		outline-offset: var(--focus-offset);
	}
	input {
		flex: 1;
		min-inline-size: 0;
		block-size: 100%;
		padding: 0;
		border: 0;
		background: none;
		font-size: var(--type-body-size);
		font-variant-numeric: var(--numeric-figures);
	}
	input:focus-visible {
		outline: none;
	}
	input::placeholder {
		color: var(--ink-muted);
		opacity: 1;
	}
	.affix {
		display: inline-flex;
		flex: none;
		color: var(--ink-secondary);
	}

	.line .control,
	.figure .control {
		padding-inline: 0;
		border-radius: 0;
		background: none;
		box-shadow: none;
		border-block-end: var(--stroke-rule) solid var(--edge-control);
	}
	.figure .control {
		align-items: baseline;
		gap: var(--space-2-5);
		inline-size: fit-content;
		max-inline-size: 100%;
		border-block-end: 0;
	}
	.figure input {
		field-sizing: content;
		flex: none;
		min-inline-size: 1.6ch;
		padding-block-end: var(--space-1);
		border-block-end: var(--stroke-rule) solid var(--edge-control);
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-figure-size);
		line-height: var(--type-figure-line);
		letter-spacing: var(--type-figure-tracking);
	}
	.figure .affix {
		font-family: var(--font-display);
		font-size: var(--type-display-s-size);
		line-height: 1;
	}
	.figure label {
		font-size: var(--type-overline-size);
		letter-spacing: var(--type-kicker-tracking);
		text-transform: uppercase;
		color: var(--ink-secondary);
	}

	.hint {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		color: var(--ink-secondary);
	}
	.error {
		font-size: var(--type-caption-size);
		line-height: var(--type-caption-line);
		font-weight: var(--weight-semibold);
		color: var(--danger);
	}
	.error svg {
		display: inline;
		vertical-align: -0.15em;
		margin-inline-end: var(--space-1);
	}
	.invalid.pill .control {
		box-shadow: var(--ring-danger);
	}
	.invalid:is(.line, .figure) .control,
	.invalid.figure input {
		border-block-end-color: var(--danger);
	}
	.invalid.figure .control {
		border-block-end: 0;
	}

	.disabled .control {
		background: var(--surface-sunken);
		opacity: var(--disabled-opacity);
	}
	.disabled input {
		color: var(--ink-secondary);
	}

	/* On the charcoal card (data-surface="inverse" on an ancestor). */
	:global([data-surface='inverse']) .field {
		color: var(--ink-on-inverse);
	}
	:global([data-surface='inverse']) :is(label, .figure label, .hint, .affix) {
		color: var(--ink-on-inverse-secondary);
	}
	:global([data-surface='inverse']) :is(.line .control, .figure input) {
		border-block-end-color: var(--edge-control-on-inverse);
	}
	:global([data-surface='inverse']) input::placeholder {
		color: var(--ink-on-inverse-muted);
	}
	:global([data-surface='inverse']) .error {
		color: var(--danger-on-inverse);
	}
	:global([data-surface='inverse']) :is(.invalid.line .control, .invalid.figure input) {
		border-block-end-color: var(--danger-on-inverse);
	}

	.sr-only {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
