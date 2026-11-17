<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '#lib/components/button/Button.svelte';
	import { DOMAIN_LABEL } from '#lib/domains.ts';
	import { TYPES } from '#lib/entries/config.ts';
	import type { Entry, Handles } from '#lib/types.ts';
	import ImagePlaceholder from '#lib/ui/ImagePlaceholder.svelte';

	let {
		entry,
		controls
	}: {
		entry: Entry;
		// the status menu and "Mark as watched" / "Mark as read"
		controls?: Snippet;
	} = $props();

	const TAGS_SHOWN = 8;
	const config = $derived(TYPES[entry.type]);
	const ratio = $derived(config.domain === 'music' ? '1' : '3 / 4');
	const year = $derived(typeof entry.details.year === 'number' ? entry.details.year : null);
	const HANDLE_LABELS: Record<keyof Handles, string> = {
		instagram: 'Instagram',
		tiktok: 'TikTok',
		youtube: 'YouTube',
		website: 'Website'
	};

	interface Row {
		label: string;
		text: string;
		href?: string;
		block?: boolean;
	}

	const rows = $derived.by<Row[]>(() => {
		const out: Row[] = [];
		for (const field of config.fields) {
			const value = field.key === 'kind' ? entry.kind : entry.details[field.key];
			if (value === undefined || value === null || value === '') continue;
			if (field.input === 'handles') {
				for (const [key, handle] of Object.entries(value as Handles))
					if (handle) out.push({ label: HANDLE_LABELS[key as keyof Handles], text: handle, href: key === 'website' ? handle : undefined });
			} else if (field.input === 'list') {
				if ((value as string[]).length) out.push({ label: field.label, text: (value as string[]).join(', ') });
			} else if (field.input === 'select') {
				out.push({ label: field.label, text: field.options?.find((o) => o.value === value)?.label ?? String(value) });
			} else if (field.input === 'url') {
				out.push({ label: field.label, text: String(value).replace(/^https?:\/\//, ''), href: String(value) });
			} else {
				out.push({ label: field.label, text: String(value), block: field.input === 'textarea' });
			}
		}
		return out;
	});

	const tagsId = $props.id();
	let tagsOpen = $state(false);
	const tags = $derived(tagsOpen ? entry.tags : entry.tags.slice(0, TAGS_SHOWN));
</script>

<section class="card entry-card" data-surface="solid" aria-label={config.label} data-detail-panel>
	<figure class="cover" style:aspect-ratio={ratio} data-cover-id={entry.id}>
		{#if entry.imageId !== null}
			<img src="/images/{entry.imageId}" alt={entry.title} />
		{:else}
			<ImagePlaceholder title={entry.title} {year} />
		{/if}
	</figure>
	<div class="main">
		<p class="type-label">{DOMAIN_LABEL[config.domain]}<span class="sep" aria-hidden="true">·</span><span class="sr-only">, </span>{config.label}</p>
		{#if rows.length}
			<dl class="facts">
				{#each rows as row (row.label)}
					<div class:block={row.block}>
						<dt>{row.label}</dt>
						<dd>
							{#if row.href}<a href={row.href} target="_blank" rel="noopener noreferrer">{row.text}</a>{:else}{row.text}{/if}
						</dd>
					</div>
				{/each}
			</dl>
		{/if}
		{#if controls}<div class="controls">{@render controls()}</div>{/if}
		{#if entry.tags.length}
			<div class="tag-block">
				<ul class="tags" id={tagsId} aria-label="Tags">
					{#each tags as tag (tag.id)}
						<li class="tag">{tag.name}</li>
					{/each}
				</ul>
				{#if entry.tags.length > TAGS_SHOWN}
					<Button variant="quiet" size="s" aria-expanded={tagsOpen} aria-controls={tagsId} onclick={() => (tagsOpen = !tagsOpen)}>
						{tagsOpen ? 'Show fewer tags' : `Show all ${entry.tags.length} tags`}
					</Button>
				{/if}
			</div>
		{/if}
		{#if entry.note}<p class="note selectable">{entry.note}</p>{/if}
	</div>
</section>

<style>
	.entry-card {
		display: grid;
		grid-template-columns: minmax(9rem, 14.75rem) minmax(0, 1fr);
		gap: var(--space-6);
		padding: var(--space-3-5);
		min-inline-size: 0;
	}

	.cover {
		align-self: start;
		min-inline-size: 0;
		margin: 0;
		border-radius: var(--radius-panel);
		overflow: hidden;
		background: var(--surface-sunken);
	}

	.cover img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
	}

	.main {
		display: grid;
		align-content: start;
		gap: var(--space-5);
		min-inline-size: 0;
		padding: var(--space-2-5) var(--space-2) var(--space-2) 0;
	}

	.type-label {
		justify-self: start;
		display: inline-flex;
		align-items: center;
		min-block-size: 28px;
		padding: 0 var(--space-3);
		border-radius: var(--radius-pill);
		background: var(--surface-tint);
		font-size: var(--type-overline-size);
		line-height: 1;
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--type-overline-weight);
		text-transform: uppercase;
	}

	.sep {
		margin-inline: 0.6em;
	}

	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3) var(--space-8);
		margin: 0;
	}

	.facts > div {
		display: grid;
		gap: var(--space-0-5);
		min-inline-size: 0;
		padding-inline-start: var(--space-3);
		box-shadow: var(--rule-start);
	}

	.facts .block {
		flex: 1 0 100%;
	}

	dt {
		font-size: var(--type-overline-size);
		line-height: var(--type-overline-line);
		letter-spacing: var(--type-overline-tracking);
		font-weight: var(--type-overline-weight);
		text-transform: uppercase;
		color: var(--ink-secondary);
	}

	dd {
		margin: 0;
		font-size: var(--type-body-size);
		line-height: var(--type-body-s-line);
		font-variant-numeric: var(--numeric-figures);
		overflow-wrap: anywhere;
	}

	dd a {
		text-decoration: underline;
		text-underline-offset: 0.25em;
		text-decoration-color: var(--edge-control);
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3);
		min-inline-size: 0;
	}

	.tag-block {
		display: grid;
		justify-items: start;
		gap: var(--space-2);
		min-inline-size: 0;
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1-5);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.tag {
		display: inline-flex;
		align-items: center;
		max-inline-size: 100%;
		min-block-size: max(var(--control-height-xs), var(--target-min));
		padding-inline: var(--space-3-5);
		border-radius: var(--radius-pill);
		background: var(--surface-sunken);
		box-shadow: var(--ring-hairline);
		font-size: var(--type-caption-size);
		overflow-wrap: anywhere;
	}

	.note {
		max-inline-size: var(--measure);
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
		color: var(--ink-secondary);
		white-space: pre-line;
		overflow-wrap: anywhere;
	}

	@media (max-width: 767px) {
		.entry-card {
			grid-template-columns: 6.5rem minmax(0, 1fr);
			gap: var(--space-4);
			padding: var(--space-3);
		}

		.main {
			display: contents;
		}

		.type-label {
			align-self: center;
		}

		.facts,
		.controls,
		.tag-block,
		.note {
			grid-column: 1 / -1;
		}

		.facts {
			gap: var(--space-3) var(--space-5);
			padding-inline: var(--space-1);
		}
	}
</style>
