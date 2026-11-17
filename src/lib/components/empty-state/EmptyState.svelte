<!--
	EmptyState: copy-in reference primitive from Design-System (sync.sh <app> --primitive empty-state).
	The app owns this copy; restyle it with fingerprint tokens only.
	What a list or screen says when it has nothing yet: a title, one plain line, one action.
	Props: title, body (one sentence), heading (h2 | h3, default h2), action (a snippet,
	usually the app's Button).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = { title: string; body: string; heading?: 'h2' | 'h3'; action?: Snippet };

	let { title, body, heading = 'h2', action }: Props = $props();
</script>

<div class="empty" data-surface="solid">
	<svelte:element this={heading} class="title">{title}</svelte:element>
	<p class="body">{body}</p>
	{#if action}<div class="action">{@render action()}</div>{/if}
</div>

<style>
	.empty {
		display: grid;
		justify-items: start;
		gap: var(--space-2);
		max-inline-size: var(--measure);
		padding: var(--space-8) var(--space-6);
		border-radius: var(--radius-card);
		background: var(--surface-card);
		box-shadow: var(--shadow-rim);
	}
	.title {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
		text-wrap: balance;
	}
	.body {
		font-size: var(--type-body-size);
		line-height: var(--type-body-line);
		color: var(--ink-secondary);
	}
	.action {
		margin-block-start: var(--space-3);
	}
</style>
