<script lang="ts">
	import { fmt, href } from '../shell/data.ts';
	import AddMenu from './AddMenu.svelte';
	import type { DomainView } from './data.ts';

	let { view, menu = false }: { view: DomainView; menu?: boolean } = $props();
</script>

<div class="screen-head">
	<div class="screen-lead">
		<nav aria-label="Sub-types">
			<ul class="kicker">
				{#each view.subTypes as s (s.slug)}
					<li><a href={href('list', view.worst, `d=${view.d}&t=${s.slug}`)}>{s.label}<span class="cnt">{fmt(s.count)}</span></a></li>
				{/each}
			</ul>
		</nav>
		<h1><em class="accent-word">{view.label}</em></h1>
		<p class="lede">{view.lede}</p>
		<div class="actions"><AddMenu domain={view.d} worst={view.worst} shown={menu} /></div>
	</div>
	<ul class="screen-facts" data-surface="inverse" aria-label="{view.label} key facts">
		<li class="facts-caption">Whole domain</li>
		<li><span class="n">{fmt(view.total)}</span>{view.total === 1 ? 'Entry' : 'Entries'}</li>
		{#if view.media}<li><span class="n">{fmt(view.inProgressCount)}</span>In progress</li>{/if}
		<li><span class="n">{fmt(view.subTypes.length)}</span>{view.subTypes.length === 1 ? 'Sub-type' : 'Sub-types'}</li>
	</ul>
</div>

<style>
	.kicker a { min-block-size: var(--target); }
	.cnt { margin-inline-start: var(--space-1-5); font-weight: var(--weight-regular); color: var(--ink-secondary); }
</style>
