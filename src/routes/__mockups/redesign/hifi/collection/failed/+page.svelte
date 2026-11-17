<script lang="ts">
	import { TOAST } from '../../overlays/copy.ts';
	import CollectionBody from '../CollectionBody.svelte';
</script>

<svelte:head><title>Couldn’t save the order · Creative Archive</title></svelte:head>

<CollectionBody mode="view" toast={{ message: TOAST.failed, kind: 'error' }} />
