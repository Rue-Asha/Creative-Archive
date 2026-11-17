<script lang="ts">
	import Icon from './Icon.svelte';

	type Props = { value?: string | null; invalid?: boolean; confirmed?: boolean; prefix?: string };
	let { value = null, invalid = false, confirmed = false, prefix = 'rating' }: Props = $props();

	const rated = $derived(value !== null && value !== '' && !invalid);
	const num = $derived(rated ? Number(value) : null);
</script>

<section class="card w-rating-card" data-surface="inverse" aria-label="Rating" data-rated={rated || undefined}>
	<label class="w-label" for="{prefix}-field">Rating</label>
	<div class="w-figure-row">
		<button type="button" class="w-btn icon" aria-label="Rating: one less" disabled={num === null || num <= 0}><Icon name="minus" size={18} /></button>
		<div class="w-figure" data-confirmed={confirmed || undefined}>
			<input
				class="w-figure-input"
				id="{prefix}-field"
				type="text"
				inputmode="decimal"
				autocomplete="off"
				spellcheck="false"
				role="spinbutton"
				aria-valuemin="0"
				aria-valuemax="10"
				aria-valuenow={num ?? undefined}
				aria-valuetext={rated ? `${value} of 10` : 'Not rated'}
				aria-invalid={invalid ? 'true' : undefined}
				aria-describedby="{prefix}-hint"
				placeholder="–"
				value={value ?? ''}
			/>
			{#if value !== null && value !== ''}<span class="w-figure-suffix" aria-hidden="true">/ 10</span>{/if}
		</div>
		<button type="button" class="w-btn icon" aria-label="Rating: one more" disabled={num !== null && num >= 10}><Icon name="plus" size={18} /></button>
	</div>
	{#if invalid}
		<p class="w-error" id="{prefix}-hint" role="alert"><Icon name="alert" size={14} />Rating must be between 0 and 10 with up to two decimals</p>
	{:else}
		<p class="w-hint" id="{prefix}-hint">0 to 10, up to two decimals. Leave empty for no rating.</p>
	{/if}
	{#if rated}<button type="button" class="w-btn s quiet">Clear rating</button>{/if}
</section>
