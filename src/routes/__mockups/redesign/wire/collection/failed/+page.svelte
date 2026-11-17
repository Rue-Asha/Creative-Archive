<script lang="ts">
	import CollectionBody from '../CollectionBody.svelte';
</script>

<svelte:head><title>Couldn't save the order (wireframe)</title></svelte:head>

<CollectionBody mode="view" toast="Couldn't save — try again" note="The save failed: the list is back in the saved order, the same as before the move." />
