<script lang="ts">
	import Wordmark from '$lib/components/Wordmark.svelte';

	// The brand lockup: amber hexagon mark + wordmark, as one home link.
	// Header and Footer both render this, so the logo can only ever change in
	// one place. aria-label is passed only where the visible text alone would
	// not name the link well (the footer).
	let { label }: { label?: string } = $props();
</script>

<a class="brand" href="/" aria-label={label ?? undefined}>
	<svg class="mark" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><polygon points="12,2 21.5,7.5 21.5,16.5 12,22 2.5,16.5 2.5,7.5" /></svg><Wordmark size="header" />
</a>

<style>
	.brand {
		display: inline-flex;
		align-items: center;
		gap: var(--sp-2);
		flex-shrink: 0;
		font-weight: 700;
		font-size: var(--fs-3);
		color: var(--text);
		letter-spacing: -0.01em;
	}
	.brand:hover {
		color: var(--text);
		text-decoration: none;
	}
	/* Amber hexagon mark: solid fill, sized in ems so it tracks the wordmark. */
	.mark {
		width: 1.5em;
		height: 1.5em;
		fill: var(--accent);
		flex-shrink: 0;
	}
</style>
