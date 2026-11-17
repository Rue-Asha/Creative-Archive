<script lang="ts">
	import Button from '#lib/components/button/Button.svelte';
	import Sheet from '#lib/components/sheet/Sheet.svelte';

	let { onkeep, ondiscard }: { onkeep: () => void; ondiscard: () => void } = $props();

	let open = $state(true);
	let choice: 'keep' | 'discard' = 'keep';

	// the sheet closes first (focus goes back to what opened it), then the choice runs; Escape, the close button and the backdrop keep editing
	function pick(next: 'keep' | 'discard') {
		choice = next;
		open = false;
	}
</script>

<Sheet bind:open alert mode="sheet" title="Discard changes?" onclose={() => (choice === 'discard' ? ondiscard() : onkeep())}>
	<p>What you changed on this entry isn't saved yet.</p>
	{#snippet actions()}
		<Button variant="secondary" autofocus onclick={() => pick('keep')}>Keep editing</Button>
		<Button variant="secondary" onclick={() => pick('discard')}>Discard</Button>
	{/snippet}
</Sheet>
