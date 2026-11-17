<script lang="ts">
	import type { Domain } from '../../fixtures.ts';
	import { addGroups, base, DOMAIN_LABEL } from './data.ts';
	import Icon from './Icon.svelte';

	type Props = { scope: Domain | 'all'; list?: string; onclose?: () => void; inline?: boolean };
	let { scope, list, onclose, inline = false }: Props = $props();

	const groups = $derived(addGroups(scope));
	const title = $derived(scope === 'all' ? 'Add to your archive' : `Add to ${DOMAIN_LABEL[scope]}`);
	const id = $props.id();
</script>

<svelte:window onkeydown={(e) => !inline && e.key === 'Escape' && onclose?.()} />

<div class="layer" class:inline>
	{#if !inline}<button type="button" class="scrim" tabindex="-1" aria-label="Close" onclick={onclose}></button>{/if}
	<div class="sheet" role="dialog" aria-modal={inline ? undefined : 'true'} aria-labelledby="sheet-{id}">
		<header>
			<h2 id="sheet-{id}">{title}</h2>
			<button type="button" class="fw-icon s" aria-label="Close" onclick={onclose}><Icon name="close" size={18} /></button>
		</header>
		{#each groups as group (group.domain)}
			<div class="group" role="group" aria-labelledby="g-{id}-{group.domain}">
				{#if scope === 'all'}<h3 id="g-{id}-{group.domain}">{group.label}</h3>{/if}
				<ul>
					{#each group.items as item (item.type)}
						<li>
							<a class="fw-chip" href="{base}/wire/add" data-type={item.type}>
								{item.label}{#if list === 'wardrobe' && item.type === 'piece'}<span class="n">Owned</span>{/if}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
		{#if list === 'wardrobe'}<p class="hint">Opened from Wardrobe: a new piece starts as Owned.</p>{/if}
	</div>
</div>

<style>
	.layer { position: fixed; inset: 0; z-index: var(--z-sheet); display: grid; align-items: end; justify-items: center; }
	.layer.inline { position: relative; inset: auto; display: block; }
	.scrim { position: absolute; inset: 0; border: 0; padding: 0; background: var(--surface-tint-strong); cursor: default; }
	.sheet { position: relative; display: grid; gap: var(--space-4); inline-size: min(100%, 32rem); max-block-size: 85dvh; overflow-y: auto; padding: var(--space-5) var(--space-5) max(var(--space-6), env(safe-area-inset-bottom)); border-radius: var(--radius-card) var(--radius-card) 0 0; background: var(--surface-raised); box-shadow: var(--ring-hairline); min-inline-size: 0; }
	.inline .sheet { inline-size: 100%; border-radius: var(--radius-card); max-block-size: none; }
	@media (min-width: 768px) {
		.layer:not(.inline) { align-items: center; }
		.layer:not(.inline) .sheet { border-radius: var(--radius-card); }
	}
	header { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
	h2 { font-size: var(--type-display-s-size); line-height: var(--type-display-s-line); }
	.group { display: grid; gap: var(--space-2); }
	h3 { font-size: var(--type-overline-size); line-height: var(--type-overline-line); letter-spacing: var(--type-overline-tracking); font-weight: var(--type-overline-weight); text-transform: uppercase; color: var(--ink-secondary); }
	ul { display: flex; flex-wrap: wrap; gap: var(--space-2); margin: 0; padding: 0; list-style: none; }
	.hint { font-size: var(--type-caption-size); color: var(--ink-muted); }
</style>
