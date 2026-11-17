<script lang="ts">
	import { tick } from 'svelte';
	import Button from '#lib/components/button/Button.svelte';
	import { fold } from '#lib/text.ts';
	import type { Id } from '#lib/types.ts';

	// A chosen artist is a link (`id`, posted as artistId); anything else stays text. The server re-checks the id.
	let {
		artists,
		name = $bindable(),
		id = $bindable(),
		ondirty
	}: {
		artists: { id: Id; title: string }[];
		name: string;
		id: Id | null;
		ondirty?: () => void;
	} = $props();

	let input: HTMLInputElement | undefined = $state();
	let open = $state(false);
	let active = $state(-1);

	const matches = $derived.by(() => {
		const q = fold(name);
		return q ? artists.filter((a) => fold(a.title).includes(q)).slice(0, 8) : [];
	});
	const shown = $derived(open && matches.length > 0);

	function choose(artist: { id: Id; title: string }) {
		id = artist.id;
		name = artist.title;
		open = false;
		active = -1;
		ondirty?.();
	}

	function unlink() {
		id = null;
		ondirty?.();
		tick().then(() => input?.focus());
	}

	function onInput() {
		open = true;
		active = -1;
		ondirty?.();
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			if (matches.length === 0) return;
			event.preventDefault();
			open = true;
			const step = event.key === 'ArrowDown' ? 1 : -1;
			active = Math.min(Math.max(active + step, 0), matches.length - 1);
		} else if (event.key === 'Enter' && shown && active >= 0) {
			event.preventDefault();
			choose(matches[active]);
		} else if (event.key === 'Escape' && shown) {
			event.preventDefault();
			open = false;
		}
	}
</script>

<div class="field">
	<input type="hidden" name="artistId" value={id ?? ''} />
	{#if id !== null}
		<input type="hidden" name="artistName" value={name} />
		<span class="label" id="artist-label">Artist</span>
		<div class="linked">
			<span class="chip" data-linked role="group" aria-labelledby="artist-label"><span>{name}</span></span>
			<Button variant="quiet" size="s" onclick={unlink}>Unlink artist</Button>
		</div>
	{:else}
		<label for="f-artist">Artist</label>
		<div class="combo">
			<input
				id="f-artist"
				bind:this={input}
				name="artistName"
				role="combobox"
				aria-expanded={shown}
				aria-controls="artist-options"
				aria-autocomplete="list"
				aria-activedescendant={shown && active >= 0 ? `artist-option-${active}` : undefined}
				bind:value={name}
				oninput={onInput}
				onkeydown={onKeydown}
				onblur={() => (open = false)}
				autocomplete="off"
			/>
			{#if shown}
				<ul class="options" id="artist-options" role="listbox" aria-label="Artists">
					{#each matches as artist, i (artist.id)}
						<!-- keys go through the input (aria-activedescendant); the pointer must not blur it before the click lands -->
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<li
							id="artist-option-{i}"
							role="option"
							aria-selected={i === active}
							onmousedown={(e) => e.preventDefault()}
							onclick={() => choose(artist)}
						>
							{artist.title}
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
</div>

<style>
	.field {
		display: grid;
		gap: var(--space-1-5);
		min-inline-size: 0;
	}

	label,
	.label {
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
	}

	.combo {
		position: relative;
	}

	input[role='combobox'] {
		inline-size: 100%;
		min-block-size: max(var(--control-height), var(--target));
		padding: 0 var(--space-4);
		border: 0;
		border-radius: var(--radius-control);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink);
		font-size: var(--type-body-size);
	}

	input[role='combobox']:focus-visible {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}

	.options {
		position: absolute;
		inset-inline: 0;
		inset-block-start: calc(100% + var(--space-1-5));
		z-index: var(--z-menu);
		display: grid;
		gap: var(--space-0-5);
		margin: 0;
		padding: var(--space-1-5);
		list-style: none;
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--elevation-menu);
	}

	.options li {
		display: flex;
		align-items: center;
		min-block-size: max(var(--control-height-s), var(--target));
		padding-inline: var(--space-3);
		border-radius: var(--radius-item);
		font-size: var(--type-body-s-size);
		overflow-wrap: anywhere;
		cursor: default;
	}

	.options li[aria-selected='true'] {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
	}

	@media (hover: hover) {
		.options li:not([aria-selected='true']):hover {
			background: var(--surface-sunken);
		}
	}

	/* the linked artist is a plain chip with a text button beside it (hi-fi), not a chip with a ×: unlinking is a choice */
	.linked {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
		min-inline-size: 0;
	}

	.linked .chip {
		padding-inline: var(--space-3-5);
	}
</style>
