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
	<div class="field">
		<label for="f-{name}">{label}</label>
		{#if input === 'select'}
			<select
				id="f-{name}"
				{name}
				class="control"
				bind:value={values[name]}
				onchange={() => ondirty(name)}
				aria-invalid={shown[name] ? 'true' : undefined}
				aria-describedby={shown[name] ? `e-${name}` : undefined}
			>
				{#each def.options ?? [] as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		{:else if input === 'textarea' || input === 'list'}
			<textarea
				id="f-{name}"
				{name}
				class="control"
				rows={input === 'list' ? 2 : 3}
				bind:value={values[name]}
				oninput={() => ondirty(name)}
				aria-invalid={shown[name] ? 'true' : undefined}
				aria-describedby={shown[name] ? `e-${name}` : undefined}
				placeholder={input === 'list' ? 'One per line' : undefined}
			></textarea>
		{:else}
			<input
				id="f-{name}"
				{name}
				class="control"
				class:tnum={input === 'int'}
				type={input === 'url' ? 'url' : 'text'}
				inputmode={input === 'int' ? 'numeric' : undefined}
				bind:value={values[name]}
				oninput={() => ondirty(name)}
				aria-invalid={shown[name] ? 'true' : undefined}
				aria-describedby={shown[name] ? `e-${name}` : undefined}
				autocomplete="off"
			/>
		{/if}
		{#if shown[name]}<p class="error" id="e-{name}" role="alert">{shown[name]}</p>{/if}
	</div>
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
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-inline-size: 0;
		margin: 0;
		padding: 0;
		border: 0;
	}

	legend {
		padding: 0;
		margin-block-end: 6px;
		font-size: var(--t-small);
		font-weight: 600;
	}

	.pair {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: var(--s-4);
	}
</style>
