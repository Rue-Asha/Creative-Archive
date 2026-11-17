<script lang="ts">
	import Icon from '../shell/Icon.svelte';
	import Glyph from '../list/Glyph.svelte';

	// one dark arrow pill "Save"; Cancel beside it is a plain secondary button
	type Props = { saving?: boolean; cancelHref: string };
	let { saving = false, cancelHref }: Props = $props();
</script>

<div class="foot">
	<a class="btn secondary" href={cancelHref} data-press>Cancel</a>
	<button type="button" class="btn primary arrow" disabled={saving} aria-busy={saving} data-press data-focus="halo">
		{#if saving}<span class="spin"><Glyph name="spinner" size={16} /></span>Saving…{:else}Save<span class="circle" aria-hidden="true"><Icon name="arrow" size={18} /></span>{/if}
	</button>
</div>

<style>
	.foot { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--space-2); }
	@media (max-width: 767px) {
		.foot { flex-direction: column-reverse; }
		.foot .btn { inline-size: 100%; }
		.foot .btn.arrow { justify-content: space-between; }
	}
	
</style>
