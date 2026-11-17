<script lang="ts" module>
	// The view choice's pill glides (motion.css "2. The pill glides"): an inert charcoal copy of the track is laid over it and
	// clipped to the pressed option, so labels change colour exactly under the pill. Keyboard activation, scroll and resize jump.
	function pill(track: HTMLElement) {
		const items = [...track.querySelectorAll<HTMLElement>('button')];
		const host = track.parentElement;
		if (!items.length || !host) return {};
		const isOn = (i: HTMLElement) => i.getAttribute('aria-pressed') === 'true';

		host.setAttribute('data-pill-host', '');
		track.setAttribute('data-pill-track', '');
		items.forEach((i) => i.setAttribute('data-pill-item', ''));
		const ghost = track.cloneNode(true) as HTMLElement;
		ghost.removeAttribute('data-pill-track');
		ghost.setAttribute('data-pill-ghost', '');
		ghost.setAttribute('aria-hidden', 'true');
		ghost.inert = true;
		ghost.querySelectorAll('[id], [aria-pressed], [data-pill-item]').forEach((n) => {
			for (const a of ['id', 'aria-pressed']) n.removeAttribute(a);
			n.setAttribute('tabindex', '-1');
		});
		track.after(ghost);

		function place(instant: boolean) {
			if (instant) ghost.setAttribute('data-pill-instant', '');
			const h = host!.getBoundingClientRect();
			const b = track.getBoundingClientRect();
			Object.assign(ghost.style, { left: `${b.left - h.left}px`, top: `${b.top - h.top}px`, width: `${b.width}px`, height: `${b.height}px` });
			const cur = items.find(isOn);
			if (cur) {
				const t = cur.offsetTop;
				const l = cur.offsetLeft;
				ghost.style.setProperty('--pill-clip', `inset(${t}px ${track.offsetWidth - l - cur.offsetWidth}px ${track.offsetHeight - t - cur.offsetHeight}px ${l}px round 999px)`);
			} else ghost.style.removeProperty('--pill-clip');
			if (instant) {
				void getComputedStyle(ghost).clipPath;
				ghost.removeAttribute('data-pill-instant');
			}
		}

		const observer = new ResizeObserver(() => place(true));
		observer.observe(track);
		place(true);
		// the view lives in the URL, so Back moves the pill too: glide once the new option is marked
		const marks = new MutationObserver(() => place(false));
		marks.observe(track, { attributes: true, attributeFilter: ['aria-pressed'], subtree: true });

		return {
			destroy() {
				observer.disconnect();
				marks.disconnect();
				ghost.remove();
				host.removeAttribute('data-pill-host');
				track.removeAttribute('data-pill-track');
				items.forEach((i) => i.removeAttribute('data-pill-item'));
			}
		};
	}
</script>

<script lang="ts">
	import Button from '#lib/components/button/Button.svelte';
	import Select from '#lib/components/select/Select.svelte';
	import type { Status } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';
	import { statusLabel } from './derive.ts';
	import type { TypeConfig } from './config.ts';
	import { MEDIA_STATUSES, PIECE_STATUSES, type ListState } from './query.ts';

	let {
		config,
		state,
		tags,
		fixedStatus = false,
		onchange,
		addHref = null,
		selecting = false,
		onselect
	}: {
		config: TypeConfig;
		state: ListState;
		tags: { id: number; name: string }[];
		// the Wardrobe list is pieces with status owned, so it has no status filter of its own
		fixedStatus?: boolean;
		onchange: (next: ListState) => void;
		// "Add" and "Select" sit at the end of the bar, and Select mode takes them away (the selection bar has Done)
		addHref?: string | null;
		selecting?: boolean;
		onselect?: () => void;
	} = $props();

	const statuses = $derived(
		fixedStatus ? [] : config.status === 'media' ? MEDIA_STATUSES.filter((s) => s !== 'none') : config.status === 'piece' ? [...PIECE_STATUSES] : []
	);
	const isSite = $derived(config.type === 'brand' || config.type === 'site');
	const kinds = $derived(isSite ? ([['brand', 'Brand'], ['shop', 'Shop'], ['site', 'Site']] as const) : []);
	const ratings = [9, 8, 7, 6, 5];
	// a value typed into the URL that is not a whole step still shows what it is
	const ratingOptions = $derived([
		{ value: '', label: 'Any rating' },
		...(state.minRating !== undefined && !ratings.includes(state.minRating) ? [{ value: String(state.minRating), label: `${state.minRating} and up` }] : []),
		...ratings.map((n) => ({ value: String(n), label: `${n} and up` }))
	]);
	const sorts = $derived([
		{ value: 'added', label: 'Recently added' },
		...(config.ratable ? [{ value: 'rating', label: 'Rating' }] : []),
		{ value: 'title', label: 'Title' }
	]);

	const pick = (patch: ListState) => onchange({ ...state, ...patch });
</script>

{#snippet glyph(name: 'status' | 'tag' | 'star' | 'sort')}
	{#if name === 'status'}
		<Icon name="check" size={18} />
	{:else}
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
			{#if name === 'tag'}
				<path d="M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9z" /><path d="M8.5 8.5h.01" />
			{:else if name === 'star'}
				<path d="M12 3.5l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6-4.5-4.2 6.1-.8z" />
			{:else}
				<path d="M4 5h16M4 12h16M4 19h16" />
			{/if}
		</svg>
	{/if}
{/snippet}

<div class="seg-bar" role="toolbar" aria-label="Filters">
	{#if statuses.length}
		<div class="seg">
			<span class="g">{@render glyph('status')}</span>
			<Select
				label="Status"
				value={state.status ?? ''}
				options={[{ value: '', label: 'All' }, ...statuses.map((s) => ({ value: s, label: statusLabel(config.type, s as Status)! }))]}
				onchange={(e) => pick({ status: e.currentTarget.value ? (e.currentTarget.value as Status) : undefined })}
			/>
		</div>
	{/if}
	{#if kinds.length}
		<div class="seg">
			<span class="g">{@render glyph('status')}</span>
			<Select
				label="Kind"
				value={state.kind ?? ''}
				options={[{ value: '', label: 'All' }, ...kinds.map(([value, label]) => ({ value, label }))]}
				onchange={(e) => pick({ kind: e.currentTarget.value ? (e.currentTarget.value as 'brand') : undefined })}
			/>
		</div>
	{/if}
	{#if tags.length}
		<div class="seg">
			<span class="g">{@render glyph('tag')}</span>
			<Select
				label="Tag"
				value={String(state.tag ?? '')}
				options={[{ value: '', label: 'All tags' }, ...tags.map((t) => ({ value: String(t.id), label: t.name }))]}
				onchange={(e) => pick({ tag: e.currentTarget.value ? Number(e.currentTarget.value) : undefined })}
			/>
		</div>
	{/if}
	{#if config.ratable}
		<div class="seg">
			<span class="g">{@render glyph('star')}</span>
			<Select
				label="Minimum rating"
				value={state.minRating === undefined ? '' : String(state.minRating)}
				options={ratingOptions}
				onchange={(e) => pick({ minRating: e.currentTarget.value ? Number(e.currentTarget.value) : undefined })}
			/>
		</div>
	{/if}
	<div class="seg">
		<span class="g">{@render glyph('sort')}</span>
		<Select label="Sort" value={state.sort ?? 'added'} options={sorts} onchange={(e) => pick({ sort: e.currentTarget.value as ListState['sort'] })} />
	</div>
	{#if config.status === 'media'}
		<div class="seg view">
			<div class="view-track" role="group" aria-label="View" use:pill>
				<Button variant="quiet" size="s" aria-pressed={!state.view} onclick={() => pick({ view: undefined })}><Icon name="grid" size={16} />Grid</Button>
				<Button variant="quiet" size="s" aria-pressed={!!state.view} onclick={() => pick({ view: 'shelves' })}><Icon name="rows" size={16} />Shelves</Button>
			</div>
		</div>
	{/if}
	{#if !selecting && (addHref || onselect)}
		<div class="seg-actions acts">
			{#if onselect}<Button variant="secondary" data-select-enter onclick={onselect}><Icon name="select" size={16} />Select</Button>{/if}
			{#if addHref}<Button variant="primary" arrow href={addHref}>Add</Button>{/if}
		</div>
	{/if}
</div>

<style>
	.seg-bar {
		background: var(--surface-card);
	}
	.g {
		display: inline-flex;
		color: var(--ink);
	}
	/* the primitive's label is the cell's caption and its select the value, drawn as the specimen's .seg-label / .seg-value */
	.seg :global(.field) {
		gap: 0;
	}
	.seg :global(.field > label) {
		font-weight: var(--weight-semibold);
	}
	.seg :global(.field select) {
		min-block-size: max(var(--control-height-xs), var(--target));
		max-inline-size: 12em;
		padding-inline: 0 var(--space-6);
		border-radius: 0;
		background: none;
		box-shadow: var(--rule-below-control);
		color: var(--ink-secondary);
		font-size: var(--type-caption-size);
	}
	.seg :global(.field .control > svg) {
		inline-size: 14px;
		block-size: 14px;
		margin-inline-end: 0;
		color: var(--ink-secondary);
	}
	@media (hover: hover) {
		.seg :global(.field select:not(:disabled):hover) {
			background: none;
			color: var(--ink);
		}
	}
	.view-track {
		display: flex;
		gap: var(--space-0-5);
		padding: 0;
	}
	.view-track :global(.btn) {
		min-block-size: max(var(--control-height-xs), var(--target));
	}
	.view-track :global(.btn > svg) {
		color: inherit;
	}
	.acts {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
	}
	@media (max-width: 1099px) {
		.g {
			display: none;
		}
		.seg :global(.field select) {
			max-inline-size: 9.5em;
		}
	}
	@media (max-width: 767px) {
		.seg-bar {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			row-gap: var(--space-1);
		}
		.seg {
			padding: var(--space-2) var(--space-2-5);
			box-shadow: none;
		}
		.seg :global(.field) {
			inline-size: 100%;
		}
		.view,
		.seg-actions {
			grid-column: 1 / -1;
		}
		.view-track {
			inline-size: 100%;
		}
		.view-track :global(.btn) {
			flex: 1;
		}
		.seg :global(.field select) {
			max-inline-size: none;
			/* iOS zooms into a field under 16px */
			font-size: var(--type-body-size);
		}
		.acts {
			display: grid;
			grid-template-columns: minmax(0, 1fr);
		}
		.acts :global(.btn) {
			justify-content: center;
		}
		.acts :global(.btn.arrow) {
			justify-content: space-between;
		}
	}
</style>
