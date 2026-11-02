<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { World } from '#lib/domains.ts';
	import { reducedMotion } from '#lib/motion.ts';
	import { worldAttrs } from '#lib/styles/worlds.ts';
	import { parallaxOffset } from './parallax.ts';

	let { image, world, children }: { image: number | null; world: World; children: Snippet } = $props();

	let shot = $state<HTMLImageElement>();

	// the transform is written straight to the element: scroll must not re-render anything
	$effect(() => {
		if (!shot) return;
		const el = shot;
		let frame = 0;
		const place = () => {
			frame = 0;
			el.style.transform = `translate3d(0, ${parallaxOffset(scrollY, reducedMotion())}px, 0)`;
		};
		const onScroll = () => {
			frame ||= requestAnimationFrame(place);
		};
		place();
		addEventListener('scroll', onScroll, { passive: true });
		return () => {
			removeEventListener('scroll', onScroll);
			cancelAnimationFrame(frame);
		};
	});
</script>

<header class="hero" data-hero {...worldAttrs(world)}>
	<div class="photo" aria-hidden="true">
		<div class="drift">
			{#if image !== null}
				<img bind:this={shot} class="shot" data-hero-image src="/images/{image}" alt="" />
			{:else}
				<span class="gradient" data-hero-gradient></span>
			{/if}
		</div>
	</div>
	<span class="scrim" aria-hidden="true"></span>
	<div class="column body">
		{@render children()}
	</div>
</header>

<style>
	.hero {
		position: relative;
		isolation: isolate;
		display: flex;
		align-items: flex-end;
		min-block-size: max(56vh, 480px);
		padding-block: 120px var(--s-7);
		overflow: hidden;
		color: var(--on-photo);
		background: none;
	}

	.photo,
	.drift {
		position: absolute;
		inset: 0;
		z-index: -2;
	}

	.photo {
		mask-image: var(--fade-down);
		overflow: hidden;
	}

	.drift {
		z-index: auto;
		animation: drift var(--d-ambient) var(--ease-in-out) infinite alternate;
	}

	/* the image reaches above the band so the parallax shift never uncovers an edge */
	.shot {
		position: absolute;
		inset-inline: 0;
		inset-block-start: -30%;
		inline-size: 100%;
		block-size: 130%;
		object-fit: cover;
		will-change: transform;
	}

	.gradient {
		position: absolute;
		inset: 0;
		background:
			var(--grain),
			var(--ambient),
			linear-gradient(in oklab 160deg, var(--accent-soft), var(--surface-2) 55%, var(--ground));
	}

	.scrim {
		position: absolute;
		inset: 0;
		z-index: -1;
		mask-image: var(--fade-down);
		background:
			linear-gradient(in oklab 90deg, var(--scrim-end) 0%, color-mix(in oklab, var(--scrim-end) 90%, transparent) 14%, color-mix(in oklab, var(--scrim-end) 65%, transparent) 28%, color-mix(in oklab, var(--scrim-end) 35%, transparent) 42%, color-mix(in oklab, var(--scrim-end) 10%, transparent) 56%, transparent 70%),
			linear-gradient(in oklab 0deg, var(--scrim-end) 0%, color-mix(in oklab, var(--scrim-end) 90%, transparent) 12%, color-mix(in oklab, var(--scrim-end) 65%, transparent) 24%, color-mix(in oklab, var(--scrim-end) 35%, transparent) 36%, color-mix(in oklab, var(--scrim-end) 10%, transparent) 48%, transparent 60%);
	}

	.body {
		display: grid;
		gap: var(--s-7);
	}

	/* the text always sits on the dark end of the scrim, so the accent word is lifted to the photo colour */
	.body :global(em) {
		color: var(--on-photo);
		opacity: 0.92;
	}

	@keyframes drift {
		from {
			transform: scale(1.04) translate(0, 0);
		}

		to {
			transform: scale(1.12) translate(-1.5%, -1%);
		}
	}

	@media (max-width: 1023px) {
		.hero {
			min-block-size: 460px;
			padding-block: 120px var(--s-5);
		}

		.scrim {
			background: linear-gradient(in oklab 0deg, var(--scrim-end) 0%, var(--scrim-end) 40%, color-mix(in oklab, var(--scrim-end) 90%, transparent) 48.32%, color-mix(in oklab, var(--scrim-end) 65%, transparent) 56.64%, color-mix(in oklab, var(--scrim-end) 35%, transparent) 64.96%, color-mix(in oklab, var(--scrim-end) 10%, transparent) 73.28%, transparent 81.6%);
		}
	}
</style>
