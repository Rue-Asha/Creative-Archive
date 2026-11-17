<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { mockData } from '../../../fixtures.ts';
	import Icon from '../../shell/Icon.svelte';
	import State from '../../shell/State.svelte';
	import StatusMark from '../../list/StatusMark.svelte';
	import { entryFor } from '../data.ts';
	import ProgressControl from '../ProgressControl.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const title = $derived(entryFor(data, 'anime').title);
</script>

<svelte:head><title>Progress states · Creative Archive</title></svelte:head>

<Frame world="animanga" section="animanga">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Animanga</li><li>Anime</li></ul>
			<h1>Progress <em class="accent-word">states</em></h1>
			<p class="lede" lang={data.worst ? 'ja' : undefined}>{title}</p>
		</div>
	</div>
	<div class="screen-body" data-settle>
		<div class="grid">
			<State label="Mid-way" note="Step buttons name the counter; the value is a button, never a text field until activated.">
				<section class="card pad" data-surface="solid" aria-label="Progress, mid-way"><ProgressControl label="Episodes" current={7} total={24} /></section>
			</State>
			<State label="At zero" note="One less is disabled.">
				<section class="card pad" data-surface="solid" aria-label="Progress, at zero"><ProgressControl label="Episodes" current={0} total={24} /></section>
			</State>
			<State label="At the known total" note="One more is disabled; “Mark as watched” appears while status is not Done (“Mark as read” for manga).">
				<section class="card pad" data-surface="solid" aria-label="Progress, at the total">
					<ProgressControl label="Episodes" current={24} total={24} />
					<div class="row"><button type="button" class="btn secondary s" data-press><Icon name="check" size={16} />Mark as watched</button><StatusMark label="Watching" state="doing" /></div>
				</section>
			</State>
			<State label="Unknown total" note="Reads “n / ?” and has no upper bound.">
				<section class="card pad" data-surface="solid" aria-label="Progress, unknown total"><ProgressControl label="Episodes" current={7} total={null} /></section>
			</State>
			<State label="Typing a value" note="Activating the value (click, tap, Enter, Space) opens a numeric field with the value selected; Enter or leaving saves, Escape returns without saving.">
				<section class="card pad" data-surface="solid" aria-label="Progress, typing"><ProgressControl label="Episodes" current={7} total={24} mode="edit" typed="12" /></section>
			</State>
			<State label="Typed over the total" note="30 of 24 reverts to the saved 7 without a save. Empty, decimal and negative input revert the same way.">
				<section class="card pad" data-surface="solid" aria-label="Progress, over the total">
					<ProgressControl label="Episodes" current={7} total={24} mode="edit" typed="30" />
					<p class="hint">Reverts to 7 / 24 on Enter. Nothing is saved.</p>
				</section>
			</State>
			<State label="Manga: two counters" note="Chapters finish the book; Volumes is a second, independent counter.">
				<section class="card pad" data-surface="solid" aria-label="Progress, manga">
					<ProgressControl label="Chapters" current={41} total={96} />
					<ProgressControl label="Volumes" current={4} total={null} />
				</section>
			</State>
		</div>
	</div>
</Frame>

<style>
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr)); gap: var(--space-4); align-items: start; }
	.pad { display: grid; gap: var(--space-3); padding: var(--space-4) var(--space-5); }
	.row { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3); font-size: var(--type-caption-size); }
	.hint { font-size: var(--type-caption-size); color: var(--ink-secondary); }
</style>
