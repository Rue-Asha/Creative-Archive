<!--
	Select: copy-in reference primitive from Design-System (sync.sh <app> --primitive select).
	The app owns this copy; restyle it with fingerprint tokens only.
	A native <select> in the fingerprint: the browser keeps the picker, keyboard and screen
	reader behaviour. Props: label, value (bindable), options ({ value, label, disabled }[]),
	placeholder (an empty first option), hint, error, hideLabel, id, children (<option>s or
	<optgroup>s instead of options), plus any <select> attribute.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLSelectAttributes } from 'svelte/elements';

	type Option = { value: string; label: string; disabled?: boolean };
	type Props = {
		label: string;
		value?: string;
		options?: Option[];
		placeholder?: string;
		hint?: string;
		error?: string;
		hideLabel?: boolean;
		id?: string;
		children?: Snippet;
	} & Omit<HTMLSelectAttributes, 'value' | 'children'>;

	const uid = $props.id();
	let {
		label,
		value = $bindable(''),
		options = [],
		placeholder,
		hint,
		error,
		hideLabel = false,
		id = uid,
		children,
		...rest
	}: Props = $props();

	const describedby = $derived([hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined);
</script>

<div class={['field', { invalid: !!error, disabled: rest.disabled }]}>
	<label class={{ 'sr-only': hideLabel }} for={id}>{label}</label>
	<div class="control">
		<select {...rest} {id} bind:value aria-invalid={error ? 'true' : undefined} aria-describedby={describedby}>
			{#if placeholder !== undefined}<option value="" disabled={rest.required}>{placeholder}</option>{/if}
			{#each options as o (o.value)}
				<option value={o.value} disabled={o.disabled}>{o.label}</option>
			{/each}
			{@render children?.()}
		</select>
		<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
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
		gap: var(--space-1-5);
		min-inline-size: 0;
	}
	label {
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
	}

	.control {
		position: relative;
		display: grid;
		align-items: center;
	}
	select {
		grid-area: 1 / 1;
		inline-size: 100%;
		min-block-size: max(var(--control-height), var(--target));
		padding-block: 0;
		padding-inline: var(--space-4) var(--space-10);
		border: 0;
		border-radius: var(--radius-control);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink);
		font-size: var(--type-body-size);
		text-overflow: ellipsis;
		appearance: none;
		-webkit-appearance: none;
	}
	.control > svg {
		grid-area: 1 / 1;
		justify-self: end;
		margin-inline-end: var(--space-4);
		pointer-events: none;
		color: var(--ink);
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
	.invalid select {
		box-shadow: var(--ring-danger);
	}
	@media (hover: hover) {
		select:not(:disabled):hover {
			background: var(--surface-sunken);
		}
	}
	.disabled .control {
		opacity: var(--disabled-opacity);
	}
	.disabled select {
		background: var(--surface-sunken);
		color: var(--ink-secondary);
		cursor: default;
	}
	.disabled .control > svg {
		color: var(--ink-secondary);
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
