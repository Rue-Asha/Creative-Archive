<script lang="ts">
	let { parts, tone = 'ink', class: cls = '' }: { parts: string[]; tone?: 'ink' | 'accent' | 'photo'; class?: string } =
		$props();
</script>

<p class="eyebrow {tone} {cls}">
	{#each parts as part, i (i)}{#if i > 0}<span class="dash" aria-hidden="true"></span>{/if}<span>{part}</span>{/each}
</p>

<style>
	.eyebrow {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0 var(--s-3);
		margin: 0;
		font-family: var(--font-text);
		font-size: var(--t-eyebrow);
		font-weight: 600;
		letter-spacing: var(--tracking-eyebrow);
		text-transform: uppercase;
		line-height: 1.7;
		color: var(--ink-2);
	}

	.accent {
		color: var(--accent);
	}

	.photo {
		color: var(--on-photo);
	}

	.dash {
		inline-size: 20px;
		block-size: 1px;
		background: currentColor;
		opacity: 0.55;
	}
</style>
