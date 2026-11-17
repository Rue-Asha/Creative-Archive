<script lang="ts">
	import { page } from '$app/state';
	import { scrolled } from '#lib/components/scroll-cue/cue.ts';
	import { setContext, type Snippet } from 'svelte';
	import { mockData, photo, type Domain, type PhotoWorld, type Section } from './fixtures.ts';
	import Dock from './hifi/shell/Dock.svelte';
	import Icon from './hifi/shell/Icon.svelte';
		import PlusSheet from './hifi/shell/PlusSheet.svelte';
	import WireFrame from './hifi/shell/WireFrame.svelte';
	import { base, type Current, href, sectionHref, sections } from './hifi/shell/data.ts';
	import { pill } from './hifi/shell/pill.ts';
	import './hifi/shell/primitives.css';

	// `data-world` selects the world's mood photo, a world without a hero photo shows the colour field. `list` (the wardrobe) and
	// `section="settings"` are additive to the contract; the wireframes (/wire/) keep their gate 4 frame.
	type Props = { world: PhotoWorld; section: Current; children: Snippet; plus?: 'shown' | 'inert'; list?: string; backdrop?: 'photo' | 'field' };
	let { world, section, children, plus = 'shown', list, backdrop }: Props = $props();

	const wire = $derived(page.url.pathname.includes('/wire/'));
	const worst = $derived(page.url.searchParams.get('data') === 'worst');
	const scope = $derived<Domain | 'all'>(world === 'home' ? 'all' : world);
	const phoneCurrent = $derived<Section>(section === 'settings' ? 'home' : section);
	const mood = $derived((page.data as { photos?: Record<PhotoWorld, string> }).photos?.[world]);
	const field = $derived(!mood || (backdrop ? backdrop === 'field' : mockData(new URL(page.url.href)).heroes[world] === null));
	const src = $derived(mood && !field ? photo(mood) : null);

	let sheet = $state(false);
	setContext('openPlus', () => (sheet = true));
</script>

{#if wire}
	<WireFrame {world} {section} {plus} {list}>{@render children()}</WireFrame>
{:else}
	<div class="app" data-world={world} data-backdrop={field ? 'field' : undefined} data-photo={src ?? undefined} data-data={worst ? 'worst' : 'normal'} style:--photo={src ? `url("${src}")` : undefined}>
		<div class="frame">
			{#if src}<figure class="stage" aria-hidden="true"><img class="stage-photo" {src} alt="" /></figure>{/if}
			<header class="app-bar" use:scrolled>
				<a class="brand" href={`${base}${worst ? '?data=worst' : ''}`}><span class="brand-mark" aria-hidden="true">C</span><span class="brand-name">Creative Archive</span></a>
				<nav class="app-nav" aria-label="Main">
					<ul data-pill use:pill>
						{#each sections as s (s.id)}
							<li><a href={sectionHref(s, worst)} aria-current={s.id === section ? 'page' : undefined}>{s.label}</a></li>
						{/each}
					</ul>
				</nav>
				<div class="app-actions">
					<a class="btn icon glass" href={href('settings', worst)} aria-label="Settings" aria-current={section === 'settings' ? 'page' : undefined} data-press="round"><Icon name="settings" size={20} /></a>
				</div>
			</header>
			<main class="screen" id="main">
				{@render children()}
			</main>
		</div>
		<Dock current={phoneCurrent} {worst} {plus} expanded={sheet} onplus={() => (sheet = true)} />
		<PlusSheet {scope} {list} {worst} open={sheet} onclose={() => (sheet = false)} />
	</div>
{/if}

<style>
	:global(.btn.icon[aria-current]) { background: var(--surface-inverse); color: var(--ink-on-inverse); box-shadow: none; }
	:global(.btn.icon[aria-current]:focus-visible) { box-shadow: var(--focus-halo); }
</style>
