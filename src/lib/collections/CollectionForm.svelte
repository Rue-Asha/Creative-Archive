<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '#lib/components/button/Button.svelte';
	import Field from '#lib/components/field/Field.svelte';

	type Props = {
		heading: string;
		note: string;
		action: string;
		submit: string;
		name?: string;
		description?: string;
		error?: string;
		oncancel: () => void;
		onsaved: () => void;
	};

	let { heading, note, action, submit, name = '', description = '', error, oncancel, onsaved }: Props = $props();

	const id = $props.id();
	// svelte-ignore state_referenced_locally
	let nameValue = $state(name);
	// svelte-ignore state_referenced_locally
	let descriptionValue = $state(description);
</script>

<form
	class="card form"
	data-surface="solid"
	method="POST"
	{action}
	use:enhance={() =>
		async ({ result, update }) => {
			await update({ reset: false });
			if (result.type === 'success') onsaved();
		}}
>
	<div class="card-head"><h2 id="{id}-title">{heading}</h2><span class="card-note">{note}</span></div>
	<Field label="Name" name="name" bind:value={nameValue} {error} autocomplete="off" autofocus />
	<div class="field pill">
		<label for="{id}-description">Description <span class="opt">optional</span></label>
		<div class="control"><textarea id="{id}-description" name="description" rows="3" bind:value={descriptionValue}></textarea></div>
	</div>
	<div class="row-actions">
		<Button variant="secondary" onclick={oncancel}>Cancel</Button>
		<Button variant="primary" arrow type="submit">{submit}</Button>
	</div>
</form>

<style>
	.form {
		display: grid;
		gap: var(--space-4);
		padding: var(--space-6);
		max-inline-size: 40rem;
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
	.opt {
		color: var(--ink-secondary);
		font-weight: var(--weight-regular);
	}
	.control {
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-control);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
	}
	.control:has(textarea:focus-visible) {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}
	textarea {
		display: block;
		inline-size: 100%;
		min-block-size: 4.5rem;
		padding: 0;
		border: 0;
		background: none;
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
		outline: 0;
		resize: vertical;
	}
	.row-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--space-2);
	}
	@media (max-width: 767px) {
		.form {
			padding: var(--space-5) var(--space-4);
		}
	}
</style>
