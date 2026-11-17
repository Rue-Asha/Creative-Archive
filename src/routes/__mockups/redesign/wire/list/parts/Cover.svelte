<script lang="ts">
	import { initials, type Tone } from './data.ts';
	import Icon from './Icon.svelte';

	let { title, cover, tone = 'square', big = false }: { title: string; cover: string | null; tone?: Tone; big?: boolean } = $props();
</script>

{#if cover}
	<span class="w-cover" data-tone={tone} data-big={big || undefined} aria-hidden="true"><Icon name="image" size={big ? 28 : 20} /></span>
{:else}
	<span class="w-cover plate" data-tone={tone} data-big={big || undefined} role="img" aria-label="No cover yet">{initials(title)}</span>
{/if}
