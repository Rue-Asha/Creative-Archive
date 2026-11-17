<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
		import State from './State.svelte';
	import Icon from './Icon.svelte';
		import { base, sectionHref, sections } from './data.ts';
	import { pill } from './pill.ts';

	const worst = $derived(page.url.searchParams.get('data') === 'worst');
	const q = $derived(worst ? '?data=worst' : '');
	const top = [
		{ label: 'Home is current', section: 'home' },
		{ label: 'Fashion is current (its lists, entries and add pages too)', section: 'fashion' },
		{ label: 'Collections is current', section: 'collections' },
		{ label: 'Settings is current, no section marked', section: 'settings' }
	];
</script>

<svelte:head><title>Navigation · Creative Archive</title></svelte:head>

<Frame world="home" section="home">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Shell</li><li>Navigation</li></ul>
			<h1>Find your <em class="accent-word">way</em></h1>
			<p class="lede">The dock below 1024 px, the top bar with its nav from 1024 px (one row from 1024 px, the wordmark hidden up to 1099 px, the scrolled capsule from 1100 px). Resize the window to watch the live frame switch.</p>
		</div>
	</div>
	<div class="screen-body" data-settle>
		<State label="Width: labels, then icons only" note="Below 1024 px the dock replaces the nav. Tabs size to their label (44 px at least), so all five labels show in full from 360 px. Below 360 px the dock is icon only, the label stays as the accessible name. Targets stay 44 px. These are real frames at 320 and 375 px: data-specimen shows the dock at any window width, but the icon-only rule follows the window width, so a frame is the only way to show it.">
			<div class="row">
				<iframe class="phone-view" style="--w: 320px" title="Dock at 320 px, icon only" src="{base}/hifi/home{q}"></iframe>
				<iframe class="phone-view" style="--w: 375px" title="Dock at 375 px" src="{base}/hifi/home{q}"></iframe>
			</div>
		</State>
		<State label="Current tab" note="The current tab is the charcoal pill and glides when it changes; it also carries aria-current, so colour is never the only cue. Collections and Settings mark Home.">
			<div class="row">
				<iframe class="phone-view" style="--w: 390px" title="Dock, Fashion current" src="{base}/hifi/domain?d=fashion{worst ? '&data=worst' : ''}"></iframe>
				<iframe class="phone-view" style="--w: 375px" title="Dock, Collections marks Home" src="{base}/hifi/collections{q}"></iframe>
			</div>
		</State>
		<State label="The + on a form is inert" note="On Add and Edit pages the + stays in place, dimmed and aria-disabled, and opens nothing. While a field has focus on a touch screen the dock fades and slides out (it stays in the page), so the soft keyboard gets the room.">
			<div class="row">
				<iframe class="phone-view" style="--w: 375px" title="Dock with an inert plus" src="{base}/hifi/add?d=fashion{worst ? '&data=worst' : ''}"></iframe>
			</div>
		</State>
		<State label="1024 px and up: brand, six sections, Settings" note="A capsule with the charcoal pill on the current section; Settings is a round icon button, charcoal when current.">
			<div class="tops">
				{#each top as t (t.label)}
					<div class="scroller">
						<div class="topbar">
							<span class="brand"><span class="brand-mark" aria-hidden="true">C</span><span class="brand-name">Creative Archive</span></span>
							<nav class="app-nav" aria-label={t.label}>
								<ul>
									{#each sections as s (s.id)}<li><a href={sectionHref(s, worst)} aria-current={s.id === t.section ? 'page' : undefined}>{s.label}</a></li>{/each}
								</ul>
							</nav>
							<span class="btn icon glass" aria-current={t.section === 'settings' ? 'page' : undefined}><Icon name="settings" size={20} /></span>
						</div>
						<p class="cap">{t.label}</p>
					</div>
				{/each}
			</div>
		</State>
		<State label="Pill glide, live" note="Click a section: the charcoal pill glides under the labels. Keyboard activation jumps; reduced motion jumps too.">
			<div class="glide">
				<nav class="app-nav" aria-label="Pill glide demo">
					<ul data-pill use:pill>
						{#each sections as s, i (s.id)}<li><a href="#demo" aria-current={i === 0 ? 'page' : undefined}>{s.label}</a></li>{/each}
					</ul>
				</nav>
			</div>
		</State>
		<State label="Scrolled top bar, desktop only" note="At the top of the page the bar is full. Once the page scrolls it sticks and shrinks to a solid capsule with the brand mark only, so navigation stays reachable. Below 1024 px the dock stays.">
			<div class="tops">
				<div class="scroller">
					<div class="topbar">
						<span class="brand"><span class="brand-mark" aria-hidden="true">C</span><span class="brand-name">Creative Archive</span></span>
						<nav class="app-nav" aria-label="Top of the page"><ul>{#each sections as s (s.id)}<li><a href={sectionHref(s, worst)} aria-current={s.id === 'music' ? 'page' : undefined}>{s.label}</a></li>{/each}</ul></nav>
						<span class="btn icon glass"><Icon name="settings" size={20} /></span>
					</div>
					<p class="cap">At the top of the page</p>
				</div>
				<div class="scroller">
					<div class="topbar compact">
						<span class="brand"><span class="brand-mark" aria-hidden="true">C</span></span>
						<nav class="app-nav" aria-label="Scrolled"><ul>{#each sections as s (s.id)}<li><a href={sectionHref(s, worst)} aria-current={s.id === 'music' ? 'page' : undefined}>{s.label}</a></li>{/each}</ul></nav>
						<span class="btn icon glass"><Icon name="settings" size={20} /></span>
					</div>
					<p class="cap">Scrolled: sticky capsule</p>
				</div>
			</div>
		</State>
	</div>
</Frame>

<style>
	.row { display: flex; flex-wrap: wrap; gap: var(--space-5); padding-block-end: var(--space-2); }
	.phone-view { flex: none; max-inline-size: 100%; inline-size: var(--w); block-size: 44rem; border: 0; border-radius: var(--radius-panel); background: var(--surface-card); box-shadow: var(--ring-hairline); }
	.tops { display: grid; gap: var(--space-4); }
	.scroller { overflow-x: auto; display: grid; gap: var(--space-1); padding-block-end: var(--space-2); }
	.topbar { display: flex; align-items: center; justify-content: space-between; gap: var(--space-5); min-inline-size: 62rem; padding: var(--space-3) var(--space-5); border-radius: var(--radius-panel); background: var(--surface-frame-strong); box-shadow: var(--ring-hairline); }
	.topbar.compact { inline-size: max-content; min-inline-size: 0; margin-inline: auto; padding: var(--space-1-5) var(--space-2) var(--space-1-5) var(--space-3); border-radius: var(--radius-pill); background: var(--surface-raised); box-shadow: var(--elevation-card); }
	.topbar.compact .app-nav { box-shadow: none; background: none; }
	.cap { font-size: var(--type-caption-size); color: var(--ink-secondary); }
	.glide { overflow-x: auto; }
	.glide .app-nav { justify-self: start; }
</style>
