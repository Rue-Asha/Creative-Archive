<script lang="ts">
	import CollectionBody from '../CollectionBody.svelte';
</script>

<svelte:head><title>Move before… (wireframe)</title></svelte:head>

<CollectionBody mode="select" pick="range" chooser note="Move before… asks for one target entry that is not in the selection; picking it applies the move at once, in one save." />
