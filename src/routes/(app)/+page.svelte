<script lang="ts">
	import { DOMAIN_LABEL, DOMAINS } from '#lib/domains.ts';
	import Shelf from '#lib/entries/Shelf.svelte';
	import CollectionsBento from '#lib/home/CollectionsBento.svelte';
	import { countUp } from '#lib/home/countUp.ts';
	import Coverflow from '#lib/home/Coverflow.svelte';
	import Welcome from '#lib/home/Welcome.svelte';
	import { reveal, stagger } from '#lib/motion.ts';
	import PhotoHero from '#lib/shell/PhotoHero.svelte';
	import Eyebrow from '#lib/ui/Eyebrow.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const domainOf = (key: string) => DOMAINS.find((d) => key === `recent-${d}`);
</script>

<svelte:head><title>Creative Archive</title></svelte:head>

<div class="column home">
	<div class="frame">
		<PhotoHero image={data.hero} world="home">
			<div class="hero-body" class:solo={data.coverflow.length === 0}>
				<div class="copy" data-page-header>
					<Eyebrow parts={DOMAINS.map((d) => DOMAIN_LABEL[d])} tone="photo" />
					<h1 class="display">Everything you <em>love</em>, kept close</h1>
					<p class="intro">
						Music, anime and manga, books and fashion: what you want next, what you are in the middle of, and what stayed.
					</p>
				</div>
				{#if data.coverflow.length}<Coverflow entries={data.coverflow} />{/if}
			</div>
		</PhotoHero>
	</div>
</div>

{#if data.shelves.length === 0}
	<Welcome />
{/if}

{#each data.shelves as shelf, i (shelf.key)}
	{@const domain = domainOf(shelf.key)}
	<div use:reveal={{ delay: stagger(i) }}>
		<Shelf {shelf} accent={domain ? DOMAIN_LABEL[domain] : undefined} countAction={countUp} />
	</div>
{/each}

{#if data.collections.length}
	<CollectionsBento collections={data.collections} countAction={countUp} />
{/if}

<style>
	.home {
		padding-block-start: 12px;
	}

	.frame {
		border-radius: var(--r-frame);
		overflow: hidden;
		box-shadow: var(--shadow-float);
	}

	.hero-body {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
		align-items: center;
		gap: var(--s-6);
	}

	.hero-body.solo {
		grid-template-columns: minmax(0, 1fr);
	}

	.copy {
		display: grid;
		gap: var(--s-5);
		max-inline-size: 520px;
	}

	.intro {
		max-inline-size: 42ch;
		color: var(--on-photo);
		opacity: 0.92;
	}

	@media (max-width: 1023px) {
		.home {
			padding-block-start: var(--s-4);
		}

		.hero-body {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--s-7);
		}
	}
</style>
