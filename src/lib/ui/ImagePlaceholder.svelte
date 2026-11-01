<script lang="ts">
	import type { AccentName } from '#lib/styles/worlds.ts';
	import { initials } from './initials.ts';

	// a null tint takes the surrounding world's accent
	let { title, tint, class: cls = '' }: { title: string; tint: AccentName | null; class?: string } = $props();
</script>

<div class="placeholder {cls}" data-accent={tint} role="img" aria-label={title}>
	<span class="letters" aria-hidden="true">{initials(title)}</span>
</div>

<style>
	.placeholder {
		container-type: inline-size;
		position: relative;
		display: grid;
		place-items: center;
		inline-size: 100%;
		block-size: 100%;
		overflow: hidden;
		background:
			var(--grain),
			radial-gradient(90% 70% at 80% 10%, var(--accent-glow), transparent 65%),
			radial-gradient(80% 60% at 10% 100%, var(--accent-wash), transparent 70%),
			linear-gradient(160deg, var(--accent-soft), var(--surface-2));
		color: var(--accent);
	}

	.letters {
		font-family: var(--font-display);
		font-style: var(--accent-style);
		font-weight: var(--display-weight);
		letter-spacing: var(--display-tracking);
		font-size: clamp(28px, 34cqi, 120px);
		line-height: 1;
		translate: 0 -8%;
	}
</style>
