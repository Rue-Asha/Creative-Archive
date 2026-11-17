<script lang="ts">
	import CollectionBody from '../CollectionBody.svelte';
</script>

<svelte:head><title>Select mode, everything selected (wireframe)</title></svelte:head>

<CollectionBody mode="select" pick="all" note="Every entry can be picked. Move to top and Move to bottom keep the order; Move before… has no target left and stays disabled." />
