<script lang="ts">
	import { page } from '$app/state';
	import Frame from './Frame.svelte';

	const base = '/__mockups/redesign';
	const screens = Object.keys(import.meta.glob('./**/+page.svelte'))
		.map((key) => key.replace(/^\.\/(.*)\/\+page\.svelte$/, '$1'))
		.filter((slug) => !slug.endsWith('+page.svelte'))
		.sort();
	const worst = $derived(page.url.searchParams.get('data') === 'worst');
</script>

<svelte:head><title>Redesign mockups</title></svelte:head>

<Frame world="home" section="home" plus="inert">
	<div class="screen-head">
		<div class="screen-lead">
			<ul class="kicker"><li>Mockups</li><li>{screens.length === 1 ? '1 screen' : `${screens.length} screens`}</li></ul>
			<h1>Redesign <em class="accent-word">mockups</em></h1>
			<p class="lede">{#if worst}<a href={base}>Normal data</a>{:else}<a href="{base}?data=worst">Worst-case data</a>{/if}</p>
		</div>
	</div>
	<div class="screen-body" data-settle>
		<section class="card" data-surface="solid">
			<div class="card-head"><h2>Screens</h2></div>
			{#if screens.length}
				<ul>
					{#each screens as slug (slug)}
						<li><a href="{base}/{slug}{worst ? '?data=worst' : ''}">{slug}</a></li>
					{/each}
				</ul>
			{:else}
				<p>No screens yet.</p>
			{/if}
		</section>
	</div>
</Frame>

<style>
	.card {
		display: grid;
		gap: var(--space-3);
		padding: var(--space-6);
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
</style>
