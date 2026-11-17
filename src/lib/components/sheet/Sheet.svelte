<!--
	Sheet: copy-in reference primitive from Design-System (sync.sh <app> --primitive sheet).
	The app owns this copy; restyle it with fingerprint tokens only.
	A modal <dialog> opened with showModal(): a bottom sheet on phones and a centred dialog
	from 768px; mode="dialog" is centred everywhere (confirmations). Focus moves in (put
	autofocus on the first field, otherwise the first control gets it) and returns to the
	opener; Escape, the close button and a click on the backdrop close it; the page behind
	does not scroll. Props: open (bindable), title, kicker, mode (sheet | dialog), alert (an
	alertdialog: a confirmation), closeLabel, onclose, children, actions (a snippet for the
	footer row). Put autofocus on the control that should hold focus first (Cancel on a
	confirmation). App edits: alert, data-surface="solid" (buttons inside take the tinted fill).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		open?: boolean;
		title: string;
		kicker?: string;
		mode?: 'sheet' | 'dialog';
		alert?: boolean;
		closeLabel?: string;
		onclose?: () => void;
		children: Snippet;
		actions?: Snippet;
	};

	const uid = $props.id();
	let { open = $bindable(false), title, kicker, mode = 'sheet', alert = false, closeLabel = 'Close', onclose, children, actions }: Props = $props();

	let dialog: HTMLDialogElement;
	let opener: HTMLElement | null = null;
	let closing = $state(false);

	$effect(() => {
		if (open && !dialog.open) {
			closing = false;
			opener = document.activeElement as HTMLElement | null;
			dialog.showModal();
		} else if (!open && dialog.open && !closing) {
			// The exit animation runs first; finish() closes the dialog when it ends, or on the
			// next frame when nothing animates (no CSS loaded, a test DOM).
			closing = true;
			requestAnimationFrame(() => {
				if (closing && dialog.getAnimations().length === 0) finish();
			});
		}
	});

	// showModal() leaves Tab free to reach the browser's own UI; wrap it inside the dialog
	function trap(event: KeyboardEvent) {
		if (event.key !== 'Tab') return;
		const items = [...dialog.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')].filter((el) => el.offsetParent !== null);
		if (!items.length) return;
		const at = items.indexOf(document.activeElement as HTMLElement);
		const next = items[(at + (event.shiftKey ? -1 : 1) + items.length) % items.length];
		event.preventDefault();
		next.focus();
	}

	function finish() {
		if (!closing) return;
		closing = false;
		dialog.close();
		if (opener?.isConnected) opener.focus();
		opener = null;
		onclose?.();
	}
</script>

<dialog
	bind:this={dialog}
	class={mode}
	data-sheet
	data-surface="solid"
	role={alert ? 'alertdialog' : undefined}
	aria-labelledby="{uid}-title"
	data-closing={closing ? '' : undefined}
	onkeydown={trap}
	oncancel={(e) => {
		e.preventDefault();
		open = false;
	}}
	onclick={(e) => {
		if (e.target === dialog) open = false;
	}}
	onanimationend={(e) => {
		if (e.target === dialog) finish();
	}}
>
	<header>
		<div>
			{#if kicker}<p class="kicker">{kicker}</p>{/if}
			<h2 id="{uid}-title">{title}</h2>
		</div>
		<button type="button" class="close" aria-label={closeLabel} data-press="round" onclick={() => (open = false)}>
			<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
		</button>
	</header>
	<div class="body">
		{#if open || closing}{@render children()}{/if}
	</div>
	{#if actions}<footer>{@render actions()}</footer>{/if}
</dialog>

<style>
	/* The page behind stays put while a sheet is open. */
	:global(html:has(dialog[data-sheet][open])) {
		overflow: hidden;
	}

	dialog {
		flex-direction: column;
		inline-size: 100%;
		max-inline-size: none;
		max-block-size: min(88dvh, 100% - var(--space-6));
		margin: auto 0 0;
		padding: 0;
		border: 0;
		border-radius: var(--radius-card) var(--radius-card) 0 0;
		background: var(--surface-glass-strong);
		-webkit-backdrop-filter: var(--glass-filter);
		backdrop-filter: var(--glass-filter);
		box-shadow: var(--elevation-card);
		color: var(--ink);
		overflow: hidden;
		animation: rise var(--motion-quick) var(--ease-out);
	}
	dialog[open] {
		display: flex;
	}
	dialog::backdrop {
		background: var(--dialog-scrim, var(--surface-tint-strong));
		animation: fade-in var(--motion-quick) var(--ease-out);
	}
	dialog[data-closing] {
		animation: drop var(--motion-quick) var(--ease-out) forwards;
	}
	dialog[data-closing]::backdrop {
		animation: fade-out var(--motion-quick) var(--ease-out) forwards;
	}

	header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-5) var(--space-4) var(--space-3) var(--space-5);
	}
	.kicker {
		margin-block-end: var(--space-1);
		font-size: var(--type-kicker-size);
		line-height: var(--type-kicker-line);
		letter-spacing: var(--type-kicker-tracking);
		font-weight: var(--type-kicker-weight);
		text-transform: uppercase;
		color: var(--ink-secondary);
	}
	h2 {
		font-size: var(--type-display-s-size);
		line-height: var(--type-display-s-line);
		letter-spacing: var(--type-display-s-tracking);
	}
	.close {
		display: grid;
		place-items: center;
		flex: none;
		inline-size: max(var(--control-height-s), var(--target));
		block-size: max(var(--control-height-s), var(--target));
		margin-block-start: calc(-1 * var(--space-1));
		border: 0;
		border-radius: var(--radius-round);
		background: var(--surface-raised);
		box-shadow: var(--ring-hairline);
		color: var(--ink);
	}
	@media (hover: hover) {
		.close:hover {
			background: var(--surface-sunken);
		}
	}

	.body {
		flex: 1;
		min-block-size: 0;
		overflow: auto;
		overscroll-behavior: contain;
		padding: var(--space-1) var(--space-5) var(--space-5);
	}
	.body:last-child {
		padding-block-end: calc(var(--space-5) + env(safe-area-inset-bottom));
	}
	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--space-2);
		padding: var(--sheet-footer-padding-block-start) var(--sheet-footer-padding-inline)
			calc(var(--sheet-footer-padding-block-end) + env(safe-area-inset-bottom));
		box-shadow: var(--sheet-footer-rule);
	}

	.dialog {
		inline-size: min(calc(var(--measure) * 0.75), 100% - 2 * var(--space-4));
		margin: auto;
		border-radius: var(--radius-card);
		animation-name: pop;
	}
	.dialog[data-closing] {
		animation-name: unpop;
	}
	@media (min-width: 768px) {
		.sheet {
			inline-size: min(var(--measure), 100% - 2 * var(--space-8));
			max-block-size: min(86dvh, 100% - var(--space-16));
			margin: auto;
			border-radius: var(--radius-card);
			animation-name: pop;
		}
		.sheet[data-closing] {
			animation-name: unpop;
		}
		header {
			padding: var(--space-6) var(--space-5) var(--space-3) var(--space-6);
		}
		.body {
			padding-inline: var(--space-6);
		}
		footer {
			padding-inline: var(--sheet-footer-padding-inline-wide);
		}
	}

	/* Rue, gate 7: a short soft open and close. The bottom sheet rises a little out of the bottom edge, a centred one
	   grows out of the press scale; both fade. */
	@keyframes pop {
		from {
			opacity: 0;
			transform: scale(var(--press-scale));
		}
	}
	@keyframes unpop {
		to {
			opacity: 0;
			transform: scale(var(--press-scale));
		}
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(var(--settle-rise));
		}
	}
	@keyframes drop {
		to {
			opacity: 0;
			transform: translateY(var(--settle-rise));
		}
	}
	@keyframes fade-in {
		from {
			opacity: 0;
		}
	}
	@keyframes fade-out {
		to {
			opacity: 0;
		}
	}

	/* reduced motion: open and close at once (finish() closes on the next frame when nothing animates) */
	@media (prefers-reduced-motion: reduce) {
		dialog.sheet,
		dialog.dialog,
		dialog.sheet[data-closing],
		dialog.dialog[data-closing],
		dialog.sheet::backdrop,
		dialog.dialog::backdrop {
			animation: none;
		}
	}
</style>
