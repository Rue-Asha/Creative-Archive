<script lang="ts">
	import Menu from '#lib/components/menu/Menu.svelte';
	import { DOMAIN_LABEL, type Domain } from '#lib/domains.ts';
	import { addItems } from '#lib/shell/addItems.ts';
	import Button from '#lib/components/button/Button.svelte';

	let { domain }: { domain: Domain } = $props();

	const id = $props.id();
	let open = $state(false);
</script>

<Button variant="primary" arrow popovertarget="{id}-add" aria-haspopup="menu" aria-expanded={open}>Add</Button>
<Menu id="{id}-add" name="Add to {DOMAIN_LABEL[domain]}" bind:open>
	{#each addItems(domain) as item (item.href)}
		<a class="menu-item" role="menuitem" href={item.href} tabindex="-1">{item.label}</a>
	{/each}
</Menu>
