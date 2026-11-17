<script lang="ts">
	import { hideOnType } from '#lib/components/scroll-cue/cue.ts';
	import type { Section } from '../../fixtures.ts';
	import { sectionHref, sections } from './data.ts';
	import Icon, { type IconName } from './Icon.svelte';
	import { pill } from './pill.ts';

	type Props = {
		current: Section | null;
		worst?: boolean;
		plus?: 'shown' | 'inert';
		expanded?: boolean;
		name?: string;
		specimen?: boolean;
		onplus?: () => void;
	};
	let { current, worst = false, plus = 'shown', expanded = false, name = 'Main', specimen = false, onplus }: Props = $props();

	const tabs = sections.filter((s) => s.id !== 'collections');
	// Collections and Settings are reached from Home, so Home is the marked tab there
	const marked = $derived(current === 'collections' ? 'home' : current);
</script>

<nav class="dock" aria-label="{name} tabs" data-specimen={specimen ? '' : undefined} use:hideOnType>
	<ul class="dock-tabs" data-pill use:pill>
		{#each tabs as t (t.id)}
			<li>
				<a href={sectionHref(t, worst)} aria-current={marked === t.id ? 'page' : undefined} data-press>
					<Icon name={t.id as IconName} size={20} /><span>{t.label}</span>
				</a>
			</li>
		{/each}
	</ul>
	<button
		type="button"
		class="dock-add"
		aria-label="Add"
		aria-haspopup="dialog"
		aria-expanded={plus === 'inert' ? undefined : expanded}
		aria-disabled={plus === 'inert' ? 'true' : undefined}
		data-press="round"
		data-focus="halo"
		onclick={() => plus !== 'inert' && onplus?.()}
	>
		<Icon name="plus" size={24} />
	</button>
</nav>
