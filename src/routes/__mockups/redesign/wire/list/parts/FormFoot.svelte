<script lang="ts">
	import Icon from './Icon.svelte';
	import { base } from './data.ts';

	type Props = { saving?: boolean; cancelHref?: string };
	let { saving = false, cancelHref = `${base}/list` }: Props = $props();
</script>

<div class="w-formfoot">
	<a class="w-btn" href={cancelHref}>Cancel</a>
	<button type="button" class="w-btn primary" disabled={saving} aria-busy={saving}>
		{#if saving}<Icon name="spinner" size={16} />Saving…{:else}Save<span class="circle" aria-hidden="true"><Icon name="arrow" size={14} /></span>{/if}
	</button>
</div>
