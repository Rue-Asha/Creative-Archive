<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';
	import type { Domain, PhotoWorld, Section } from '../../fixtures.ts';
	import { base, type Current, link, sectionLink, sections } from '../../wire/shell/data.ts';
	import Icon from '../../wire/shell/Icon.svelte';
	import PhoneBar from '../../wire/shell/PhoneBar.svelte';
	import PlusSheet from '../../wire/shell/PlusSheet.svelte';
	import '../../wire/shell/wire.css';

	// Gate 4 wireframe frame: field backdrop, no photo, greyscale. `list` (the wardrobe) and `section="settings"` are additive to the contract.
	type Props = { world: PhotoWorld; section: Current; children: Snippet; plus?: 'shown' | 'inert'; list?: string };
	let { world, section, children, plus = 'shown', list }: Props = $props();

	const worst = $derived(page.url.searchParams.get('data') === 'worst');
	// the posture switch: the top bar from 1024 px up (option A), or from 768 px (option B, ?posture=768)
	const posture = $derived(page.url.searchParams.get('posture') === '768' ? '768' : '1024');
	const scope = $derived<Domain | 'all'>(world === 'home' ? 'all' : world);
	const phoneCurrent = $derived<Section>(section === 'settings' ? 'home' : section);

	let sheet = $state(false);
	let typing = $state(false);
	const isText = (el: EventTarget | null) =>
		el instanceof HTMLElement &&
		(el.isContentEditable || el instanceof HTMLTextAreaElement || (el instanceof HTMLInputElement && !['checkbox', 'radio', 'button', 'submit', 'file', 'range'].includes(el.type)));
</script>

<svelte:window onfocusin={(e) => (typing = isText(e.target))} onfocusout={() => (typing = false)} />

<div class="app" data-backdrop="field" data-world={world} data-switch={posture} data-data={worst ? 'worst' : 'normal'}>
	<div class="frame">
		<header class="app-bar">
			<a class="brand" href={`${base}${worst ? '?data=worst' : ''}`}><span class="brand-mark" aria-hidden="true">C</span><span class="brand-name">Creative Archive</span></a>
			<nav class="app-nav" aria-label="Main">
				<ul>
					{#each sections as s (s.id)}
						<li><a href={sectionLink(s, worst)} aria-current={s.id === section ? 'page' : undefined}>{s.label}</a></li>
					{/each}
				</ul>
			</nav>
			<div class="app-actions">
				<a class="fw-icon" href={link('wire/settings', worst)} aria-label="Settings" aria-current={section === 'settings' ? 'page' : undefined}><Icon name="settings" size={20} /></a>
			</div>
		</header>
		<main class="screen" id="main">
			{@render children()}
		</main>
	</div>
	<div class="phone">
		<PhoneBar current={phoneCurrent} {worst} {plus} hidden={typing} expanded={sheet} onplus={() => (sheet = true)} />
	</div>
	{#if sheet}<PlusSheet {scope} {list} onclose={() => (sheet = false)} />{/if}
</div>

<style>
	.app {
		--accent: var(--ink);
		--accent-ink: var(--ink-on-inverse);
		--accent-text: var(--ink);
		--accent-soft: var(--surface-tint);
		--accent-on-inverse: var(--ink-on-inverse);
		min-block-size: 100dvh;
		display: flex;
		flex-direction: column;
	}
	.app > .frame { inline-size: 100%; }
	.phone { display: none; z-index: var(--z-rail); margin-block-start: auto; padding-block-start: var(--space-3); padding-inline: var(--space-1); }

	@media (max-width: 1023px) {
		.app:not([data-switch="768"]) .app-nav,
		.app:not([data-switch="768"]) .app-actions { display: none; }
		.app:not([data-switch="768"]) .phone { display: block; }
	}
	@media (max-width: 767px) {
		.app[data-switch="768"] .app-nav,
		.app[data-switch="768"] .app-actions { display: none; }
		.app[data-switch="768"] .phone { display: block; }
	}
</style>
