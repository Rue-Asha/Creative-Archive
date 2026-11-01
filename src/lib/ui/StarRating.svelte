<script lang="ts">
	import { reducedMotion } from '#lib/motion.ts';

	let {
		value,
		mode,
		onchange,
		label,
		size = 'md',
		tone = 'accent'
	}: {
		value: number | null;
		mode: 'display' | 'input';
		onchange?: (value: number | null) => void;
		label?: string;
		size?: 'sm' | 'md';
		tone?: 'accent' | 'photo';
	} = $props();

	const STAR = 'M12 3.2l2.6 5.6 6.1.7-4.5 4.2 1.2 6.1L12 16.8l-5.4 3 1.2-6.1-4.5-4.2 6.1-.7z';
	const fills = $derived([1, 2, 3, 4, 5].map((n) => ((value ?? 0) >= n ? 'full' : (value ?? 0) >= n - 0.5 ? 'half' : 'empty')));
	const text = $derived(value === null ? 'Not rated' : `${value} of 5`);
	const name = $derived(label ? `${label}: ${text}` : text);

	// a star whose fill changed pops once; the first run only records what is shown
	let icons: SVGSVGElement[] = [];
	let shown: string[] | null = null;
	$effect(() => {
		const now = fills;
		if (shown && !reducedMotion())
			now.forEach((fill, i) => {
				if (fill !== shown![i])
					icons[i]?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.4)', offset: 0.4 }, { transform: 'scale(1)' }], {
						duration: 380,
						easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
					});
			});
		shown = now;
	});

	function set(next: number | null) {
		if (next !== null) next = Math.min(5, Math.max(0.5, next));
		if (next !== value) onchange?.(next);
	}

	function keydown(event: KeyboardEvent) {
		const step: Record<string, () => number | null> = {
			ArrowRight: () => (value ?? 0) + 0.5,
			ArrowUp: () => (value ?? 0) + 0.5,
			ArrowLeft: () => (value === null || value <= 0.5 ? null : value - 0.5),
			ArrowDown: () => (value === null || value <= 0.5 ? null : value - 0.5),
			Home: () => 0.5,
			End: () => 5,
			Delete: () => null,
			Backspace: () => null
		};
		if (!(event.key in step)) return;
		event.preventDefault();
		set(step[event.key]());
	}

	function pick(event: MouseEvent, n: number) {
		const box = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const half = event.clientX - box.left < box.width / 2;
		set(half ? n - 0.5 : n);
	}
</script>

{#snippet stars()}
	{#each fills as fill, i (i)}
		<span class="star {fill}" data-fill={fill} onclick={mode === 'input' ? (e) => pick(e, i + 1) : undefined} role="presentation">
			<svg bind:this={icons[i]} viewBox="0 0 24 24" aria-hidden="true"><path class="empty-path" d={STAR} /><path class="fill-path" d={STAR} /></svg>
		</span>
	{/each}
{/snippet}

{#if mode === 'input'}
	<div
		class="stars input {size} {tone}"
		role="slider"
		tabindex="0"
		aria-label={label ?? 'Rating'}
		aria-valuemin={0}
		aria-valuemax={5}
		aria-valuenow={value ?? 0}
		aria-valuetext={text}
		onkeydown={keydown}
	>
		{@render stars()}
	</div>
{:else}
	<div class="stars {size} {tone}" role="img" aria-label={name}>{@render stars()}</div>
{/if}

<style>
	.stars {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		color: var(--accent);
	}

	.photo {
		color: var(--on-photo);
	}

	.star {
		display: grid;
		place-items: center;
	}

	svg {
		inline-size: 22px;
		block-size: 22px;
		overflow: visible;
	}

	.sm svg {
		inline-size: 14px;
		block-size: 14px;
	}

	.empty-path {
		fill: none;
		stroke: currentColor;
		stroke-width: 1.4;
		stroke-linejoin: round;
		opacity: 0.55;
	}

	.fill-path {
		fill: currentColor;
		stroke: currentColor;
		stroke-width: 1.4;
		stroke-linejoin: round;
		clip-path: inset(0 100% 0 0);
	}

	.half .fill-path {
		clip-path: inset(0 50% 0 0);
	}

	.full .fill-path {
		clip-path: inset(0 0 0 0);
	}

	.input {
		gap: 0;
		border-radius: var(--r-pill);
		cursor: pointer;
		touch-action: manipulation;
	}

	.input .star {
		inline-size: 44px;
		block-size: 44px;
	}

	.input svg {
		inline-size: 28px;
		block-size: 28px;
		transition: transform var(--d-fast) var(--ease-spring);
	}

	@media (hover: hover) and (pointer: fine) {
		.input .star:hover svg {
			transform: scale(1.12);
		}

		.input .star {
			inline-size: 36px;
		}
	}
</style>
