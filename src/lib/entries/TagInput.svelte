<script lang="ts">
	import { glide, rise } from '#lib/motion.ts';
	import { fold } from '#lib/text.ts';
	import type { Tag } from '#lib/types.ts';
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
</script>

<div class="field">
	<label for="f-tag">Tags</label>
	{#each selected as name (fold(name))}
		<input type="hidden" name="tag" value={name} />
	{/each}
	<ul class="box" aria-label="Selected tags">
		{#each selected as name (fold(name))}
			<li class="chip" in:rise animate:glide>
				<span>{name}</span>
				{#if isNew(name)}<span class="badge">new</span>{/if}
				<button type="button" class="x" aria-label="Remove {name}" onclick={() => remove(name)}><Icon name="x" size={14} /></button>
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
				<button
					type="button"
					class="chip add"
					in:rise
					animate:glide
					onclick={() => {
						add(tag.name);
						pending = '';
					}}
				>
					<Icon name="plus" size={14} /><span>{tag.name}</span>
				</button>
			{/each}
		</div>
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

	.box {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-1-5);
		min-block-size: max(var(--control-height), var(--target));
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-panel);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
	}

	.box:has(input:focus-visible) {
		outline: var(--focus-width) solid var(--focus-ring);
		outline-offset: var(--focus-offset);
	}

	.badge {
		font-size: var(--type-overline-size);
		font-weight: var(--weight-semibold);
		letter-spacing: var(--type-kicker-tracking);
		text-transform: uppercase;
		color: var(--ink-secondary);
	}

	.entry {
		flex: 1;
		min-inline-size: 7rem;
	}

	.entry input {
		inline-size: 100%;
		min-block-size: max(var(--control-height-s), var(--target));
		padding: 0 var(--space-2);
		border: 0;
		background: none;
		font-size: var(--type-body-size);
	}

	.entry input:focus-visible {
		outline: none;
	}

	.entry input::placeholder {
		color: var(--ink-muted);
		opacity: 1;
	}

	.suggest {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1-5);
	}
</style>
