<script lang="ts">
	import Heading from '$lib/components/Heading.svelte';
	import Wordmark from '$lib/components/Wordmark.svelte';
	import HeroArt from '$lib/components/HeroArt.svelte';
	import Faq from '$lib/components/Faq.svelte';
	import { home, services, principles, comingSoon, faq } from '$lib/content/copy';
	import { HERO_BASE, HERO_SIZES, heroFallbackSrc, heroPool, heroSrcset } from '$lib/heroes';

	// STAR-166 hero pool: +page.ts picks an id (server first, client on every
	// navigation back here); data-hero-pool lists the pool for the staging switcher.
	let { data } = $props();
	const hero = $derived(heroPool.find((e) => e.id === data.hero) ?? heroPool[0]);
	const heroPoolAttr = JSON.stringify(heroPool);

	// FAQPage structured data, built from the same copy array the accordion
	// renders. JSON.stringify handles quoting; escaping "<" stops any string
	// from closing the script tag early (copy is static, this is belt and braces).
	const faqLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faq.items.map((i) => ({
			'@type': 'Question',
			name: i.q,
			acceptedAnswer: { '@type': 'Answer', text: i.a }
		}))
	}).replace(/</g, '\\u003c');

	const byId = new Map(services.items.map((s) => [s.id, s]));
	const external = (href: string) => !href.startsWith('/');
</script>

<svelte:head>
	<title>{home.title}</title>
	<meta name="description" content={home.description} />
	{@html `<script type="application/ld+json">${faqLd}<` + `/script>`}
</svelte:head>

<!-- 1 · Hero — what this is, how available it is, and the next action -->
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
	<!-- Decorative station art sits behind the copy on phones and beside it on
	     desktop; absolutely positioned, so it can never shift the layout. One of
	     the brand/heroes/dev pool per load: a raster as <picture>, or the Opus drawing. -->
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
	<div class="hero-inner">
		<p class="eyebrow">{home.hero.eyebrow}</p>
		<div class="hero-mark"><Wordmark size="hero" /></div>
		<div class="hero-copy">
			<h1>{home.hero.h1}</h1>
			<p class="lede">{home.hero.sub}</p>
			<div class="btn-row">
				<a class="btn btn-primary" data-testid="cta-primary" href={home.hero.ctaPrimary.href}>
					{home.hero.ctaPrimary.label}
				</a>
				<a class="btn btn-secondary" data-testid="cta-secondary" href={home.hero.ctaSecondary.href}>
					{home.hero.ctaSecondary.label}
				</a>
			</div>
		</div>
	</div>
</section>

<!-- 2 · Proof strip — three checkable items, then the one line on tests -->
<section class="section section-tight" aria-label={home.proofHeading}>
	<p class="eyebrow">{home.proofHeading}</p>
	<ul class="proof">
		{#each home.proof as p (p.href)}
			<li>
				<!-- Internal tiles (the privacy policy) stay in-tab; outbound ones get noopener. -->
				<a
					href={p.href}
					rel={p.href.startsWith('/') ? undefined : 'noopener'}
					data-evidence={p.evidence}
				>
					{p.label}
					<span class="verifier">{p.verifier}</span>
				</a>
			</li>
		{/each}
	</ul>
	<p class="testline" data-evidence={home.testLine.evidence}>
		{home.testLine.text}
		<a href={home.testLine.link.href} rel="noopener">{home.testLine.link.label} →</a>
	</p>
</section>

<!-- 3 · Services — four groups, in the Hangar's order. One action per card. -->
<section id="services" class="section section-divided">
	<p class="eyebrow">{home.work.eyebrow}</p>
	<Heading {...home.work.h2} />
	<p class="lede">{home.work.sub}</p>
	{#each services.groups as g (g.id)}
		<div class="group">
			<h3>{g.title}</h3>
			<div class="grid-2">
				{#each g.ids as id (id)}
					{@const s = byId.get(id)!}
					<article class="card service reveal" data-evidence={s.evidence}>
						<div class="namerow">
							<h4>{s.name}</h4>
							<span class="tag">{s.status}</span>
						</div>
						<p class="availability" data-testid="availability">{s.availability}</p>
						<p class="what">{s.what}</p>
						{#if s.host}<p class="host">{s.host}</p>{/if}
						{#if s.note}<p class="note">{s.note}</p>{/if}
						{#if s.invite}
							<p class="service-links"><a href={services.inviteHref(s.id)}>{s.action} →</a></p>
						{:else if s.href}
							<p class="service-links">
								<a href={s.href} rel={external(s.href) ? 'noopener' : undefined}>{s.action} →</a>
							</p>
						{/if}
					</article>
				{/each}
			</div>
		</div>
	{/each}
	<div class="btn-row">
		<a class="btn btn-secondary" href={home.work.hangar.href} rel="noopener">{home.work.hangar.label} →</a>
	</div>
</section>

<!-- 4 · Access — three static steps, numbered by CSS counter -->
<section id="access" class="section section-divided">
	<p class="eyebrow">{home.how.eyebrow}</p>
	<Heading {...home.how.h2} />
	<ol class="steps">
		{#each home.how.steps as s (s.title)}
			<li class="reveal">
				<h3>{s.title}</h3>
				<p>{s.body}</p>
			</li>
		{/each}
	</ol>
</section>

<!-- 5 · Principles — delivered pledges only; the rest is marked coming soon -->
<section id="principles" class="section section-divided">
	<p class="eyebrow">{home.principles.eyebrow}</p>
	<Heading {...home.principles.h2} />
	<p class="lede">{home.principles.sub}</p>
	<ul class="checks pledges">
		{#each principles as p (p.title)}
			<li data-evidence={p.evidence}>
				<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
				<span>
					<strong>{p.title}</strong>
					{p.detail}
					{#if p.link}
						<a href={p.link.href}>{p.link.label} →</a>
					{/if}
				</span>
			</li>
		{/each}
	</ul>
	<h3 class="soon-h">{home.principles.soonHeading}</h3>
	<ul class="soon">
		{#each comingSoon as item (item)}
			<li>{item}</li>
		{/each}
	</ul>
</section>

<!-- 6 · Fleet status — what the design does and does not promise -->
<section id="fleet" class="section section-divided" data-evidence={home.fleet.evidence}>
	<p class="eyebrow">{home.fleet.eyebrow}</p>
	<h2>{home.fleet.h2}</h2>
	<div class="prose">
		<p>{home.fleet.body}</p>
		<p><a href={home.fleet.link.href} rel="noopener">{home.fleet.link.label} →</a></p>
	</div>
</section>

<!-- 7 · Who runs it — the one place that names the person behind the "we" -->
<section id="operator" class="section section-divided">
	<p class="eyebrow">{home.operator.eyebrow}</p>
	<h2>{home.operator.h2}</h2>
	<div class="prose">
		<p data-evidence="single-operator">{home.operator.lede}</p>
	</div>
</section>

<!-- 8 · FAQ -->
<section id="faq" class="section section-divided">
	<p class="eyebrow">{faq.eyebrow}</p>
	<Heading {...faq.h2} />
	<Faq items={faq.items} />
</section>

<!-- 9 · Closing CTA — no countdowns, no scarcity -->
<section id="start" class="section section-divided">
	<div class="band reveal">
		<Heading {...home.contact.h2} />
		<div class="btn-row">
			<a class="btn btn-primary" href={home.contact.cta.href}>{home.contact.cta.label}</a>
			<a class="btn btn-secondary" href={home.contact.docs.href} rel="noopener">{home.contact.docs.label}</a>
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
	/* ── proof strip as station frames (STAR-166, Grok addendum a): corner ticks
	   just outside each card and a micro dimension mark under it. At phone width
	   both go and the card keeps only a left accent bar. ─────────────────── */
	.proof {
		row-gap: var(--sp-5);
	}
	.proof li {
		position: relative;
	}
	.proof li::before {
		content: '';
		position: absolute;
		inset: -5px;
		pointer-events: none;
		background:
			linear-gradient(var(--border-strong), var(--border-strong)) left top / 8px 1px no-repeat,
			linear-gradient(var(--border-strong), var(--border-strong)) left top / 1px 8px no-repeat,
			linear-gradient(var(--border-strong), var(--border-strong)) right bottom / 8px 1px no-repeat,
			linear-gradient(var(--border-strong), var(--border-strong)) right bottom / 1px 8px no-repeat,
			linear-gradient(var(--border-strong), var(--border-strong)) left bottom / 8px 1px no-repeat,
			linear-gradient(var(--border-strong), var(--border-strong)) left bottom / 1px 8px no-repeat;
	}
	.proof li::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -14px;
		height: 5px;
		pointer-events: none;
		background:
			linear-gradient(var(--border-strong), var(--border-strong)) left top / 1px 5px no-repeat,
			linear-gradient(var(--border-strong), var(--border-strong)) right top / 1px 5px no-repeat,
			linear-gradient(var(--border), var(--border)) 0 2px / 100% 1px no-repeat,
			linear-gradient(var(--accent), var(--accent)) 50% 0 / 1px 5px no-repeat;
	}
	@media (max-width: 520px) {
		.proof {
			row-gap: var(--sp-3);
		}
		.proof li::before,
		.proof li::after {
			display: none;
		}
		.proof a {
			border-left: 2px solid var(--accent);
		}
	}
	.testline {
		margin-top: var(--sp-4);
		color: var(--text-muted);
		font-size: var(--fs-1);
		max-width: var(--measure);
	}
	/* ── closing band: .band panel lives in app.css, shared with CtaBand ── */
	.checks {
		list-style: none;
		margin: var(--sp-4) 0 var(--sp-4);
		padding: 0;
		display: grid;
		gap: var(--sp-2);
	}
	.checks li {
		display: flex;
		align-items: flex-start;
		gap: var(--sp-3);
		color: var(--text);
	}
	.checks svg {
		width: var(--icon);
		height: var(--icon);
		flex-shrink: 0;
		fill: none;
		stroke: var(--accent);
		stroke-width: 2.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.pledges {
		max-width: var(--measure);
	}
	.soon-h {
		margin-top: var(--sp-5);
	}
	.soon {
		max-width: var(--measure);
		color: var(--text-muted);
		padding-left: var(--sp-5);
	}
	/* ── access steps: CSS counter, so no digits live in the copy ─────────
	   STAR-166 R7 "flight sequence": the three panels hang off one continuous
	   track with a hex node per step: across the top from 900 px, down the left
	   gutter below that. The track is the list's ::before, each node the step
	   h3's ::before (positioned against the li), so the markup is unchanged.
	   The li is not clip-pathed (that would clip its node); its chamfer is drawn
	   by li::after, a page-colour corner with the cut hairline across it. */
	.steps {
		position: relative;
		list-style: none;
		margin: var(--sp-5) 0 0;
		padding: 0 0 0 var(--sp-6);
		display: grid;
		gap: var(--sp-4);
		counter-reset: step;
	}
	.steps::before {
		content: '';
		position: absolute;
		left: 5px;
		top: var(--sp-5);
		bottom: var(--sp-5);
		width: 1px;
		background: var(--border-strong);
	}
	@media (min-width: 900px) {
		.steps {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: var(--sp-5);
			padding: var(--sp-6) 0 0;
		}
		.steps::before {
			left: 0;
			right: 0;
			top: 11px;
			bottom: auto;
			width: auto;
			height: 1px;
		}
	}
	.steps li {
		position: relative;
		counter-increment: step;
		padding: var(--sp-5);
		background: var(--surface);
		border: 1px solid var(--border);
		border-top: 2px solid var(--accent);
		border-radius: var(--radius-sm) 0 var(--radius-sm) var(--radius-sm);
	}
	.steps li::after {
		content: '';
		position: absolute;
		top: -2px;
		right: -1px;
		width: var(--chamfer);
		height: var(--chamfer);
		pointer-events: none;
		background: linear-gradient(to top right, transparent calc(50% - 1px), var(--border) calc(50% - 1px), var(--border) calc(50% + 1px), var(--bg) calc(50% + 1px));
	}
	.steps h3::before {
		content: '';
		position: absolute;
		left: calc(-1 * var(--sp-6));
		top: calc(var(--sp-5) + var(--sp-7) - 6px);
		width: 11px;
		height: 11px;
		background: var(--accent);
		clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
	}
	@media (min-width: 900px) {
		.steps h3::before {
			left: var(--sp-5);
			top: calc(-1 * var(--sp-6) + 6px);
		}
	}
	.steps li::before {
		content: counter(step, decimal-leading-zero);
		display: block;
		margin-bottom: var(--sp-3);
		font-family: var(--font-mono);
		font-size: var(--fs-4);
		font-weight: 400;
		font-variant-numeric: tabular-nums;
		color: var(--accent);
	}
	.steps h3 {
		margin-bottom: var(--sp-2);
	}
	.steps p {
		margin: 0;
		color: var(--text-muted);
		font-size: var(--fs-1);
	}
	/* ── service groups and cards: one action per card, so no stretched link ── */
	.group {
		margin-top: var(--sp-6);
	}
	.group h3 {
		margin-bottom: var(--sp-3);
	}
	.namerow {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-2) var(--sp-3);
		margin-bottom: var(--sp-2);
	}
	.namerow h4 {
		margin: 0;
	}
	.namerow .tag {
		margin: 0;
		color: var(--text-muted);
	}
	.what {
		color: var(--text);
	}
	.availability {
		margin: 0 0 var(--sp-2);
		color: var(--text-muted);
		font-size: var(--fs-1);
		font-weight: 600;
	}
	.service .host {
		font-family: var(--font-mono);
		font-size: var(--fs-0);
		overflow-wrap: anywhere;
	}
	.service-links a {
		font-weight: 600;
	}
</style>
