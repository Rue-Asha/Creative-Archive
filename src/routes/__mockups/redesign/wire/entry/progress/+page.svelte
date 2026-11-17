<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../../Frame.svelte';
	import { dataFor, entryFor } from '../../list/parts/data.ts';
	import Icon from '../../list/parts/Icon.svelte';
	import Panel from '../../list/parts/Panel.svelte';
	import ProgressControl from '../../list/parts/ProgressControl.svelte';
	import StatusMark from '../../list/parts/StatusMark.svelte';
	import '../../list/parts/wire.css';

	const fx = $derived(dataFor(page.url));
	const title = $derived(entryFor(fx, 'anime').title);
</script>

<svelte:head><title>Progress states (wireframe)</title></svelte:head>

<Frame world="animanga" section="animanga">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Animanga</li><li>Anime</li></ul>
			<h1>Progress <em class="accent-word">states</em></h1>
			<p class="lede" lang={fx.worst ? 'ja' : undefined}>{title}</p>
		</div>
	</div>
	<div class="screen-body w-gallery">
		<Panel title="Mid-way" note="Step buttons name the counter; the value is a button, never a text field until activated">
			<section class="card w-card-pad" data-surface="solid" aria-label="Progress, mid-way"><ProgressControl label="Episodes" current={7} total={24} /></section>
		</Panel>
		<Panel title="At zero" note="One less is disabled">
			<section class="card w-card-pad" data-surface="solid" aria-label="Progress, at zero"><ProgressControl label="Episodes" current={0} total={24} /></section>
		</Panel>
		<Panel title="At the known total" note="One more is disabled; “Mark as watched” appears while status is not Done (“Mark as read” for manga)">
			<section class="card w-card-pad" data-surface="solid" aria-label="Progress, at the total">
				<ProgressControl label="Episodes" current={24} total={24} />
				<button type="button" class="w-btn"><Icon name="check" size={16} />Mark as watched</button>
				<span class="w-meta"><StatusMark label="Watching" state="doing" /></span>
			</section>
		</Panel>
		<Panel title="Unknown total" note="Reads “n / ?” and has no upper bound">
			<section class="card w-card-pad" data-surface="solid" aria-label="Progress, unknown total"><ProgressControl label="Episodes" current={7} total={null} /></section>
		</Panel>
		<Panel title="Typing a value" note="Activating the value (click, tap, Enter, Space) opens a numeric field with the value selected; Enter or leaving saves, Escape returns without saving">
			<section class="card w-card-pad" data-surface="solid" aria-label="Progress, typing"><ProgressControl label="Episodes" current={7} total={24} mode="edit" typed="12" /></section>
		</Panel>
		<Panel title="Typed over the total" note="30 of 24: the value reverts to the saved 7 without a save. Empty, decimal and negative input revert the same way">
			<section class="card w-card-pad" data-surface="solid" aria-label="Progress, over the total">
				<ProgressControl label="Episodes" current={7} total={24} mode="edit" typed="30" />
				<p class="w-hint">Reverts to 7 / 24 on Enter. Nothing is saved.</p>
			</section>
		</Panel>
		<Panel title="Manga: two counters" note="Chapters finish the book; Volumes is a second, independent counter">
			<section class="card w-card-pad" data-surface="solid" aria-label="Progress, manga">
				<ProgressControl label="Chapters" current={41} total={96} />
				<ProgressControl label="Volumes" current={4} total={null} />
			</section>
		</Panel>
		<Panel title="Quick controls on a card" note="The same steps sit on in-progress cards in lists and shelves, so a counter moves without opening the entry">
			<section class="card w-card-pad" data-surface="solid" aria-label="Progress on a card">
				<ProgressControl label="Chapters" current={0} total={12} />
			</section>
		</Panel>
	</div>
</Frame>
