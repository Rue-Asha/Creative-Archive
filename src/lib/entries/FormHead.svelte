<script lang="ts">
	import { DOMAIN_LABEL } from '#lib/domains.ts';
	import { BRANDS_SHOPS, TYPES } from '#lib/entries/config.ts';
	import { listHref } from '#lib/entries/derive.ts';
	import type { EntryType } from '#lib/types.ts';

	// "Music — Albums — Add": the breadcrumb sits on one line and only its last part gives way to a long title
	let {
		type,
		last,
		lastHref,
		head,
		word,
		lede
	}: { type: EntryType; last: string; lastHref?: string; head: string; word: string; lede: string } = $props();

	const config = $derived(TYPES[type]);
	const listLabel = $derived(type === 'brand' || type === 'site' ? BRANDS_SHOPS.label : config.plural);
</script>

<div class="screen-head form-head">
	<div class="screen-lead">
		<nav aria-label="Breadcrumb">
			<ol class="kicker crumbs">
				<li><a href="/{config.domain}">{DOMAIN_LABEL[config.domain]}</a></li>
				<li><a href={listHref(type)}>{listLabel}</a></li>
				<li>
					{#if lastHref}
						<a href={lastHref} title={last} aria-current="page">{last}</a>
					{:else}
						<span aria-current="page">{last}</span>
					{/if}
				</li>
			</ol>
		</nav>
		<h1>{head} <em class="accent-word">{word}</em></h1>
		<p class="lede">{lede}</p>
	</div>
</div>

<style>
	nav {
		max-inline-size: 100%;
		min-inline-size: 0;
	}
	.crumbs {
		flex-wrap: nowrap;
		max-inline-size: 100%;
		min-inline-size: 0;
	}
	.crumbs li {
		flex: none;
		white-space: nowrap;
	}
	.crumbs li:last-child {
		flex: 0 1 auto;
		min-inline-size: 0;
	}
	.crumbs li:last-child > * {
		display: block;
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	/* the links reach the touch target without moving the line: the extra height hangs into the space around the kicker */
	.crumbs a {
		min-block-size: var(--target);
		margin-block: calc((var(--target-min) - var(--target)) / 2);
	}
	/* a block link loses the kicker's centring in its target height; the line height puts the text back on the others' line */
	.crumbs li:last-child > a {
		line-height: var(--target);
	}
	h1 {
		overflow-wrap: anywhere;
	}
</style>
