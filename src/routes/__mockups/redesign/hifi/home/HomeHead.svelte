<script lang="ts">
	import { getContext } from 'svelte';
	import Icon from '../shell/Icon.svelte';
	import { fmt, href } from '../shell/data.ts';
	import { LEDE, type HomeView } from './data.ts';

	type Props = { view: Pick<HomeView, 'worst' | 'total' | 'inProgressCount' | 'collections'> };
	let { view }: Props = $props();
	const openPlus = getContext<(() => void) | undefined>('openPlus');
</script>

<div class="screen-head">
	<div class="screen-lead">
		<ul class="kicker"><li>Home</li><li>Your archive</li></ul>
		<h1>Everything you <em class="accent-word">love</em>, kept close</h1>
		<p class="lede">{LEDE}</p>
		<div class="actions">
			<button type="button" class="btn primary arrow add" aria-haspopup="dialog" data-press data-focus="halo" onclick={() => openPlus?.()}>Add<span class="circle" aria-hidden="true"><svg data-nudge viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span></button>
			<a class="btn secondary" href={href('settings', view.worst)} data-press><Icon name="settings" />Settings</a>
		</div>
	</div>
	<ul class="screen-facts" data-surface="inverse" aria-label="Archive key facts">
		<li class="facts-caption">Whole archive</li>
		<li><span class="n">{fmt(view.total)}</span>{view.total === 1 ? 'Entry' : 'Entries'}</li>
		<li><span class="n">{fmt(view.inProgressCount)}</span>In progress</li>
		<li><span class="n">{fmt(view.collections.length)}</span>{view.collections.length === 1 ? 'Collection' : 'Collections'}</li>
	</ul>
</div>

<style>
	.actions { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3); }
	@media (max-width: 1023px) {
		.add { display: none; }
	}
</style>
