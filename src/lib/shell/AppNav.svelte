<script lang="ts" module>
	// The pill glide (motion.css "2. The pill glides"): an inert charcoal copy of the track is laid over it and clipped to the
	// current item, so labels change colour exactly under the pill. Keyboard activation, scroll and resize jump.
	const FADE = 56;

	function pill(track: HTMLElement) {
		const items = [...track.querySelectorAll<HTMLElement>('a, button')];
		const host = track.parentElement;
		if (!items.length || !host) return {};
		const isOn = (i: HTMLElement) => i.hasAttribute('aria-current');

		host.setAttribute('data-pill-host', '');
		track.setAttribute('data-pill-track', '');
		items.forEach((i) => i.setAttribute('data-pill-item', ''));
		const ghost = track.cloneNode(true) as HTMLElement;
		ghost.removeAttribute('data-pill-track');
		ghost.setAttribute('data-pill-ghost', '');
		ghost.setAttribute('aria-hidden', 'true');
		ghost.inert = true;
		ghost.querySelectorAll('[id], [aria-current], [data-pill-item]').forEach((n) => {
			for (const a of ['id', 'aria-current']) n.removeAttribute(a);
			n.setAttribute('tabindex', '-1');
		});
		track.after(ghost);

		function edges() {
			const more = track.scrollWidth - track.clientWidth;
			const start = more > 1 && track.scrollLeft > 1;
			const end = more > 1 && track.scrollLeft < more - 1;
			for (const n of [track, ghost]) {
				n.toggleAttribute('data-fade-start', start);
				n.toggleAttribute('data-fade-end', end);
			}
			host!.toggleAttribute('data-more-start', start);
			host!.toggleAttribute('data-more-end', end);
		}

		function place(instant: boolean) {
			if (instant) ghost.setAttribute('data-pill-instant', '');
			ghost.scrollLeft = track.scrollLeft;
			const h = host!.getBoundingClientRect();
			const b = track.getBoundingClientRect();
			Object.assign(ghost.style, { left: `${b.left - h.left}px`, top: `${b.top - h.top}px`, width: `${b.width}px`, height: `${b.height}px` });
			const cur = items.find(isOn);
			if (cur) {
				const t = cur.offsetTop;
				const l = cur.offsetLeft - track.scrollLeft;
				ghost.style.setProperty('--pill-clip', `inset(${t}px ${track.offsetWidth - l - cur.offsetWidth}px ${track.offsetHeight - t - cur.offsetHeight}px ${l}px round 999px)`);
			} else ghost.style.removeProperty('--pill-clip');
			if (instant) {
				void getComputedStyle(ghost).clipPath;
				ghost.removeAttribute('data-pill-instant');
			}
		}

		const cur = items.find(isOn);
		if (cur && track.scrollWidth > track.clientWidth) {
			const over = cur.offsetLeft + cur.offsetWidth + FADE - track.clientWidth;
			if (over > 0) track.scrollLeft = Math.min(over, cur.offsetLeft - FADE);
		}
		const sync = () => {
			edges();
			place(true);
		};
		const observer = new ResizeObserver(sync);
		observer.observe(track);
		track.addEventListener('scroll', sync, { passive: true });
		sync();

		// the section changes with the route, not with the click: glide to the new current item once it is marked
		const marks = new MutationObserver(() => place(false));
		marks.observe(track, { attributes: true, attributeFilter: ['aria-current'], subtree: true });

		return {
			destroy() {
				observer.disconnect();
				marks.disconnect();
				track.removeEventListener('scroll', sync);
				ghost.remove();
				host.removeAttribute('data-pill-host');
				track.removeAttribute('data-pill-track');
				items.forEach((i) => i.removeAttribute('data-pill-item'));
			}
		};
	}
</script>

<script lang="ts">
	import { DOMAIN_LABEL, DOMAINS } from '#lib/domains.ts';
	import { hideOnType, scrolled } from '#lib/components/scroll-cue/cue.ts';
	import Button from '#lib/components/button/Button.svelte';
	import Icon, { type IconName } from '#lib/ui/Icon.svelte';
	import { POSTURE_SWITCH, type Section } from './nav.ts';

	// the bar sits inside the frame, the dock after it, so one component renders each in its place
	type Props = { part: 'bar' | 'dock'; section: Section; plus?: 'shown' | 'inert'; expanded?: boolean; onplus?: () => void };
	let { part, section, plus = 'shown', expanded = false, onplus }: Props = $props();

	const tabs = [
		{ id: 'home', href: '/', label: 'Home' },
		...DOMAINS.map((d) => ({ id: d, href: `/${d}`, label: DOMAIN_LABEL[d] }))
	];
	const sections = [...tabs, { id: 'collections', href: '/collections', label: 'Collections' }];
	// Collections and Settings are reached from Home, so Home is the marked tab on the phone
	const marked = $derived(section === 'collections' || section === 'settings' ? 'home' : section);
	const current = $derived(section === 'settings' ? 'page' : undefined);

	let bar = $state<HTMLElement>();
	let dock = $state<HTMLElement>();

	// The capsule (layout.css, 1100px up) sticks at --space-3; whatever sticks below it starts at --sticky-block-start.
	$effect(() => {
		if (part !== 'bar' || !bar) return;
		const el = bar;
		const wide = matchMedia(`(min-width: ${POSTURE_SWITCH}px)`);
		const root = document.documentElement;
		const set = () => {
			if (!wide.matches) return root.style.removeProperty('--sticky-block-start');
			const top = parseFloat(getComputedStyle(el).insetBlockStart) || 0;
			const sticky = getComputedStyle(el).position === 'sticky';
			root.style.setProperty('--sticky-block-start', `${sticky ? top + el.getBoundingClientRect().height + 8 : 12}px`);
		};
		const resize = new ResizeObserver(set);
		resize.observe(el);
		const marks = new MutationObserver(set);
		marks.observe(el, { attributes: true, attributeFilter: ['data-scrolled'] });
		wide.addEventListener('change', set);
		set();
		return () => {
			resize.disconnect();
			marks.disconnect();
			wide.removeEventListener('change', set);
			root.style.removeProperty('--sticky-block-start');
		};
	});

	// base.css turns these two into scroll-padding, so a focused control never scrolls under the capsule or the dock
	$effect(() => {
		if (part !== 'dock' || !dock) return;
		const el = dock;
		const root = document.documentElement;
		const set = () => {
			const shown = getComputedStyle(el).display !== 'none';
			if (shown) root.style.setProperty('--sticky-block-end', `${el.getBoundingClientRect().height + 24}px`);
			else root.style.removeProperty('--sticky-block-end');
		};
		const resize = new ResizeObserver(set);
		resize.observe(el);
		set();
		return () => {
			resize.disconnect();
			root.style.removeProperty('--sticky-block-end');
		};
	});
</script>

{#if part === 'bar'}
	<header class="app-bar" bind:this={bar} use:scrolled>
		<a class="brand" href="/"><span class="brand-mark" aria-hidden="true">C</span><span class="brand-name">Creative Archive</span></a>
		<nav class="app-nav" aria-label="Main">
			<ul data-pill use:pill>
				{#each sections as s (s.id)}
					<li><a href={s.href} aria-current={s.id === section ? 'page' : undefined}>{s.label}</a></li>
				{/each}
			</ul>
		</nav>
		<div class="app-actions">
			<Button variant="glass" icon href="/settings" label="Settings" aria-current={current} data-press="round"><Icon name="settings" size={20} /></Button>
		</div>
	</header>
{:else}
	<nav class="dock" aria-label="Main" bind:this={dock} use:hideOnType>
		<ul class="dock-tabs" data-pill use:pill>
			{#each tabs as t (t.id)}
				<li>
					<a href={t.href} aria-current={marked === t.id ? 'page' : undefined} data-press>
						<Icon name={t.id as IconName} size={20} /><span>{t.label}</span>
					</a>
				</li>
			{/each}
		</ul>
		<button
			type="button"
			class="dock-add"
			aria-label="Add"
			aria-haspopup="dialog"
			aria-expanded={plus === 'inert' ? undefined : expanded}
			aria-disabled={plus === 'inert' ? 'true' : undefined}
			data-press="round"
			onclick={() => plus !== 'inert' && onplus?.()}
		>
			<Icon name="plus" size={24} />
		</button>
	</nav>
{/if}

<style>
	/* with the name hidden on the phone the mark alone is the link: keep it a full touch target wide */
	.brand {
		min-inline-size: var(--target-touch);
	}
	/* the current Settings button reads like the current pill */
	:global(.btn.icon[aria-current]) {
		background: var(--surface-inverse);
		color: var(--ink-on-inverse);
		box-shadow: none;
	}

	:global(.btn.icon[aria-current]:focus-visible) {
		box-shadow: var(--focus-halo);
	}

	/* the "+" floats over whatever scrolls under it; the glass rim keeps its edge on a charcoal card too */
	.dock-add:not(:focus-visible):not([aria-disabled='true']) {
		outline: var(--stroke-strong) solid var(--rim);
	}
</style>
