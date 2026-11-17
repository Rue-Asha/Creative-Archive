<script lang="ts">
	import CollectionBody from '../CollectionBody.svelte';
</script>

<svelte:head><title>Select mode, nothing selected (wireframe)</title></svelte:head>

<CollectionBody mode="select" pick="none" note="With nothing selected every action is disabled but Done; the bar says what to do next." />
