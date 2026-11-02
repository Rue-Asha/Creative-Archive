<script lang="ts">
	import type { Snippet } from 'svelte';
	import { DOMAIN_LABEL } from '#lib/domains.ts';
	import { TYPES } from '#lib/entries/config.ts';
	import type { Entry, Handles } from '#lib/types.ts';
	import Chip from '#lib/ui/Chip.svelte';
	import Eyebrow from '#lib/ui/Eyebrow.svelte';
	import GlassPanel from '#lib/ui/GlassPanel.svelte';

	let {
		entry,
		controls,
		actions
	}: {
		entry: Entry;
		// status, rating and progress
		controls?: Snippet;
		// Edit, Delete and whatever a later unit adds
		actions?: Snippet;
	} = $props();

	const config = $derived(TYPES[entry.type]);
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
</script>

<GlassPanel as="section" strong data-detail-panel>
	<div class="inner">
		<Eyebrow parts={[DOMAIN_LABEL[config.domain], config.label]} tone="accent" />
		<h1 class:long={entry.title.length > 60}>{entry.title}</h1>
		{#if config.artist && entry.artistName}
			<p class="creator">
				{#if entry.artistId !== null}<a href="/entries/{entry.artistId}">{entry.artistName}</a>{:else}{entry.artistName}{/if}
			</p>
		{/if}
		{#if controls}<div class="controls">{@render controls()}</div>{/if}
		{#if rows.length}
			<dl class="fields">
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
		{#if entry.tags.length}
			<ul class="tags" aria-label="Tags">
				{#each entry.tags as tag (tag.id)}
					<li><Chip static tone="soft" label={tag.name} /></li>
				{/each}
			</ul>
		{/if}
		{#if entry.note}<p class="note" data-prose>{entry.note}</p>{/if}
		{#if actions}<div class="actions">{@render actions()}</div>{/if}
	</div>
</GlassPanel>

<style>
	.inner {
		display: grid;
		gap: var(--s-5);
		padding: var(--s-6);
		min-inline-size: 0;
	}

	h1 {
		font-size: var(--t-display-2);
		overflow-wrap: anywhere;
	}

	h1.long {
		font-size: var(--t-display-3);
		line-height: 1.1;
	}

	.creator {
		margin-block-start: calc(var(--s-3) * -1);
		font-size: var(--t-title);
		font-weight: 500;
		color: var(--ink-2);
	}

	.creator a {
		text-decoration: underline;
		text-underline-offset: 4px;
		text-decoration-color: var(--accent);
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-4);
	}

	.fields {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: var(--s-4) var(--s-6);
		margin: 0;
	}

	.fields > div {
		min-inline-size: 0;
	}

	.fields .block {
		grid-column: 1 / -1;
	}

	dt {
		font-size: var(--t-eyebrow);
		font-weight: 600;
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		color: var(--ink-2);
	}

	dd {
		margin: 2px 0 0;
		overflow-wrap: anywhere;
	}

	dd a {
		text-decoration: underline;
		text-underline-offset: 3px;
		text-decoration-color: var(--accent);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--s-2);
	}

	.note {
		white-space: pre-line;
		overflow-wrap: anywhere;
		color: var(--ink-2);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--s-3);
	}

	@media (min-width: 768px) {
		.inner {
			padding: var(--s-8);
		}

		h1 {
			font-size: var(--t-display-1);
		}

		h1.long {
			font-size: var(--t-display-3);
		}
	}
</style>
