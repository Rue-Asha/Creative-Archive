<script lang="ts">
	let { index, total, tone = 'ink' }: { index: number; total: number; tone?: 'ink' | 'photo' } = $props();
	const pad = (n: number) => String(n).padStart(2, '0');
</script>

<span class="counter tnum {tone}" aria-label="{index} of {total}"
	><span class="now">{pad(index)}</span><span class="sep">/</span>{pad(total)}</span
>

<style>
	.counter {
		font-family: var(--font-text);
		font-size: 13px;
		font-weight: 500;
		letter-spacing: 0.08em;
		color: var(--ink-2);
		white-space: nowrap;
	}

	.now {
		color: var(--ink);
	}

	.photo,
	.photo .now {
		color: var(--on-photo);
	}

	.sep {
		margin-inline: 0.4em;
		opacity: 0.6;
	}
</style>
