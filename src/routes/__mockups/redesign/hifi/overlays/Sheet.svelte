<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import './overlays.css';

	// `inline` draws the sheet open in place (specimens); otherwise a modal <dialog> opened with showModal(): a bottom sheet on a phone,
	// centred from 768 px. Focus moves to the control marked data-initial (Cancel on a confirmation) and returns to the opener.
	type Props = {
		title: string;
		kicker?: string;
		open?: boolean;
		inline?: boolean;
		alert?: boolean;
		mode?: 'sheet' | 'dialog';
		describedby?: string;
		closeLabel?: string;
		onclose?: () => void;
		children?: Snippet;
		actions?: Snippet;
	};
	let { title, kicker, open = $bindable(false), inline = false, alert = false, mode = 'sheet', describedby, closeLabel = 'Close', onclose, children, actions }: Props = $props();

	const uid = $props.id();
	let dialog = $state<HTMLDialogElement>();
	let opener: HTMLElement | null = null;

	$effect(() => {
		if (inline || !dialog) return;
		if (open && !dialog.open) {
			opener = document.activeElement as HTMLElement | null;
			dialog.showModal();
			dialog.querySelector<HTMLElement>('[data-initial]')?.focus();
		} else if (!open && dialog.open) dialog.close();
	});

	function closed() {
		open = false;
		if (opener?.isConnected) opener.focus();
		opener = null;
		onclose?.();
	}
</script>

<dialog
	bind:this={dialog}
	class={mode}
	class:inline
	data-sheet
	data-surface="solid"
	open={inline || undefined}
	role={alert ? 'alertdialog' : undefined}
	aria-labelledby="{uid}-title"
	aria-describedby={describedby}
	onclose={closed}
	onclick={(e) => !inline && e.target === dialog && dialog?.close()}
>
	<header>
		<div>
			{#if kicker}<p class="kicker">{kicker}</p>{/if}
			<h2 id="{uid}-title">{title}</h2>
		</div>
		<button type="button" class="close" aria-label={closeLabel} data-press="round" onclick={() => (inline ? undefined : dialog?.close())}><Icon name="close" /></button>
	</header>
	<div class="body">{#if children}{@render children()}{/if}</div>
	{#if actions}<footer>{@render actions()}</footer>{/if}
</dialog>

<style>
	.body { display: grid; gap: var(--space-3); align-content: start; }
</style>
