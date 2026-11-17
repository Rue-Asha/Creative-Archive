<script lang="ts">
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import Button from '#lib/components/button/Button.svelte';
	import Sheet from '#lib/components/sheet/Sheet.svelte';
	import { COPY } from '#lib/copy.ts';
	import { toast } from '#lib/shell/toast.ts';
	import Icon from '#lib/ui/Icon.svelte';

	// `trigger` false: the page opens it from its own menu through `open`
	let { title, typeLabel, open = $bindable(false), trigger = true }: { title: string; typeLabel: string; open?: boolean; trigger?: boolean } = $props();

	const formId = $props.id();
	let deleting = $state(false);

	const submit: SubmitFunction = ({ cancel }) => {
		if (deleting) return cancel();
		deleting = true;
		return async ({ result }) => {
			if (result.type === 'redirect') toast(COPY.deleted);
			await applyAction(result);
			deleting = false;
		};
	};
</script>

{#if trigger}<Button variant="danger" onclick={() => (open = true)}>Delete</Button>{/if}

<Sheet bind:open alert mode="sheet" title="Delete this {typeLabel.toLowerCase()}?">
	<p class="name">{title}</p>
	<p>It leaves your collections and its history goes with it.</p>
	<form id={formId} method="POST" action="?/delete" use:enhance={submit}></form>
	{#snippet actions()}
		<Button variant="secondary" autofocus onclick={() => (open = false)}>Cancel</Button>
		<Button variant="danger" type="submit" form={formId} disabled={deleting}><Icon name="trash" size={16} />Delete</Button>
	{/snippet}
</Sheet>

<style>
	/* the thing being deleted, set as the dialog's display line (hi-fi) */
	.name {
		font-family: var(--font-display);
		font-weight: var(--weight-display);
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		color: var(--ink);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		overflow: hidden;
	}

	p {
		margin-block-end: var(--space-3);
	}
</style>
