<script lang="ts">
	import Sheet from '#lib/components/sheet/Sheet.svelte';
	import { page } from '$app/state';
	import { COPY } from '#lib/copy.ts';
	import { DOMAIN_LABEL, DOMAINS, type Domain } from '#lib/domains.ts';
	import { addItems } from './addItems.ts';

	// `open` is owned by the layout, which pushes the history entry that Back pops
	let { scope, list, open = $bindable(false) }: { scope: Domain | 'all'; list?: string; open?: boolean } = $props();

	const items = $derived(addItems(scope, { list }));
	const groups = $derived(DOMAINS.filter((d) => items.some((i) => i.domain === d)).map((domain) => ({ domain, label: DOMAIN_LABEL[domain], items: items.filter((i) => i.domain === domain) })));
	const title = $derived(scope === 'all' ? COPY.addSheetAll : COPY.addSheetDomain.replace('{domain}', DOMAIN_LABEL[scope]));
	const marked = () => (page.state as { plus?: boolean }).plus === true;

	let leaving = false;
	let wasMarked = false;

	// Back (or a link's own navigation) drops the history entry first; pushState lands a tick after the sheet opens
	$effect(() => {
		const now = marked();
		if (open && wasMarked && !now) open = false;
		wasMarked = now;
	});

	function closed() {
		if (!leaving && marked()) history.back();
		leaving = false;
	}
</script>

<Sheet bind:open kicker="New entry" {title} onclose={closed}>
	<div class="groups">
		{#each groups as group (group.domain)}
			<div class="group" role="group" aria-label={group.label}>
				{#if scope === 'all'}<h3 class="ruled">{group.label}</h3>{/if}
				<ul>
					{#each group.items as item (item.href)}
						<li>
							<a class="chip" href={item.href} data-press onclick={() => (leaving = true)}>
								{item.label}{#if item.href.endsWith('status=owned')}<span class="note">Owned</span>{/if}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</Sheet>

<style>
	.groups {
		display: grid;
		gap: var(--space-5);
		align-content: start;
	}

	.group {
		display: grid;
		gap: var(--space-3);
		min-inline-size: 0;
	}

	ul {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		max-inline-size: 100%;
		min-block-size: max(var(--control-height), var(--target));
		padding-inline: var(--space-5);
		border-radius: var(--radius-pill);
		background: var(--surface-raised);
		box-shadow: var(--ring-control);
		color: var(--ink);
		font-size: var(--type-label-size);
		line-height: var(--type-label-line);
		font-weight: var(--type-label-weight);
		text-decoration: none;
		overflow-wrap: anywhere;
	}

	.note {
		font-weight: var(--weight-regular);
		color: var(--ink-secondary);
	}

	.note::before {
		content: '· ' / '';
	}

	@media (hover: hover) {
		.chip:hover {
			background: var(--surface-sunken);
		}
	}
</style>
