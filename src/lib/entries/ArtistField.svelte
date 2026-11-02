<script lang="ts">
	import { tick } from 'svelte';
	import { fold } from '#lib/text.ts';
	import type { Id } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';

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
		<span class="linked token" data-linked role="group" aria-labelledby="artist-label">
			<span>{name}</span>
			<button type="button" aria-label="Unlink artist" onclick={unlink}><Icon name="x" size={14} /></button>
		</span>
	{:else}
		<label for="f-artist">Artist</label>
		<div class="combo">
			<input
				id="f-artist"
				bind:this={input}
				name="artistName"
				class="control"
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
				<ul class="options liquid liquid-strong" id="artist-options" role="listbox" aria-label="Artists">
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
	.label {
		font-size: var(--t-small);
		font-weight: 600;
	}

	.combo {
		position: relative;
	}

	.options {
		position: absolute;
		inset-inline: 0;
		inset-block-start: calc(100% + 6px);
		z-index: 5;
		padding: var(--s-2);
		border-radius: var(--r-md);
	}

	.options li {
		display: flex;
		align-items: center;
		min-block-size: 44px;
		padding: 0 var(--s-3);
		border-radius: var(--r-sm);
		cursor: pointer;
	}

	.options li[aria-selected='true'],
	.options li:hover {
		background: var(--accent-soft);
	}

	.linked {
		align-self: flex-start;
	}

	.linked button {
		display: grid;
		place-items: center;
		inline-size: 44px;
		block-size: 44px;
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
		color: inherit;
	}
</style>
