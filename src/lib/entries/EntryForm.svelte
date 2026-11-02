<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { tick } from 'svelte';
	import { COPY, STATUS_LABELS } from '#lib/copy.ts';
	import { TYPES } from '#lib/entries/config.ts';
	import { toast } from '#lib/shell/toast.ts';
	import type { EntryInput, EntryType, Id, Tag } from '#lib/types.ts';
	import Button from '#lib/ui/Button.svelte';
	import ArtistField from './ArtistField.svelte';
	import FieldInput, { HANDLES, nameOf } from './FieldInput.svelte';
	import DiscardDialog from './DiscardDialog.svelte';
	import ImageField from './ImageField.svelte';
	import TagInput from './TagInput.svelte';
	import { discard, guardUnsaved, keepEditing, leaving } from './unsaved.ts';

	let {
		type,
		values,
		errors = {},
		artists,
		tags,
		action,
		hidden = {},
		cancelHref = '/',
		prefilled = false
	}: {
		type: EntryType;
		values: Partial<EntryInput>;
		errors?: Record<string, string>;
		artists: { id: Id; title: string }[];
		tags: Tag[];
		action: string;
		hidden?: Record<string, string>;
		cancelHref?: string;
		prefilled?: boolean;
	} = $props();

	// the form seeds its fields once; its values never change under a mounted form
	/* svelte-ignore state_referenced_locally */
	const config = TYPES[type];
	/* svelte-ignore state_referenced_locally */
	let title = $state(values.title ?? '');
	/* svelte-ignore state_referenced_locally */
	let note = $state(values.note ?? '');

	function initialFields(): Record<string, string> {
		const details = (values.details ?? {}) as Record<string, unknown>;
		const out: Record<string, string> = {};
		for (const def of config.fields) {
			if (def.input === 'handles') {
				for (const h of HANDLES) out[`details.handles.${h.key}`] = values.details?.handles?.[h.key] ?? '';
				continue;
			}
			const raw = def.store === 'column' ? values.kind : details[def.key];
			const first = def.input === 'select' ? (def.options?.[0]?.value ?? '') : '';
			out[nameOf(def)] = Array.isArray(raw) ? raw.join('\n') : raw === undefined ? first : String(raw);
		}
		if (type === 'site' && values.kind === undefined) out.kind = 'shop';
		for (const key of config.progress) out[`progress.${key}.total`] = String(values.progress?.[key]?.total ?? '');
		if (config.status === 'piece') out.status = values.status ?? 'wishlist';
		return out;
	}
	/* svelte-ignore state_referenced_locally */
	let fields = $state(initialFields());
	/* svelte-ignore state_referenced_locally */
	let tagNames = $state([...(values.tags ?? [])]);
	let tagText = $state('');
	/* svelte-ignore state_referenced_locally */
	let artistName = $state(values.artist?.name ?? '');
	/* svelte-ignore state_referenced_locally */
	let artistId = $state(values.artist?.id ?? null);
	let imageRemoved = $state(false);
	let imagePicked = $state('');

	let formEl: HTMLFormElement;
	let saving = $state(false);
	let saved = false;

	const snapshot = () =>
		JSON.stringify([title, fields, note, tagNames, tagText, artistName, artistId, imageRemoved, imagePicked, hidden]);
	/* svelte-ignore state_referenced_locally */
	const initial = prefilled ? null : snapshot();
	guardUnsaved(() => !saved && (initial === null || snapshot() !== initial));

	// a message goes away as soon as its field is edited, and comes back with the next server answer
	let dismissed = $state<string[]>([]);
	const shown = $derived(Object.fromEntries(Object.entries(errors).filter(([key]) => !dismissed.includes(key))));
	const dismiss = (key: string) => {
		if (!dismissed.includes(key)) dismissed.push(key);
	};

	$effect(() => {
		dismissed = [];
		if (Object.keys(errors).length === 0) return;
		tick().then(() => formEl.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
	});

	const submit: SubmitFunction = ({ cancel }) => {
		if (saving) {
			cancel();
			return;
		}
		saving = true;
		return async ({ result, update }) => {
			if (result.type === 'redirect') {
				saved = true;
				toast(COPY.saved);
			}
			await update({ reset: false });
			if (result.type !== 'redirect') saving = false;
		};
	};
</script>

<form class="entry-form liquid" method="POST" {action} enctype="multipart/form-data" novalidate use:enhance={submit} bind:this={formEl}>
	<input type="hidden" name="type" value={type} />
	{#each Object.entries(hidden) as [name, value] (name)}
		<input type="hidden" {name} {value} />
	{/each}

	<div class="body">
		<div class="side">
			<ImageField
				{title}
				imageId={values.imageId ?? null}
				bind:removed={imageRemoved}
				bind:picked={imagePicked}
				error={shown.image}
				ondirty={() => dismiss('image')}
			/>
		</div>

		<div class="main">
			<div class="field">
				<label for="f-title">{config.titleLabel}</label>
				<input
					id="f-title"
					name="title"
					class="control"
					bind:value={title}
					oninput={() => dismiss('title')}
					aria-invalid={shown.title ? 'true' : undefined}
					aria-describedby={shown.title ? 'e-title' : undefined}
					autocomplete="off"
				/>
				{#if shown.title}<p class="error" id="e-title" role="alert">{shown.title}</p>{/if}
			</div>

			{#if config.artist}
				<ArtistField {artists} bind:name={artistName} bind:id={artistId} />
			{/if}

			<div class="fields">
				{#each config.fields as def (def.key)}
					<FieldInput {def} bind:values={fields} {shown} ondirty={dismiss} />
				{/each}
				{#each config.progress as key (key)}
					{@const name = `progress.${key}.total`}
					<div class="field">
						<label for="f-{name}">{key[0].toUpperCase() + key.slice(1)} total</label>
						<input
							id="f-{name}"
							{name}
							class="control tnum"
							inputmode="numeric"
							bind:value={fields[name]}
							oninput={() => dismiss(name)}
							aria-invalid={shown[name] ? 'true' : undefined}
							aria-describedby={shown[name] ? `e-${name}` : undefined}
							autocomplete="off"
						/>
						{#if shown[name]}<p class="error" id="e-{name}" role="alert">{shown[name]}</p>{/if}
					</div>
				{/each}
				{#if config.status === 'piece'}
					<div class="field">
						<label for="f-status">Status</label>
						<div class="select">
							<select
								id="f-status"
								name="status"
								class="control"
								bind:value={fields.status}
								onchange={() => dismiss('status')}
							>
								{#each Object.entries(STATUS_LABELS.piece) as [value, label] (value)}
									<option {value}>{label}</option>
								{/each}
							</select>
						</div>
						{#if shown.status}<p class="error" id="e-status" role="alert">{shown.status}</p>{/if}
					</div>
				{/if}
			</div>

			<TagInput {tags} bind:selected={tagNames} bind:pending={tagText} />

			<div class="field">
				<label for="f-note">Note</label>
				<textarea id="f-note" name="note" class="control" rows="3" bind:value={note}></textarea>
			</div>
		</div>
	</div>

	<div class="actions">
		<Button variant="secondary" arrow={false} href={cancelHref}>Cancel</Button>
		<Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
	</div>
</form>

{#if $leaving}<DiscardDialog onkeep={keepEditing} ondiscard={discard} />{/if}

<style>
	.entry-form {
		--field-error: var(--error);
		display: flex;
		flex-direction: column;
		gap: var(--s-6);
		padding: var(--s-7);
		border-radius: var(--r-panel);
	}

	.body {
		display: grid;
		grid-template-columns: minmax(200px, 280px) minmax(0, 1fr);
		gap: var(--s-7);
		align-items: start;
	}

	.side {
		min-inline-size: 0;
	}

	.main {
		display: flex;
		flex-direction: column;
		gap: var(--s-5);
		min-inline-size: 0;
	}

	.fields {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: var(--s-5);
	}

	.fields > :global(.handles) {
		grid-column: 1 / -1;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--s-3);
	}

	.entry-form :global(.field) {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-inline-size: 0;
	}

	.entry-form :global(.field > label) {
		font-size: var(--t-small);
		font-weight: 600;
	}

	.entry-form :global(.control) {
		inline-size: 100%;
		min-block-size: 46px;
		padding: 11px 14px;
		border-radius: var(--r-sm);
		border: 1px solid var(--line);
		background: var(--glass-thin);
		font-size: var(--t-body);
		line-height: 1.45;
		transition: border-color var(--d-fast) var(--ease-out);
	}

	.entry-form :global(.select .control) {
		padding-inline-end: var(--s-8);
	}

	.entry-form :global(textarea.control) {
		resize: vertical;
		field-sizing: content;
	}

	.entry-form :global(.control::placeholder) {
		color: var(--ink-2);
	}

	.entry-form :global(.control:focus-visible) {
		border-color: var(--accent);
		border-radius: var(--r-sm);
	}

	.entry-form :global(.control[aria-invalid='true']) {
		border-color: var(--field-error);
	}

	.entry-form :global(.error) {
		font-size: var(--t-small);
		font-weight: 500;
		color: var(--field-error);
	}

	@media (max-width: 1023px) {
		.entry-form {
			padding: var(--s-5) var(--s-4);
		}

		.body {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--s-5);
		}

		.side {
			inline-size: min(100%, 240px);
		}

		.actions :global(.btn:last-child) {
			flex: 1;
		}
	}
</style>
