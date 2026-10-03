<script lang="ts">
	// Section heading built from {pre, em, post}. The em word is set in a serif
	// italic (same ink as the heading) — a single typographic accent per
	// heading. Never used for the h1: the h1 stays a deterministic plain string.
	let {
		level = 2,
		pre,
		em,
		post = ''
	}: { level?: 2 | 3; pre: string; em: string; post?: string } = $props();
</script>

<!-- Spaces are explicit so the accessible text reads "pre em post". -->
<svelte:element this={'h' + level}>
	{#if pre}{pre}{' '}{/if}<span class="accent-word">{em}</span>{post}
</svelte:element>
