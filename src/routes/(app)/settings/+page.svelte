<script lang="ts">
	import { DOMAIN_LABEL, DOMAINS, type World } from '#lib/domains.ts';
	import HeroSlot from '#lib/settings/HeroSlot.svelte';
	import Eyebrow from '#lib/ui/Eyebrow.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const slots: { world: World; label: string }[] = [
		{ world: 'home', label: 'Home' },
		...DOMAINS.map((d) => ({ world: d, label: DOMAIN_LABEL[d] }))
	];
</script>

<svelte:head><title>Settings · Creative Archive</title></svelte:head>

<div class="column page">
	<header>
		<Eyebrow parts={['Settings']} tone="accent" />
		<h1 class="display">Hero <em>photos</em></h1>
		<p>One photo behind the title on Home and on each domain page. Without one, the page uses its theme gradient.</p>
	</header>

	<div class="slots">
		{#each slots as slot (slot.world)}
			<HeroSlot
				world={slot.world}
				label={slot.label}
				image={data.heroes[slot.world] ?? null}
				error={form && 'error' in form && form.world === slot.world ? form.error : ''}
			/>
		{/each}
	</div>
</div>

<style>
	.page {
		display: grid;
		gap: var(--s-8);
		padding-block-start: var(--nav-top);
	}

	header {
		display: grid;
		gap: var(--s-3);
		max-inline-size: 56ch;
	}

	h1 {
		margin: 0;
		font-size: var(--t-display-1);
	}

	header p {
		color: var(--ink-2);
	}

	.slots {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--s-4);
	}

	@media (min-width: 720px) {
		.slots {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 1280px) {
		.slots {
			grid-template-columns: repeat(5, minmax(0, 1fr));
		}
	}
</style>
