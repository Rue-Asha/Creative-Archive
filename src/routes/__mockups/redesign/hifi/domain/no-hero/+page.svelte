<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import { asDomain, domainView } from '../data.ts';
	import DomainBody from '../DomainBody.svelte';
	import DomainHead from '../DomainHead.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const d = $derived(asDomain(page.url.searchParams.get('d') ?? 'fashion'));
	const view = $derived(domainView(data, d, { hero: false }));
</script>

<svelte:head><title>{view.label} · no hero photo · Creative Archive</title></svelte:head>

<Frame world={d} section={d} backdrop="field">
	<DomainHead {view} />
	<DomainBody {view} settle />
</Frame>
