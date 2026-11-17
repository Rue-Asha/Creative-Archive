<script lang="ts">
	import Button from '#lib/components/button/Button.svelte';
	import { DOMAIN_LABEL, DOMAINS, type Domain } from '#lib/domains.ts';
	import { TYPES } from '#lib/entries/config.ts';
	import type { EntryType } from '#lib/types.ts';
	import Icon from '#lib/ui/Icon.svelte';

	const FIRST: Record<Domain, EntryType> = { music: 'album', animanga: 'anime', books: 'book', fashion: 'piece' };
	const LINE: Record<Domain, string> = {
		music: 'Albums, artists and songs you love or want to hear.',
		animanga: 'What you watch and read, episode by episode.',
		books: 'The shelf you are in the middle of, and the one waiting.',
		fashion: 'Brands, shops, magazines, pieces you own and looks you keep.'
	};
</script>

<section class="card welcome" data-surface="solid" aria-labelledby="welcome-title">
	<div class="card-head"><h2 id="welcome-title">Your archive starts here</h2></div>
	<ul>
		{#each DOMAINS as domain (domain)}
			<li>
				<h3 class="ruled">{DOMAIN_LABEL[domain]}</h3>
				<p>{LINE[domain]}</p>
				<Button size="s" href="/add/{FIRST[domain]}">Add your first {TYPES[FIRST[domain]].label.toLowerCase()}<Icon name="arrow-right" size={16} /></Button>
			</li>
		{/each}
	</ul>
</section>

<style>
	.welcome {
		display: grid;
		gap: var(--space-5);
		padding: var(--space-5);
		min-inline-size: 0;
	}

	ul {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 14.5rem), 1fr));
		gap: var(--space-4);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: grid;
		align-content: start;
		justify-items: start;
		gap: var(--space-2-5);
		min-inline-size: 0;
		padding: var(--space-4);
		border-radius: var(--radius-panel);
		background: var(--surface-sunken);
	}

	p {
		color: var(--ink-secondary);
	}
</style>
