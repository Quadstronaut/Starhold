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
	/* STAR-166 R12: the hollow half sits tighter so "Starhold" reads as one
	   word at 390 px, and its stroke is about 15 % lighter. No glow. */
	.outline {
		color: var(--accent);
		letter-spacing: -0.02em;
		margin-left: -0.03em;
	}
	@supports (-webkit-text-stroke: 1px red) {
		.outline {
			color: transparent;
			-webkit-text-stroke: calc(var(--stroke-w) * 0.85) var(--accent);
		}
		/* STAR-166 F7: at 1200 px and up the hero word is ~112 px tall, where the
		   hairline outline thins out; one extra pixel keeps "hold" as solid as "Star". */
		@media (min-width: 1200px) {
			.hero .outline {
				-webkit-text-stroke-width: calc(var(--stroke-w) * 0.85 + 1px);
			}
		}
	}
</style>
