<script lang="ts">
	import type { Status } from '#lib/types.ts';
	import Chip from '#lib/ui/Chip.svelte';
	import IconButton from '#lib/ui/IconButton.svelte';
	import { statusLabel } from './derive.ts';
	import type { TypeConfig } from './config.ts';
	import { MEDIA_STATUSES, PIECE_STATUSES, type ListState } from './query.ts';

	let {
		config,
		state,
		tags,
		fixedStatus = false,
		onchange
	}: {
		config: TypeConfig;
		state: ListState;
		tags: { id: number; name: string }[];
		// the Wardrobe list is pieces with status owned, so it has no status filter of its own
		fixedStatus?: boolean;
		onchange: (next: ListState) => void;
	} = $props();

	const statuses = $derived(
		fixedStatus ? [] : config.status === 'media' ? MEDIA_STATUSES.filter((s) => s !== 'none') : config.status === 'piece' ? PIECE_STATUSES : []
	);
	const kinds = $derived(config.type === 'site' ? ([['shop', 'Shop'], ['site', 'Site']] as const) : []);
	const ratings = Array.from({ length: 9 }, (_, i) => 1 + i / 2);
	const hasChips = $derived(statuses.length > 0 || kinds.length > 0);

	const pick = (patch: ListState) => onchange({ ...state, ...patch });
</script>

<div class="filters liquid" role="toolbar" aria-label="Filters">
	{#if hasChips}
		<Chip label="All" active={!state.status && !state.kind} onclick={() => pick({ status: undefined, kind: undefined })} />
		{#each statuses as status (status)}
			<Chip label={statusLabel(config.type, status as Status)!} active={state.status === status} onclick={() => pick({ status })} />
		{/each}
		{#each kinds as [kind, label] (kind)}
			<Chip {label} active={state.kind === kind} onclick={() => pick({ kind })} />
		{/each}
	{/if}
	<span class="spacer"></span>
	{#if tags.length}
		<label class="select">
			<span class="visually-hidden">Tag</span>
			<select value={String(state.tag ?? '')} onchange={(e) => pick({ tag: e.currentTarget.value ? Number(e.currentTarget.value) : undefined })}>
				<option value="">All tags</option>
				{#each tags as tag (tag.id)}<option value={String(tag.id)}>{tag.name}</option>{/each}
			</select>
		</label>
	{/if}
	{#if config.ratable}
		<label class="select">
			<span class="visually-hidden">Minimum rating</span>
			<select value={String(state.minRating ?? '')} onchange={(e) => pick({ minRating: e.currentTarget.value ? Number(e.currentTarget.value) : undefined })}>
				<option value="">Any rating</option>
				{#each ratings as n (n)}<option value={String(n)}>{n}+</option>{/each}
			</select>
		</label>
	{/if}
	<label class="select">
		<span class="visually-hidden">Sort</span>
		<select value={state.sort ?? 'added'} onchange={(e) => pick({ sort: e.currentTarget.value as ListState['sort'] })}>
			<option value="added">Recently added</option>
			{#if config.ratable}<option value="rating">Rating</option>{/if}
			<option value="title">Title</option>
		</select>
	</label>
	{#if config.status === 'media'}
		<span class="toggle" role="group" aria-label="View">
			<IconButton icon="grid" label="Grid" variant={state.view ? 'outline' : 'solid'} aria-pressed={!state.view} onclick={() => pick({ view: undefined })} />
			<IconButton icon="rows" label="Shelves" variant={state.view ? 'solid' : 'outline'} aria-pressed={!!state.view} onclick={() => pick({ view: 'shelves' })} />
		</span>
	{/if}
</div>

<style>
	.filters {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-2);
		padding: 6px;
		border-radius: var(--r-panel);
	}

	.spacer {
		flex: 1;
	}

	.select select {
		min-block-size: 44px;
		padding: 0 var(--s-8) 0 var(--s-4);
		border-radius: var(--r-pill);
		border: 1px solid var(--line);
		background: var(--surface);
		appearance: none;
		background-image: linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%);
		background-position:
			calc(100% - 20px) 50%,
			calc(100% - 15px) 50%;
		background-size: 5px 5px;
		background-repeat: no-repeat;
		font-size: 14px;
		font-weight: 500;
	}

	.toggle {
		display: inline-flex;
		gap: 4px;
	}

	/* one swipeable row on phone instead of a wrapped block */
	@media (max-width: 1023px) {
		.filters {
			flex-wrap: nowrap;
			overflow-x: auto;
			border-radius: var(--r-pill);
			scrollbar-width: none;
		}

		.filters > :global(*) {
			flex: none;
		}

		.spacer {
			display: none;
		}
	}
</style>
