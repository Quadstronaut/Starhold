<script lang="ts">
	// The brand word, split in two: "Star" solid, "hold" outline-only.
	// Two sizes share one component so the logotype can never drift between
	// the header and the hero.
	//
	// 'header' is a real, readable name: the two spans sit flush (no space
	// between them in the markup), so a screen reader hears "Starhold".
	// 'hero' is pure decoration — the page's h1 carries the meaning — so it is
	// hidden from assistive tech.
	let { size = 'header' }: { size?: 'hero' | 'header' } = $props();
</script>

<span class="wordmark {size}" aria-hidden={size === 'hero' ? 'true' : undefined}
	><span class="solid">Star</span><span class="outline">hold</span></span
>

<style>
	.wordmark {
		/* --font-display is only ever referenced here: A1 pins the display face
		   to brand rules so it can't leak into body copy. */
		font-family: var(--font-display);
		font-weight: 400; /* Michroma ships one weight; faux-bold would smear it */
		line-height: 1;
		white-space: nowrap;
	}
	.header {
		font-size: var(--fs-2);
		letter-spacing: 0.02em;
	}
	.hero {
		display: block;
		font-size: var(--fs-display);
		letter-spacing: -0.01em;
	}

	.solid {
		color: var(--text);
	}

	/* Fallback first: where text-stroke is unsupported, "hold" is plain amber
	   rather than invisible transparent text. */
	.outline {
		color: var(--accent);
	}
	@supports (-webkit-text-stroke: 1px red) {
		.outline {
			color: transparent;
			-webkit-text-stroke: var(--stroke-w) var(--accent);
		}
	}
</style>
