<script lang="ts">
	import { base, domainLabel, type Domain } from './data.ts';

	type Props = { domain: Domain; list: string; word: string; lede: string };
	let { domain, list, word, lede }: Props = $props();
</script>

<div class="screen-head">
	<div class="screen-lead">
		<nav aria-label="Breadcrumb">
			<ol class="kicker">
				<li><a href="{base}/domain">{domainLabel[domain]}</a></li>
				<li><a href="{base}/list">{list}</a></li>
				<li><span aria-current="page">Add</span></li>
			</ol>
		</nav>
		<h1>Add <em class="accent-word">{word}</em></h1>
		<p class="lede">{lede}</p>
	</div>
</div>
