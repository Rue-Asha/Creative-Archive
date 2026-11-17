<script lang="ts">
	import Icon from './Icon.svelte';
	import { base } from './data.ts';

	type Props = { count: number; canStatus?: boolean; canRemoveTag?: boolean; open?: 'status' | 'tag-add' | 'tag-remove' | null };
	let { count, canStatus = true, canRemoveTag = true, open = null }: Props = $props();
	const none = $derived(count === 0);
</script>

<div class="w-selbar" role="region" aria-label="Selection">
	<p class="w-selcount figures" role="status">{count === 0 ? 'Nothing selected' : `${count.toLocaleString('en-GB')} selected`}</p>
	<div class="w-selact">
		{#if canStatus}
			<button type="button" class="w-btn s" aria-haspopup="menu" aria-expanded={open === 'status'} disabled={none}>Set status<Icon name="chevron-down" size={14} /></button>
		{/if}
		<button type="button" class="w-btn s" aria-haspopup="dialog" aria-expanded={open === 'tag-add'} disabled={none}><Icon name="tag" size={14} />Add tag</button>
		{#if canRemoveTag}
			<button type="button" class="w-btn s" aria-haspopup="dialog" aria-expanded={open === 'tag-remove'} disabled={none}>Remove tag</button>
		{/if}
	</div>
	<a class="w-btn s primary" href="{base}/list">Done<span class="circle" aria-hidden="true"><Icon name="check" size={12} /></span></a>
</div>
