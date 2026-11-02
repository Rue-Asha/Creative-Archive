<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { pop, reducedMotion } from '#lib/motion.ts';
	import { fold } from '#lib/text.ts';
	import type { Tag } from '#lib/types.ts';
	import Chip from '#lib/ui/Chip.svelte';
	import Icon from '#lib/ui/Icon.svelte';

	// `selected` holds names; the typed-but-unconfirmed text is posted too (it is the `tag` input itself)
	let {
		tags,
		selected = $bindable(),
		pending = $bindable()
	}: { tags: Tag[]; selected: string[]; pending: string } = $props();

	const known = $derived(new Map(tags.map((t) => [fold(t.name), t.name])));
	const isNew = (name: string) => !known.has(fold(name));
	const suggestions = $derived.by(() => {
		const q = fold(pending);
		const taken = new Set(selected.map(fold));
		return tags.filter((t) => !taken.has(fold(t.name)) && fold(t.name).includes(q)).slice(0, 12);
	});

	let input: HTMLInputElement;

	function add(raw: string) {
		const typed = raw.normalize('NFC').trim().replace(/\s+/g, ' ');
		if (!typed || selected.some((s) => fold(s) === fold(typed))) return;
		selected.push(known.get(fold(typed)) ?? typed);
	}

	function remove(name: string) {
		selected.splice(selected.indexOf(name), 1);
		input.focus();
	}

	// a comma confirms what came before it, which also covers pasting "a, b, c"
	function onInput() {
		if (!pending.includes(',')) return;
		const parts = pending.split(',');
		pending = parts.pop() ?? '';
		parts.forEach(add);
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			event.preventDefault();
			add(pending);
			pending = '';
		} else if (event.key === 'Backspace' && pending === '' && selected.length > 0) {
			selected.pop();
		}
	}

	const leave = () => ({ duration: reducedMotion() ? 0 : 140 });
	const move = () => ({ duration: reducedMotion() ? 0 : 200 });
</script>

<div class="field">
	<label for="f-tag">Tags</label>
	{#each selected as name (fold(name))}
		<input type="hidden" name="tag" value={name} />
	{/each}
	<ul class="box" aria-label="Selected tags">
		{#each selected as name (fold(name))}
			<li class="tag token" animate:flip={move()} in:pop out:fade={leave()}>
				<span>{name}</span>
				{#if isNew(name)}<span class="badge">new</span>{/if}
				<button type="button" aria-label="Remove {name}" onclick={() => remove(name)}><Icon name="x" size={14} /></button>
			</li>
		{/each}
		<li class="entry">
			<input
				id="f-tag"
				bind:this={input}
				name="tag"
				bind:value={pending}
				oninput={onInput}
				onkeydown={onKeydown}
				placeholder="Add a tag"
				aria-label="Add a tag"
				autocomplete="off"
			/>
		</li>
	</ul>
	{#if suggestions.length > 0}
		<div class="suggest" role="group" aria-label="Tag suggestions">
			{#each suggestions as tag (tag.id)}
				<span animate:flip={move()} in:pop out:fade={leave()}>
					<Chip
						label={tag.name}
						icon="plus"
						size="sm"
						onclick={() => {
							add(tag.name);
							pending = '';
						}}
					/>
				</span>
			{/each}
		</div>
	{/if}
</div>

<style>
	.box {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2);
		padding: 6px;
		border-radius: var(--r-sm);
		border: 1px solid var(--line);
		background: var(--glass-thin);
		transition: border-color var(--d-fast) var(--ease-out);
	}

	.box:focus-within {
		border-color: var(--accent);
	}

	.badge {
		font-size: var(--t-eyebrow);
		font-weight: 600;
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--accent);
	}

	.tag button {
		display: grid;
		place-items: center;
		inline-size: 44px;
		block-size: 44px;
		border: 0;
		border-radius: var(--r-pill);
		background: transparent;
		opacity: 0.75;
		transition: opacity var(--d-fast) var(--ease-out);
	}

	.tag button:hover {
		opacity: 1;
	}

	.entry {
		flex: 1;
		min-inline-size: 110px;
	}

	.entry input {
		inline-size: 100%;
		min-block-size: 44px;
		padding: 0 8px;
		border: 0;
		background: none;
		font-size: var(--t-body);
	}

	.entry input:focus-visible {
		box-shadow: none;
	}

	.suggest {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
	}
</style>
