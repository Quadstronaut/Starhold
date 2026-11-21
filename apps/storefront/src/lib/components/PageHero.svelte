<script lang="ts">
	import type { Snippet } from 'svelte';
	import Wordmark from '#lib/components/Wordmark.svelte';
	import HeroArt from '#lib/components/HeroArt.svelte';
	import { HERO_BASE, HERO_SIZES, heroFallbackSrc, heroPool, heroSrcset } from '#lib/heroes.js';

	// STAR-299: the home hero, lifted into one component so every page that has a hero
	// shows it the same way. The image is one entry of the STAR-166 pool, picked on the
	// server per load (lib/server/hero-load.ts) and passed in as `pick`; ?hero=<id> forces
	// one. The art is decorative: behind the words on phones, beside them on desktop, never
	// under them, and absolutely positioned so it cannot move the layout.
	let {
		pick,
		eyebrow,
		h1,
		lede,
		wordmark = false,
		verbatimEyebrow = false,
		extra,
		children
	}: {
		pick: string;
		eyebrow: string;
		h1: string;
		lede: string;
		/** The big wordmark above the headline. Home page only. */
		wordmark?: boolean;
		/** Render the eyebrow as written (status labels), not uppercased. */
		verbatimEyebrow?: boolean;
		/** Rendered between the lede and the buttons (STAR-310: the home page's domain check). */
		extra?: Snippet;
		children?: Snippet;
	} = $props();

	const hero = $derived(heroPool.find((e) => e.id === pick) ?? heroPool[0]);
	const heroPoolAttr = JSON.stringify(heroPool);
</script>

<section class="hero">
	<!-- Star chart (STAR-166 R5): sparse, static, behind everything; shown only under
	     body.has-starchart (app.html). -->
	<svg class="starchart" viewBox="0 0 1440 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
		<g class="chart-links"><path d="M660 64 L780 34 L884 92 L1002 48 L1118 106 L1236 62 L1352 112 M1118 106 L1172 208 L1300 262 M1352 112 L1404 222 M884 92 L930 190" /></g>
		<g class="chart-stars">
			<circle cx="660" cy="64" r="1.1" /><circle cx="780" cy="34" r="1.4" /><circle cx="884" cy="92" r="1.2" /><circle cx="1002" cy="48" r="1.9" />
			<circle cx="1118" cy="106" r="1.4" /><circle cx="1236" cy="62" r="1.2" /><circle cx="1352" cy="112" r="1.7" /><circle cx="1172" cy="208" r="1" />
			<circle cx="1300" cy="262" r="1.3" /><circle cx="1404" cy="222" r="1.1" /><circle cx="930" cy="190" r="1" /><circle cx="1290" cy="22" r="1" />
			<circle cx="560" cy="30" r="0.9" /><circle cx="1424" cy="40" r="1.1" />
		</g>
	</svg>
	<div class="hero-art" aria-hidden="true" data-hero-pool={heroPoolAttr} data-hero-base={HERO_BASE} data-hero-sizes={HERO_SIZES} data-hero-pick={hero.id}>
		{#if hero.kind === 'svg'}
			<HeroArt />
		{:else}
			<picture>
				<source type="image/avif" srcset={heroSrcset(hero, 'avif')} sizes={HERO_SIZES} />
				<source type="image/webp" srcset={heroSrcset(hero, 'webp')} sizes={HERO_SIZES} />
				<img class="hero-raster" src={heroFallbackSrc(hero)} width={hero.width} height={hero.height} alt="" decoding="async" fetchpriority="high" />
			</picture>
		{/if}
	</div>
	<div class="hero-inner" class:compact={!wordmark}>
		<p class="eyebrow" class:verbatim={verbatimEyebrow}>{eyebrow}</p>
		{#if wordmark}<div class="hero-mark"><Wordmark size="hero" /></div>{/if}
		<div class="hero-copy">
			<h1>{h1}</h1>
			<p class="lede">{lede}</p>
			{#if extra}{@render extra()}{/if}
			{#if children}<div class="btn-row">{@render children()}</div>{/if}
		</div>
	</div>
</section>

<style>
	.hero {
		position: relative;
		overflow: hidden; /* art may bleed past the edge; never scroll sideways */
		background: var(--bg); /* STAR-166 R4: flat, no radial wash */
		border-bottom: 1px solid var(--border);
	}
	.hero-inner {
		position: relative; /* paints above the art */
		max-width: var(--page);
		margin: 0 auto;
		padding: var(--sp-6) var(--sp-5) var(--sp-6);
	}
	/* Inner pages have no wordmark, so they get the height back as padding. */
	.hero-inner.compact {
		padding-top: var(--sp-7);
		padding-bottom: var(--sp-7);
	}
	.hero-mark {
		margin: var(--sp-2) 0 var(--sp-4);
	}
	/* STAR-166 F1, phones: a shallow band behind the wordmark and headline at 0.2,
	   so the muted copy keeps its contrast. The SVG is xMinYMid slice, so it fills
	   the band's width and crops top and bottom. Same rules as fleet-base.css. */
	.hero-art {
		position: absolute;
		top: var(--sp-8);
		left: 0;
		right: 0;
		height: 240px;
		opacity: 0.2;
		pointer-events: none;
	}
	/* A raster pick fills the same box, cropped like the drawing's slice fit, with
	   every edge feathered into --bg (the images sit on their own near-black). Same
	   rules as fleet-base.css .fleet-hero-art .hero-raster. */
	.hero-art picture,
	.hero-raster {
		display: block;
		width: 100%;
		height: 100%;
	}
	.hero-raster {
		object-fit: cover;
		object-position: 60% 50%;
		mask-image: linear-gradient(to right, transparent, black 22%, black 86%, transparent), linear-gradient(to bottom, transparent, black 16%, black 84%, transparent);
		mask-composite: intersect;
	}
	@media (min-width: 900px) {
		/* Copy and art are disjoint columns: copy takes at most 54% of the content
		   box, the art starts one gutter right of it or of the hero wordmark (~5.46em
		   of --fs-display), whichever ends later, so lines never cross text. */
		.hero-copy {
			max-width: 54%;
		}
		/* Desktop: the art spans the full hero height and runs a --sp-9 past the
		   right viewport edge, where the hero's overflow crops it (F1). */
		.hero-art {
			top: 0;
			bottom: 0;
			height: auto;
			left: calc(max(0px, (100% - var(--page)) / 2) + var(--sp-5) + max((min(100%, var(--page)) - 2 * var(--sp-5)) * 0.54, var(--fs-display) * 5.5) + var(--sp-5));
			right: calc(-1 * var(--sp-9));
			opacity: 1;
		}
	}
</style>
