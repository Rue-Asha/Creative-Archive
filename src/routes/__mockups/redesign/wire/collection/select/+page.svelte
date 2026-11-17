<script lang="ts">
	import CollectionBody from '../CollectionBody.svelte';
</script>

<svelte:head><title>Select mode (wireframe)</title></svelte:head>

<CollectionBody mode="select" pick="range" note="Select replaces the action row; a tap or click toggles an entry, shift-click picks the range from the last one. Move up, Move down, Remove and the drag handle are hidden while selecting." />
