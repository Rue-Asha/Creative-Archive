<script lang="ts">
	import { COPY } from '#lib/copy.ts';
	import { DOMAIN_LABEL, DOMAINS, type World } from '#lib/domains.ts';
	import HeroSlot from '#lib/settings/HeroSlot.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const slots: { world: World; label: string }[] = [
		{ world: 'home', label: 'Home' },
		...DOMAINS.map((d) => ({ world: d, label: DOMAIN_LABEL[d] }))
	];
	const set = $derived(slots.filter((s) => data.heroes[s.world] != null).length);
</script>

<svelte:head><title>Settings · Creative Archive</title></svelte:head>

<div class="screen-head">
	<div class="screen-lead">
		<ul class="kicker"><li>Settings</li><li>{set} of {slots.length} set</li></ul>
		<h1>Hero <em class="accent-word">photos</em></h1>
		<p class="lede">{COPY.heroExplanation}</p>
	</div>
	<ul class="screen-facts" data-surface="inverse" aria-label="Photos set">
		<li class="facts-caption">Hero photos</li>
		<li><span class="n">{set}</span>Set</li>
		<li><span class="n">{slots.length - set}</span>Without</li>
	</ul>
</div>

<div class="screen-body" data-settle>
	<ul class="slots">
		{#each slots as slot (slot.world)}
			<li>
				<HeroSlot
					world={slot.world}
					label={slot.label}
					image={data.heroes[slot.world] ?? null}
					error={form && 'error' in form && form.world === slot.world ? form.error : ''}
				/>
			</li>
		{/each}
	</ul>
</div>

<style>
	.slots {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
		gap: var(--space-4);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.slots > li {
		min-inline-size: 0;
	}

	/* the lead grows up to the facts card */
	.screen-lead {
		max-inline-size: none;
	}
</style>
