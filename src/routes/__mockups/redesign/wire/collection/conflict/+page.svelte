<script lang="ts">
	import CollectionBody from '../CollectionBody.svelte';
</script>

<svelte:head><title>Collection changed elsewhere (wireframe)</title></svelte:head>

<CollectionBody mode="view" extra toast="Collection order changed elsewhere — reloaded" note="Another tab added an entry; a reorder answered 409, so the page reloaded the saved order and shows the current members (the new one is last)." />
