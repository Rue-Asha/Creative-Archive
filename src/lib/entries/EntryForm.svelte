<script lang="ts">
	import { enhance, type SubmitFunction } from '$app/forms';
	import { tick } from 'svelte';
	import Select from '#lib/components/select/Select.svelte';
	import { COPY } from '#lib/copy.ts';
	import { TYPES } from '#lib/entries/config.ts';
	import { statusLabel } from '#lib/entries/derive.ts';
	import { MEDIA_STATUSES, PIECE_STATUSES } from '#lib/entries/query.ts';
	import { toast } from '#lib/shell/toast.ts';
	import type { EntryInput, EntryType, Id, Tag } from '#lib/types.ts';
	import Button from '#lib/components/button/Button.svelte';
	import Field from '#lib/components/field/Field.svelte';
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
		prefilled = false,
		mode = 'add',
		existingId = null
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
		mode?: 'add' | 'edit';
		existingId?: Id | null;
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
		if (config.status === 'media') out.status = values.status ?? 'none';
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

	// a media entry's status is set on its page; the add form only gives it a first one
	const statusOptions = $derived(
		config.status === 'piece' || (config.status === 'media' && mode === 'add')
			? (config.status === 'piece' ? PIECE_STATUSES : MEDIA_STATUSES).map((value) => ({ value, label: statusLabel(type, value)! }))
			: []
	);

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

<form class="entry-form card" data-surface="solid" method="POST" {action} enctype="multipart/form-data" novalidate use:enhance={submit} bind:this={formEl}>
	<input type="hidden" name="type" value={type} />
	{#each Object.entries(hidden) as [name, value] (name)}
		<input type="hidden" {name} {value} />
	{/each}

	{#if existingId}
		<p class="notice" role="alert">
			<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16.5h.01" /></svg>
			<a href="/entries/{existingId}">{COPY.already}</a>
		</p>
	{/if}

	<div class="body">
		<ImageField
			imageId={values.imageId ?? null}
			bind:removed={imageRemoved}
			bind:picked={imagePicked}
			error={shown.image}
			ondirty={() => dismiss('image')}
		/>

		<div class="main">
			<Field
				label={config.titleLabel}
				name="title"
				bind:value={title}
				oninput={() => dismiss('title')}
				error={shown.title}
				autocomplete="off"
			/>

			{#if config.artist}
				<ArtistField {artists} bind:name={artistName} bind:id={artistId} />
			{/if}

			<div class="fields">
				{#each config.fields as def (def.key)}
					<FieldInput {def} bind:values={fields} {shown} ondirty={dismiss} />
				{/each}
				{#each config.progress as key (key)}
					{@const name = `progress.${key}.total`}
					<Field
						label="{key[0].toUpperCase() + key.slice(1)} total"
						{name}
						inputmode="numeric"
						bind:value={fields[name]}
						oninput={() => dismiss(name)}
						error={shown[name]}
						autocomplete="off"
					/>
				{/each}
				{#if statusOptions.length}
					<Select label="Status" name="status" bind:value={fields.status} options={statusOptions} error={shown.status} onchange={() => dismiss('status')} />
				{/if}
			</div>

			<TagInput {tags} bind:selected={tagNames} bind:pending={tagText} />

			<div class="field">
				<label for="f-note">Note</label>
				<textarea id="f-note" name="note" rows="3" bind:value={note}></textarea>
			</div>
		</div>
	</div>

	<div class="actions">
		<Button variant="secondary" href={cancelHref}>Cancel</Button>
		<Button variant="primary" arrow type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
	</div>
</form>

{#if $leaving}<DiscardDialog onkeep={keepEditing} ondiscard={discard} />{/if}

<style>
	.entry-form {
		display: grid;
		gap: var(--space-5);
		padding: var(--space-4);
	}

	.body {
		display: grid;
		gap: var(--space-5);
		min-inline-size: 0;
	}

	.main {
		display: grid;
		gap: var(--space-4);
		align-content: start;
		min-inline-size: 0;
	}

	.fields {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
		align-items: start;
		gap: var(--space-4);
	}

	.fields > :global(.handles) {
		grid-column: 1 / -1;
	}

	.actions {
		display: flex;
		flex-direction: column-reverse;
		gap: var(--space-2);
	}

	/* full width on the phone: the label sits left and the arrow at the right edge, like the list toolbar's Add */
	.actions :global(.btn.arrow) {
		justify-content: space-between;
	}

	.field {
		display: grid;
		gap: var(--space-1-5);
		min-inline-size: 0;
	}

	.field > label {
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

	.notice {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
		margin: 0;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-panel);
		background: var(--danger-soft);
		box-shadow: var(--ring-danger);
		color: var(--danger);
		font-size: var(--type-body-s-size);
		font-weight: var(--weight-semibold);
	}

	.notice a {
		color: inherit;
		text-underline-offset: 0.2em;
	}

	.notice svg {
		flex: none;
		margin-block-start: var(--space-0-5);
	}

	/* the artist token and the tag tokens are one chip */
	.entry-form :global(.chip) {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		max-inline-size: 100%;
		min-block-size: var(--control-height-xs);
		padding-inline: var(--space-3) var(--space-1);
		border: 0;
		border-radius: var(--radius-pill);
		background: var(--surface-sunken);
		box-shadow: var(--ring-hairline);
		color: var(--ink);
		font-size: var(--type-caption-size);
		font-weight: var(--weight-regular);
		text-decoration: none;
	}

	.entry-form :global(.chip > span) {
		min-inline-size: 0;
		max-inline-size: 22ch;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.entry-form :global(button.chip.add) {
		padding-inline: var(--space-3) var(--space-3-5);
	}

	.entry-form :global(.chip .x) {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: max(24px, var(--target));
		block-size: max(24px, var(--target));
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
		background: none;
		color: var(--ink);
	}

	@media (hover: hover) {
		.entry-form :global(.chip .x:hover),
		.entry-form :global(button.chip.add:hover) {
			background: var(--surface-tint);
		}
	}

	@media (min-width: 768px) {
		.entry-form {
			padding: var(--space-6);
		}

		.body {
			grid-template-columns: minmax(10rem, 14rem) minmax(0, 1fr);
			gap: var(--space-7);
		}

		.actions {
			flex-direction: row;
			justify-content: flex-end;
		}
	}
</style>
