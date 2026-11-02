<script lang="ts">
	import { DOMAIN_LABEL, DOMAINS } from '#lib/domains.ts';
	import type { Section } from './nav.ts';
	import IconButton from '#lib/ui/IconButton.svelte';
	import PillNav, { type NavItem } from '#lib/ui/PillNav.svelte';

	let { section }: { section: Section } = $props();

	const items = $derived<NavItem[]>([
		{ href: '/', label: 'Home', icon: 'home', active: section === 'home' },
		...DOMAINS.map((d) => ({ href: `/${d}`, label: DOMAIN_LABEL[d], icon: d, active: section === d })),
		{ href: '/collections', label: 'Collections', icon: 'collections', active: section === 'collections' }
	]);
	const current = $derived(section === 'settings' ? 'page' : undefined);
</script>

<header class="topbar">
	<div class="column bar">
		<a class="brand" href="/">
			<span class="mark" aria-hidden="true">ca</span>
			<span class="word">Creative <em>Archive</em></span>
		</a>
		<PillNav {items} variant="top" />
		<div class="actions">
			<IconButton icon="settings" label="Settings" href="/settings" aria-current={current} />
		</div>
	</div>
</header>

<div class="tabbar">
	<PillNav {items} variant="bar" />
</div>

<span class="settings-phone">
	<IconButton icon="settings" label="Settings" href="/settings" aria-current={current} />
</span>

<style>
	.topbar {
		position: fixed;
		inset-block-start: 22px;
		inset-inline: 0;
		z-index: 40;
		pointer-events: none;
	}

	.bar {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
	}

	.bar > :global(*) {
		pointer-events: auto;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		justify-self: start;
		min-block-size: 48px;
		padding: 4px 18px 4px 4px;
		border-radius: var(--r-pill);
		background: var(--glass-strong);
		backdrop-filter: var(--glass-filter);
		border: 1px solid var(--glass-border);
		box-shadow: var(--shadow-card);
		color: var(--ink);
	}

	.mark {
		display: grid;
		place-items: center;
		inline-size: 40px;
		block-size: 40px;
		border-radius: var(--r-pill);
		background: var(--accent);
		color: var(--accent-ink);
		font-family: var(--font-display);
		font-style: var(--accent-style);
		font-size: var(--t-display-3);
		line-height: 1;
		padding-block-end: 3px;
	}

	.word {
		font-family: var(--font-display);
		font-size: var(--t-display-3);
		font-weight: 500;
		letter-spacing: -0.01em;
	}

	.word em {
		font-style: var(--accent-style);
		color: var(--accent);
	}

	.actions {
		justify-self: end;
	}

	.tabbar,
	.settings-phone {
		display: none;
	}

	/* tablet and phone: the pill nav moves to the bottom, Settings floats top right and scrolls away with the page */
	@media (max-width: 1023px) {
		.topbar {
			display: none;
		}

		.tabbar {
			display: block;
			position: fixed;
			inset-inline: 10px;
			inset-block-end: max(12px, env(safe-area-inset-bottom));
			max-inline-size: 520px;
			margin-inline: auto;
			z-index: 40;
		}

		.settings-phone {
			display: inline-flex;
			position: absolute;
			inset-block-start: var(--s-4);
			inset-inline-end: var(--gutter);
			z-index: 30;
		}
	}
</style>
