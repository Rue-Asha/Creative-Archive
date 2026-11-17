<script lang="ts" module>
	import type { FieldDef } from '#lib/entries/config.ts';

	export const HANDLES = [
		{ key: 'instagram', label: 'Instagram' },
		{ key: 'tiktok', label: 'TikTok' },
		{ key: 'youtube', label: 'YouTube' },
		{ key: 'website', label: 'Website' }
	] as const;

	// the posted name; save.ts reads the same names
	export const nameOf = (def: FieldDef): string => (def.store === 'column' ? def.key : `details.${def.key}`);
</script>

<script lang="ts">
	import Field from '#lib/components/field/Field.svelte';
	import Select from '#lib/components/select/Select.svelte';

	// `values` holds every field as text, keyed by posted name; `shown` are the messages to display
	let {
		def,
		values = $bindable(),
		shown,
		ondirty
	}: {
		def: FieldDef;
		values: Record<string, string>;
		shown: Record<string, string>;
		ondirty: (name: string) => void;
	} = $props();
</script>

{#snippet control(name: string, label: string, input: FieldDef['input'])}
	{#if input === 'select'}
		<Select {label} {name} bind:value={values[name]} options={[...(def.options ?? [])]} error={shown[name]} onchange={() => ondirty(name)} />
	{:else if input === 'textarea' || input === 'list'}
		<div class={['field', { invalid: !!shown[name] }]}>
			<label for="f-{name}">{label}</label>
			<textarea
				id="f-{name}"
				{name}
				rows={input === 'list' ? 2 : 3}
				bind:value={values[name]}
				oninput={() => ondirty(name)}
				aria-invalid={shown[name] ? 'true' : undefined}
				aria-describedby={[input === 'list' && `h-${name}`, shown[name] && `e-${name}`].filter(Boolean).join(' ') || undefined}
			></textarea>
			{#if input === 'list'}<p class="hint" id="h-{name}">One per line.</p>{/if}
			{#if shown[name]}
				<p class="error" id="e-{name}">
					<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16.5h.01" /></svg>
					{shown[name]}
				</p>
			{/if}
		</div>
	{:else}
		<Field
			{label}
			{name}
			type={input === 'url' ? 'url' : 'text'}
			inputmode={input === 'int' ? 'numeric' : input === 'url' ? 'url' : undefined}
			bind:value={values[name]}
			oninput={() => ondirty(name)}
			error={shown[name]}
			autocomplete="off"
		/>
	{/if}
{/snippet}

{#if def.input === 'handles'}
	<fieldset class="handles">
		<legend>{def.label}</legend>
		<div class="pair">
			{#each HANDLES as handle (handle.key)}
				{@render control(`details.handles.${handle.key}`, handle.label, handle.key === 'website' ? 'url' : 'text')}
			{/each}
		</div>
	</fieldset>
{:else}
	{@render control(nameOf(def), def.label, def.input)}
{/if}

<style>
	.handles {
		display: grid;
		gap: var(--space-1-5);
		min-inline-size: 0;
		margin: 0;
		padding: 0;
		border: 0;
	}

	legend {
		padding: 0;
		margin-block-end: var(--space-1-5);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
	}

	.pair {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
		align-items: start;
		gap: var(--space-4);
	}

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
	textarea {
		inline-size: 100%;
		min-block-size: 5.5rem;
		padding: var(--space-3) var(--space-4);
		border: 0;
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink);
		font: inherit;
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
		resize: vertical;
		field-sizing: content;
	}
	textarea:focus-visible {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}
	.invalid textarea {
		box-shadow: var(--ring-danger);
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
</style>
