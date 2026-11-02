<script lang="ts" module>
	import type { IconName } from './Icon.svelte';

	export interface NavItem {
		href: string;
		label: string;
		icon: IconName;
		active: boolean;
	}
</script>

<script lang="ts">
	import Icon from './Icon.svelte';

	let {
		items,
		variant = 'top',
		label = 'Main'
	}: { items: NavItem[]; variant?: 'top' | 'bar'; label?: string } = $props();

	let list = $state<HTMLUListElement>();
	let pill = $state<{ x: number; y: number; w: number; h: number }>();
	let glide = $state(false);
	const current = $derived(items.find((i) => i.active)?.href);

	function place(href: string | undefined) {
		const link = href ? list?.querySelector<HTMLElement>(`a[href="${href}"]`) : null;
		pill = link?.offsetWidth
			? { x: link.offsetLeft, y: link.offsetTop, w: link.offsetWidth, h: link.offsetHeight }
			: undefined;
	}

	$effect(() => place(current));

	$effect(() => {
		let frame = 0;
		// placements from a resize (first layout, fonts) follow the links without a glide, so the pill never flies in
		const observer = new ResizeObserver(() => {
			glide = false;
			place(current);
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => (glide = true));
		});
		observer.observe(list!);
		return () => {
			observer.disconnect();
			cancelAnimationFrame(frame);
		};
	});
</script>

<nav class="pill-nav liquid liquid-strong {variant}" class:placed={pill} aria-label={label}>
	{#if pill}
		<span
			class="pill"
			class:glide
			style:inline-size="{pill.w}px"
			style:block-size="{pill.h}px"
			style:transform="translate({pill.x}px, {pill.y}px)"
			aria-hidden="true"
		></span>
	{/if}
	<ul bind:this={list}>
		{#each items as item (item.href)}
			<li>
				<a href={item.href} aria-current={item.active ? 'page' : undefined}>
					{#if variant === 'bar'}<Icon name={item.icon} size={21} />{/if}
					<span>{item.label}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.pill-nav {
		border-radius: var(--r-pill);
	}

	.pill {
		position: absolute;
		inset-block-start: 0;
		inset-inline-start: 0;
		border-radius: var(--r-pill);
		background: var(--solid);
	}

	/* inline-size glides with the pill (motion exception): one absolutely placed element, nothing else reflows */
	.pill.glide {
		transition:
			transform var(--d-slow) var(--ease-glide),
			inline-size var(--d-slow) var(--ease-glide);
	}

	ul {
		position: relative;
		display: flex;
		gap: 2px;
		padding: 5px;
	}

	a {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		min-block-size: 44px;
		min-inline-size: 44px;
		padding: 0 var(--s-4);
		border-radius: var(--r-pill);
		font-size: var(--t-small);
		font-weight: 500;
		color: var(--ink);
		-webkit-tap-highlight-color: transparent;
		transition:
			opacity var(--d-fast) var(--ease-out),
			color var(--d-fast) var(--ease-out);
	}

	a:hover:not([aria-current]) {
		opacity: 0.65;
	}

	a[aria-current='page'] {
		background: var(--solid);
		color: var(--on-solid);
	}

	.placed a[aria-current='page'] {
		background: transparent;
	}

	.bar ul {
		justify-content: space-between;
		gap: 0;
		padding: 4px;
	}

	.bar li {
		flex: 1 1 auto;
		min-inline-size: 0;
	}

	.bar li:has(a[aria-current='page']) {
		min-inline-size: 64px;
	}

	.bar a {
		flex-direction: column;
		gap: 1px;
		min-block-size: 54px;
		padding: 0 4px;
		font-size: var(--t-eyebrow);
		letter-spacing: 0.01em;
	}

	.bar a span {
		line-height: 15px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-inline-size: 100%;
	}
</style>
