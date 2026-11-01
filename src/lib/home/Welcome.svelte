<script lang="ts">
	import { DOMAIN_LABEL, DOMAINS, type Domain } from '#lib/domains.ts';
	import { TYPES } from '#lib/entries/config.ts';
	import { reveal, stagger } from '#lib/motion.ts';
	import type { EntryType } from '#lib/types.ts';
	import ArrowButton from '#lib/ui/ArrowButton.svelte';
	import Icon from '#lib/ui/Icon.svelte';

	const FIRST: Record<Domain, EntryType> = { music: 'album', animanga: 'anime', books: 'book', fashion: 'piece' };
	const LINE: Record<Domain, string> = {
		music: 'Albums, artists and songs you love or want to hear.',
		animanga: 'What you watch and read, episode by episode.',
		books: 'The shelf you are in the middle of, and the one waiting.',
		fashion: 'Brands, shops, pieces you own and looks you keep.'
	};
</script>

<section class="column welcome" data-welcome aria-labelledby="welcome-title" use:reveal>
	<h2 id="welcome-title" data-section-heading>Your archive starts here</h2>
	<ul>
		{#each DOMAINS as domain, i (domain)}
			<li class="liquid" data-welcome-domain={domain} use:reveal={{ delay: stagger(i) }}>
				<Icon name={domain} size={28} />
				<h3>{DOMAIN_LABEL[domain]}</h3>
				<p>{LINE[domain]}</p>
				<a href="/add/{FIRST[domain]}">Add your first {TYPES[FIRST[domain]].label.toLowerCase()} <ArrowButton decorative variant="outline" size="sm" /></a>
			</li>
		{/each}
	</ul>
</section>

<style>
	.welcome {
		display: grid;
		gap: var(--s-5);
	}

	h2 {
		font-size: var(--t-display-2);
	}

	ul {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: var(--s-4);
	}

	li {
		display: grid;
		align-content: start;
		gap: var(--s-3);
		padding: var(--s-5);
		border-radius: var(--r-card);
		color: var(--accent);
	}

	h3 {
		font-family: var(--font-display);
		font-size: var(--t-display-3);
		color: var(--ink);
	}

	p {
		color: var(--ink-2);
		font-size: 14px;
	}

	a {
		display: inline-flex;
		align-items: center;
		gap: var(--s-2);
		min-block-size: 44px;
		font-size: 14px;
		font-weight: 600;
		color: var(--ink);
	}

	@media (max-width: 1023px) {
		ul {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--s-3);
		}

		li {
			padding: var(--s-4);
		}
	}
</style>
