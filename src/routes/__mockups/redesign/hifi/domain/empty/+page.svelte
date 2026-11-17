<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import { asDomain, domainView } from '../data.ts';
	import DomainBody from '../DomainBody.svelte';
	import DomainHead from '../DomainHead.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const d = $derived(asDomain(page.url.searchParams.get('d') ?? 'books'));
	const view = $derived(domainView(data, d, { empty: true }));
</script>

<svelte:head><title>{view.label} · empty · Creative Archive</title></svelte:head>

<Frame world={d} section={d}>
	<DomainHead {view} />
	<DomainBody {view} settle />
</Frame>
