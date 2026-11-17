<script lang="ts">
	import { href } from '../shell/data.ts';
	import { DOMAIN_LABEL } from '../shell/data.ts';
	import { LISTS, nested } from '../list/data.ts';
	import { TYPES, type FormKind } from './data.ts';

	// "Music — Albums — Add": a breadcrumb kicker of links, the current part marked
	type Props = { kind: FormKind; last: string; lastHref?: string; worst?: boolean; head: string; word: string; lede: string; lang?: string };
	let { kind, last, lastHref, worst = false, head, word, lede, lang }: Props = $props();
	const info = $derived(TYPES[kind]);
</script>

<div class="screen-head">
	<div class="screen-lead">
		<nav aria-label="Breadcrumb">
			<ol class="kicker">
				<li><a href={href('domain', worst, `d=${info.domain}`)}>{DOMAIN_LABEL[info.domain]}</a></li>
				<li><a href={nested('list', worst, `d=${info.domain}&t=${info.list}`)}>{LISTS[info.list].name}</a></li>
				<li>{#if lastHref}<a href={lastHref} aria-current="page">{last}</a>{:else}<span aria-current="page">{last}</span>{/if}</li>
			</ol>
		</nav>
		<h1 {lang}>{head} <em class="accent-word">{word}</em></h1>
		<p class="lede">{lede}</p>
	</div>
</div>
