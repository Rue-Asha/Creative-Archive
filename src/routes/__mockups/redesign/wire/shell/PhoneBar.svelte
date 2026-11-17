<script lang="ts">
	import type { Section } from '../../fixtures.ts';
	import { sectionLink, sections } from './data.ts';
	import Icon, { type IconName } from './Icon.svelte';

	type Props = {
		current: Section | null;
		worst?: boolean;
		plus?: 'shown' | 'inert';
		fit?: 'auto' | 'labels' | 'icons';
		hidden?: boolean;
		expanded?: boolean;
		inline?: boolean;
		name?: string;
		onplus?: () => void;
	};
	let { current, worst = false, plus = 'shown', fit = 'auto', hidden = false, expanded = false, inline = false, name = 'Main', onplus }: Props = $props();

	const pills = sections.filter((s) => s.id !== 'collections');
	// Collections and Settings are reached from Home, so Home is the marked pill there
	const marked = $derived(current === 'collections' ? 'home' : current);
</script>

<div class="dock" class:inline>
	<nav class="bar" aria-label={name} data-fit={fit} {hidden} inert={hidden}>
		<ul class="pills">
			{#each pills as p (p.id)}
				<li>
					<a href={sectionLink(p, worst)} aria-current={marked === p.id ? 'page' : undefined}>
						<Icon name={p.id as IconName} size={20} /><span class="label">{p.label}</span>
					</a>
				</li>
			{/each}
		</ul>
		<button
			type="button"
			class="plus"
			aria-label="Add"
			aria-haspopup="dialog"
			aria-expanded={plus === 'inert' ? undefined : expanded}
			aria-disabled={plus === 'inert' ? 'true' : undefined}
			onclick={() => plus !== 'inert' && onplus?.()}
		>
			<Icon name="plus" size={24} />
		</button>
	</nav>
</div>

<style>
	.dock { container-type: inline-size; inline-size: 100%; max-inline-size: 30rem; margin-inline: auto; }
	.dock.inline { max-inline-size: none; }
	.bar { display: flex; align-items: center; gap: var(--space-2); }
	.bar[hidden] { display: none; }
	.pills { display: flex; flex: 1; min-inline-size: 0; gap: var(--space-0-5); margin: 0; padding: var(--space-1); list-style: none; border-radius: var(--radius-pill); background: var(--surface-glass-strong); -webkit-backdrop-filter: var(--glass-filter); backdrop-filter: var(--glass-filter); box-shadow: var(--shadow-rim); }
	.pills li { flex: 1 1 auto; min-inline-size: var(--target-touch); }
	a { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--space-0-5); min-block-size: calc(var(--target-touch) + var(--space-2)); padding-inline: 0; border-radius: var(--radius-pill); color: var(--ink); text-decoration: none; font-size: var(--type-kicker-size); line-height: 1.1; font-weight: var(--weight-medium); }
	a[aria-current] { background: var(--surface-inverse); color: var(--ink-on-inverse); }
	.label { max-inline-size: 100%; overflow: hidden; white-space: nowrap; }
	.plus { display: grid; place-items: center; flex: none; inline-size: calc(var(--target-touch) + var(--space-1)); block-size: calc(var(--target-touch) + var(--space-1)); padding: 0; border: 0; border-radius: var(--radius-round); background: var(--surface-inverse); color: var(--ink-on-inverse); box-shadow: var(--shadow-lift); cursor: pointer; }
	.plus[aria-disabled="true"] { opacity: var(--disabled-opacity); box-shadow: none; cursor: default; }
	.bar[data-fit="icons"] .label { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); }
	@container (max-width: 330px) {
		.bar:not([data-fit="labels"]) .label { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); }
	}
</style>
