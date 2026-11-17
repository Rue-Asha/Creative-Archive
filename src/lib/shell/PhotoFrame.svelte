<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { World } from '#lib/domains.ts';

	// `.app[data-photo][data-world] > .frame > figure.stage` with the world's hero photo; a world without one shows the
	// colour field (no stage photo, nothing requested). A domain's world is the fingerprint's night stage (Rue, gate 7,
	// direction B); Home names no world, so it keeps charcoal and the light stage.
	type Props = {
		world: World;
		image: number | null;
		bar: Snippet;
		dock: Snippet;
		children: Snippet;
		after?: Snippet;
	};
	let { world, image, bar, dock, children, after }: Props = $props();

	const src = $derived(image === null ? null : `/images/${image}`);
	const night = $derived(world !== 'home');
</script>

<div class="app" data-world={night ? world : undefined} data-stage={night ? 'night' : undefined} data-backdrop={src ? undefined : 'field'} data-photo={src ?? undefined} style:--photo={src ? `url("${src}")` : undefined}>
	<div class="frame">
		{#if src}<figure class="stage" aria-hidden="true"><img class="stage-photo" {src} alt="" /></figure>{/if}
		{@render bar()}
		<main class="screen" id="main">
			{@render children()}
		</main>
	</div>
	{@render dock()}
	{@render after?.()}
</div>
