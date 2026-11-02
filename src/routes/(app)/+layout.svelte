<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount, type Snippet } from 'svelte';
	import { DOMAINS, WORLD_NAMES, type World } from '#lib/domains.ts';
	import { schemes } from '#lib/styles/tokens.ts';
	import { WORLDS, worldAttrs } from '#lib/styles/worlds.ts';
	import AppNav from '#lib/shell/AppNav.svelte';
	import { pageTransition, trackCoverClicks } from '#lib/shell/morph.ts';
	import { activeSection } from '#lib/shell/nav.ts';
	import Toast from '#lib/shell/Toast.svelte';

	let { children }: { children: Snippet } = $props();

	// a page names its world in its load data; one that doesn't (a list before it loads its own) falls back to the
	// domain in its path, and anything else (the error page) is home
	const world = $derived<World>(
		WORLD_NAMES.find((w) => w === page.data.world) ?? DOMAINS.find((d) => d === page.url.pathname.split('/')[1]) ?? 'home'
	);
	const scheme = $derived(WORLDS[world].scheme);

	onNavigate(pageTransition);
	onMount(trackCoverClicks);
</script>

<svelte:head>
	<!-- the transition pseudo-elements hang off html, outside the world's scheme block -->
	{@html `<style>html,body{background:${schemes[scheme].ground}}html{--shadow-float:${schemes[scheme]['shadow-float']}}</style>`}
</svelte:head>

<div class="app" {...worldAttrs(world)} data-world={world} style:color-scheme={scheme}>
	<AppNav section={activeSection(page.url.pathname, world)} />
	<main>
		{@render children()}
	</main>
	<Toast />
</div>

<style>
	.app {
		position: relative;
		min-block-size: 100dvh;
		overflow-x: clip;
		/* what a screen without a full-bleed hero pads its top by to clear the floating nav */
		--nav-top: 96px;
	}

	/* minmax(0, 1fr): a shelf row's nowrap content must not widen the page's one track */
	main {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--s-10);
		padding-block-end: var(--s-11);
	}

	/* the root crossfade is quick; a morphing cover takes its time */
	:global {
		::view-transition-group(root) {
			animation-duration: var(--d-base);
		}

		::view-transition-group(*) {
			animation-duration: var(--d-slow);
			animation-timing-function: var(--ease-out);
		}

		/* a cover keeps the card's corners and the detail cover's shadow all the way, and a 4/5 card cover
		   crops into a 2/3 detail cover instead of stretching */
		::view-transition-group(*.cover) {
			border-radius: var(--r-card);
			overflow: clip;
			box-shadow: var(--shadow-float);
		}

		::view-transition-old(*.cover),
		::view-transition-new(*.cover) {
			block-size: 100%;
			object-fit: cover;
		}

		/* a cover with no card to land on (morph.ts) fades with the root crossfade, as part of the page */
		:root[data-morph='fade']::view-transition-group(*.cover) {
			animation-duration: var(--d-base);
			border-radius: 0;
			overflow: visible;
			box-shadow: none;
		}
	}

	@media (max-width: 1023px) {
		.app {
			--nav-top: 76px;
		}

		main {
			gap: var(--s-9);
			padding-block-end: calc(var(--tabbar-h) + 56px);
		}
	}
</style>
