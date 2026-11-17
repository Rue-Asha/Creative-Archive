<script lang="ts">
	import '#lib/styles/fingerprint/tokens.css';
	import '#lib/styles/fingerprint/fonts.css';
	import '#lib/styles/fingerprint/base.css';
	import '#lib/styles/fingerprint/motion.css';
	import '#lib/styles/fingerprint/layout.css';
	import '#lib/styles/app.css';
	import { beforeNavigate, afterNavigate, pushState } from '$app/navigation';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import { DOMAINS, WORLD_NAMES, type Domain, type World } from '#lib/domains.ts';
	import AppNav from '#lib/shell/AppNav.svelte';
	import { activeSection, rememberShelves, restoreShelves } from '#lib/shell/nav.ts';
	import PhotoFrame from '#lib/shell/PhotoFrame.svelte';
	import PlusSheet from '#lib/shell/PlusSheet.svelte';
	import Toast from '#lib/shell/Toast.svelte';

	let { children }: { children: Snippet } = $props();

	// a page names its world in its load data; one that doesn't (a list before it loads its own) falls back to the
	// domain in its path, and anything else (the error page) is home
	const world = $derived<World>(
		WORLD_NAMES.find((w) => w === page.data.world) ?? DOMAINS.find((d) => d === page.url.pathname.split('/')[1]) ?? 'home'
	);
	const section = $derived(activeSection(page.url.pathname, world));
	const image = $derived(page.data.heroes?.[world] ?? null);
	// the sheet offers the world's types; Collections and Settings sit in the home world and offer all of them
	const scope = $derived<Domain | 'all'>(world === 'home' ? 'all' : world);
	const list = $derived(page.url.pathname.split('/')[2]);
	const inert = $derived(/^\/add\//.test(page.url.pathname) || /^\/entries\/\d+\/edit\/?$/.test(page.url.pathname));
	let sheet = $state(false);

	function openSheet() {
		pushState('', { plus: true } as App.PageState);
		sheet = true;
	}

	// shelf rows come back where they were left when history goes back
	beforeNavigate(({ from }) => from && rememberShelves(from.url));
	afterNavigate(({ type, to }) => {
		if (type === 'popstate' && to) restoreShelves(to.url);
	});
</script>

<svelte:head><meta name="theme-color" content={page.data.themes[world]} /></svelte:head>

<PhotoFrame {world} {image}>
	{#snippet bar()}<AppNav part="bar" {section} />{/snippet}
	{@render children()}
	{#snippet dock()}<AppNav part="dock" {section} plus={inert ? 'inert' : 'shown'} expanded={sheet} onplus={openSheet} />{/snippet}
	{#snippet after()}
		<PlusSheet {scope} list={world === 'fashion' ? list : undefined} bind:open={sheet} />
		<Toast />
	{/snippet}
</PhotoFrame>
