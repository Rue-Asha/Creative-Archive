<script lang="ts">
	import ArrowButton from './ArrowButton.svelte';

	let {
		prevLabel = 'Previous',
		nextLabel = 'Next',
		prevDisabled = false,
		nextDisabled = false,
		onprev,
		onnext
	}: {
		prevLabel?: string;
		nextLabel?: string;
		prevDisabled?: boolean;
		nextDisabled?: boolean;
		onprev?: () => void;
		onnext?: () => void;
	} = $props();
</script>

<div class="round-nav">
	<ArrowButton variant="outline" direction="left" label={prevLabel} disabled={prevDisabled} onclick={onprev} />
	<ArrowButton variant="solid" label={nextLabel} disabled={nextDisabled} onclick={onnext} />
</div>

<style>
	.round-nav {
		display: inline-flex;
		gap: var(--s-2);
	}
</style>
