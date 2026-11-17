<script lang="ts">
	import { TOAST } from '../../overlays/copy.ts';
	import CollectionBody from '../CollectionBody.svelte';
</script>

<svelte:head><title>Collection changed elsewhere · Creative Archive</title></svelte:head>

<CollectionBody mode="view" extra toast={{ message: TOAST.conflict }} />
