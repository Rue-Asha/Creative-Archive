<script lang="ts">
	import { page } from '$app/state';
	import Frame from '../../Frame.svelte';
	import { mockData } from '../../fixtures.ts';
	import { asList, LISTS, listEntries, nested } from '../list/data.ts';
	import ListBody from '../list/ListBody.svelte';
	import { barActions, TAGS } from './actions.ts';
	import SelectionBar from './SelectionBar.svelte';
	import SelectSheet from './SelectSheet.svelte';

	const data = $derived(mockData(new URL(page.url.href)));
	const def = $derived(LISTS[asList(page.url.searchParams.get('t'))]);
	const list = $derived(listEntries(def, data));
	const long = $derived(data.worst ? data.tags.map((t) => ({ name: t.name, count: t.count })) : TAGS);

	let picked = $derived(list.entries.slice(2, 6).map((e) => e.id));
	let last = $state<number | null>(null);
	let sheet = $state<'status' | 'tag-add' | 'tag-remove' | null>(null);

	function toggle(id: number, e: MouseEvent) {
		const ids = list.entries.map((x) => x.id);
		if (e.shiftKey && last !== null) {
			const [a, b] = [ids.indexOf(last), ids.indexOf(id)].sort((x, y) => x - y);
			picked = [...new Set([...picked, ...ids.slice(a, b + 1)])];
		} else picked = picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id];
		last = id;
	}
	const doneHref = $derived(nested('list', data.worst, `d=${def.domain}&t=${def.slug}`));
</script>

<svelte:head><title>{def.name}, Select · Creative Archive</title></svelte:head>

<Frame world={def.domain} section={def.domain} list={def.slug}>
	<ListBody {def} entries={list.entries} total={list.total} worst={data.worst} select={{ selected: picked, ontoggle: toggle }}>
		{#snippet bar()}
			<SelectionBar count={picked.length} actions={barActions(def)} {doneHref} onselect={(id) => (sheet = id as 'status')} open={sheet} />
		{/snippet}
	</ListBody>
</Frame>

{#if sheet}
	<SelectSheet kind={sheet} {def} count={picked.length} tags={long} open onclose={() => (sheet = null)} />
{/if}
