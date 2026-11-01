<script lang="ts">
	import { fade } from 'svelte/transition';
	import { hideOnOutro, reducedMotion, rise } from '#lib/motion.ts';
	import Button from '#lib/ui/Button.svelte';

	let { onkeep, ondiscard }: { onkeep: () => void; ondiscard: () => void } = $props();

	let dialog: HTMLElement;

	// focus goes in on open (on the safe choice) and returns to where it was when the dialog closes
	$effect(() => {
		const before = document.activeElement as HTMLElement | null;
		dialog.querySelector('button')?.focus();
		return () => before?.focus();
	});

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			onkeep();
		} else if (event.key === 'Tab') {
			const buttons = [...dialog.querySelectorAll<HTMLElement>('button')];
			const first = buttons[0];
			const last = buttons[buttons.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		}
	}

	const scrim = () => ({ duration: reducedMotion() ? 0 : 160 });
</script>

<svelte:window {onkeydown} />

<div class="scrim" transition:fade={scrim()} aria-hidden="true"></div>
<div class="wrap">
	<div
		class="dialog liquid liquid-strong"
		role="alertdialog"
		aria-modal="true"
		aria-labelledby="discard-title"
		aria-describedby="discard-body"
		bind:this={dialog}
		transition:rise={{ y: 18 }}
		use:hideOnOutro
	>
		<h2 id="discard-title">Discard changes?</h2>
		<p id="discard-body">What you changed on this entry isn't saved yet.</p>
		<div class="actions">
			<Button variant="accent" arrow={false} onclick={onkeep}>Keep editing</Button>
			<Button variant="secondary" arrow={false} onclick={ondiscard}>Discard</Button>
		</div>
	</div>
</div>

<style>
	.scrim {
		position: fixed;
		inset: 0;
		z-index: 70;
		background: var(--scrim-end);
	}

	.wrap {
		position: fixed;
		inset: 0;
		z-index: 71;
		display: grid;
		place-items: center;
		padding: var(--s-4);
		pointer-events: none;
	}

	.dialog {
		pointer-events: auto;
		inline-size: min(100%, 420px);
		display: flex;
		flex-direction: column;
		gap: var(--s-3);
		padding: var(--s-6);
		border-radius: var(--r-panel);
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--s-2);
		margin-block-start: var(--s-3);
	}
</style>
