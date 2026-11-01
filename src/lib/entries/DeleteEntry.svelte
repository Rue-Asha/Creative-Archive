<script lang="ts">
	import { tick } from 'svelte';
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { COPY } from '#lib/copy.ts';
	import { fadeSlide, hideOnOutro } from '#lib/motion.ts';
	import { toast } from '#lib/shell/toast.ts';
	import Button from '#lib/ui/Button.svelte';

	let { title, typeLabel }: { title: string; typeLabel: string } = $props();

	let open = $state(false);
	let deleting = $state(false);
	let dialog = $state<HTMLDivElement>();
	let opener: Element | null = null;

	async function show() {
		opener = document.activeElement;
		open = true;
		await tick();
		dialog?.querySelector('button')?.focus();
	}

	async function close() {
		open = false;
		await tick();
		(opener as HTMLElement | null)?.focus();
	}

	const submit: SubmitFunction = ({ cancel }) => {
		if (deleting) return cancel();
		deleting = true;
		return async ({ result }) => {
			if (result.type === 'redirect') toast(COPY.deleted);
			await applyAction(result);
			deleting = false;
		};
	};

	function keys(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			close();
		} else if (event.key === 'Tab') {
			const items = [...dialog!.querySelectorAll<HTMLElement>('button:not(:disabled)')];
			const at = items.indexOf(document.activeElement as HTMLElement);
			const next = items[(at + (event.shiftKey ? -1 : 1) + items.length) % items.length];
			event.preventDefault();
			next.focus();
		}
	}
</script>

<div class="trigger" inert={open} aria-hidden={open ? 'true' : undefined}>
	<Button variant="secondary" arrow={false} onclick={show}>Delete</Button>
</div>

{#if open}
	<div class="overlay" role="presentation" onpointerdown={(e) => e.target === e.currentTarget && close()}>
		<div
			class="dialog liquid liquid-strong"
			role="dialog"
			aria-modal="true"
			tabindex="-1"
			aria-labelledby="delete-title"
			bind:this={dialog}
			onkeydown={keys}
			transition:fadeSlide={{ y: 14 }}
			use:hideOnOutro
		>
			<h2 id="delete-title">Delete this {typeLabel.toLowerCase()}?</h2>
			<p class="name">{title}</p>
			<p>It leaves your collections and its history goes with it.</p>
			<form method="POST" action="?/delete" use:enhance={submit}>
				<Button variant="secondary" arrow={false} onclick={close}>Cancel</Button>
				<Button type="submit" arrow={false} disabled={deleting}>Delete</Button>
			</form>
		</div>
	</div>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 80;
		display: grid;
		place-items: center;
		padding: var(--s-4);
		background: var(--scrim-end);
	}

	.dialog {
		display: grid;
		gap: var(--s-3);
		inline-size: min(100%, 440px);
		padding: var(--s-7);
		border-radius: var(--r-panel);
	}

	h2 {
		font-size: var(--t-display-3);
	}

	.name {
		font-weight: 600;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		overflow-wrap: anywhere;
	}

	p:last-of-type {
		color: var(--ink-2);
	}

	form {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		gap: var(--s-3);
		margin-block-start: var(--s-4);
	}
</style>
