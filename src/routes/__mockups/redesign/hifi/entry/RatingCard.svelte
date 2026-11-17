<script lang="ts">
	import Icon from '../shell/Icon.svelte';

	// The charcoal card: the typed figure out of 10 with round "Rating: one less / one more" buttons (step 0.25; R-CA1), typing kept.
	type Props = { value?: string | null; invalid?: boolean; confirmed?: boolean; held?: boolean };
	let { value = null, invalid = false, confirmed = false, held = false }: Props = $props();
	const id = $props.id();
	const rated = $derived(value !== null && value !== '' && !invalid);
	const num = $derived(rated ? Number(value) : null);
</script>

<section class="card rating" data-surface="inverse" aria-label="Rating" data-rated={rated || undefined}>
	<div class="field figure" class:invalid>
		<label for="{id}-f">Rating</label>
		<div class="row3">
			<button type="button" class="btn icon step" aria-label="Rating: one less" disabled={num === null ? false : num <= 0} data-press="round"><Icon name="minus" size={18} /></button>
			<div class="figwrap" data-confirm-line data-confirmed={confirmed || undefined} data-held={held || undefined}>
				<div class="control">
					<input
						id="{id}-f"
						type="text"
						inputmode="decimal"
						autocomplete="off"
						spellcheck="false"
						enterkeyhint="done"
						role="spinbutton"
						aria-valuemin="0"
						aria-valuemax="10"
						aria-valuenow={num ?? undefined}
						aria-valuetext={rated ? `${value} of 10` : 'Not rated'}
						aria-invalid={invalid ? 'true' : undefined}
						aria-describedby="{id}-h"
						placeholder="–"
						value={value ?? ''}
					/>
					{#if value !== null && value !== ''}<span class="affix" aria-hidden="true">/ 10</span>{/if}
				</div>
			</div>
			<button type="button" class="btn icon step" aria-label="Rating: one more" disabled={num !== null && num >= 10} data-press="round"><Icon name="plus" size={18} /></button>
		</div>
		{#if invalid}
			<p class="error" id="{id}-h" role="alert"><Icon name="alert" size={14} />Rating must be between 0 and 10 with up to two decimals</p>
		{:else}
			<p class="hint" id="{id}-h">0 to 10, up to two decimals. Leave empty for no rating.</p>
		{/if}
	</div>
	{#if rated}<button type="button" class="btn quiet s clear" data-press>Clear rating</button>{/if}
</section>

<style>
	.rating { container-type: inline-size; display: grid; align-content: space-between; gap: var(--space-4); padding: var(--space-6) var(--space-5) var(--space-5); }
	.field { gap: var(--space-3); }
	.row3 { display: flex; align-items: center; gap: var(--space-3); min-inline-size: 0; }
	.figwrap { display: inline-grid; min-inline-size: 0; }
	.hint { max-inline-size: 30ch; }
	.step { flex: none; background: var(--surface-inverse-tint); box-shadow: var(--ring-on-inverse); color: var(--ink-on-inverse); }
	.step:disabled { background: none; color: var(--ink-on-inverse-secondary); opacity: var(--disabled-opacity); }
	.field.figure .control { margin-block: var(--space-2) var(--space-1); }
	.clear { justify-self: start; padding-inline: 0; color: var(--ink-on-inverse); text-decoration: underline; text-underline-offset: 0.3em; }
	.figwrap[data-held]::after { animation: none; opacity: 1; }
	.figwrap[data-confirmed]::after { bottom: var(--confirm-bottom, 0); }
	@media (hover: hover) {
		.step:not(:disabled):hover { background: var(--surface-inverse-tint-strong); }
		.clear:hover { background: none; text-decoration-thickness: var(--stroke-rule); }
	}
	@container (max-width: 21rem) {
		.rating :global(.field.figure input) { font-size: var(--type-display-l-size); line-height: var(--type-display-l-line); }
		.rating :global(.field.figure .affix) { font-size: var(--type-body-size); }
		.row3 { gap: var(--space-2); }
	}
</style>
