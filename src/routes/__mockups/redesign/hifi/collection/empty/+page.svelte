<script lang="ts">
	import { TOAST } from '../../overlays/copy.ts';
	import CollectionBody from '../CollectionBody.svelte';
</script>

<svelte:head><title>Collection, empty · Creative Archive</title></svelte:head>

<CollectionBody mode="empty" toast={{ message: TOAST.removed(3) }} />
