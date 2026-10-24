<script lang="ts">
	import Wordmark from '$lib/components/Wordmark.svelte';

	// The brand lockup: the mark (the operator's PNG, brand/mark/, STAR-166) + wordmark, as one home link.
	// Header and Footer both render this, so the logo can only ever change in
	// one place. aria-label is passed only where the visible text alone would
	// not name the link well (the footer).
	let { label }: { label?: string } = $props();
</script>

<a class="brand" href="/" aria-label={label ?? undefined}>
	<img class="mark" src="/mark/mark-64.png" srcset="/mark/mark-64.webp 1x, /mark/mark-128.webp 2x" width="36" height="36" alt="" aria-hidden="true" /><Wordmark size="header" />
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
	/* The mark (raster, transparent; brand/mark/ copies in static/mark/), sized in ems so it
	   tracks the wordmark. The negative inline margins take back the square's transparent
	   padding beside the narrow gauntlet (same rule as brand/fleet-base.css). */
	.mark {
		display: block;
		width: 2em;
		height: 2em;
		margin-inline: -0.3em -0.35em;
		flex-shrink: 0;
	}
</style>
