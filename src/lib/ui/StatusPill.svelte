<script lang="ts">
	import Button from '#lib/components/button/Button.svelte';
	import Menu from '#lib/components/menu/Menu.svelte';
	import Icon from './Icon.svelte';

	let {
		label,
		options,
		value,
		onchange,
		disabled = false
	}: {
		label: string;
		options: { value: string; label: string }[];
		value: string;
		onchange: (value: string) => void;
		disabled?: boolean;
	} = $props();

	const id = $props.id();
	let open = $state(false);
	const current = $derived(options.find((o) => o.value === value)?.label ?? value);

	function choose(next: string) {
		open = false;
		if (next !== value) onchange(next);
	}
</script>

<Button variant="secondary" class="status-pill" popovertarget={id} aria-haspopup="menu" aria-expanded={open} {disabled}>
	{label}: <span data-status-label>{current}</span>
	<Icon name="chevron-down" size={16} />
</Button>
<Menu {id} name={label} bind:open>
	{#each options as option (option.value)}
		<button type="button" class="menu-item" role="menuitemradio" aria-checked={option.value === value} tabindex="-1" onclick={() => choose(option.value)}>
			<Icon name="check" size={16} />{option.label}
		</button>
	{/each}
</Menu>

<style>
	/* a new status shows at once: the pill's fill does not fade as its menu closes (motion "Status changes at once") */
	:global(.btn.status-pill) {
		transition: none;
	}
</style>
