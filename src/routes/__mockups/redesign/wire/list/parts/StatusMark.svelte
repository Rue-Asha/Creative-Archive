<script lang="ts">
	let { label, state }: { label: string; state: 'want' | 'doing' | 'done' | 'dropped' | 'wishlist' | 'owned' | 'gone' } = $props();
</script>

<span class="w-status">
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		{#if state === 'done' || state === 'owned'}
			<circle cx="12" cy="12" r="9" /><path d="M8 12.5l3 3 5-6" />
		{:else if state === 'doing'}
			<circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
		{:else if state === 'dropped' || state === 'gone'}
			<circle cx="12" cy="12" r="9" /><path d="M8 12h8" />
		{:else}
			<circle cx="12" cy="12" r="9" />
		{/if}
	</svg>
	{label}
</span>
