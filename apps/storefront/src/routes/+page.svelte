<script lang="ts">
	import Heading from '$lib/components/Heading.svelte';
	import Wordmark from '$lib/components/Wordmark.svelte';
	import HeroArt from '$lib/components/HeroArt.svelte';
	import CapabilityIcon from '$lib/components/CapabilityIcon.svelte';
	import FeatureSplit from '$lib/components/FeatureSplit.svelte';
	import TerminalCard from '$lib/components/TerminalCard.svelte';
	import DeviceMockup from '$lib/components/DeviceMockup.svelte';
	import Faq from '$lib/components/Faq.svelte';
	import { ev } from '$lib/content/evidence';
	import { home, capabilities, work, principles, operator, site, faq } from '$lib/content/copy';

	// availableFrom is computed per request in +page.server.ts so the quarter
	// never goes stale; see src/lib/availability.ts.
	let { data } = $props();

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
</script>

<svelte:head>
	<title>{home.title}</title>
	<meta name="description" content={home.description} />
	{@html `<script type="application/ld+json">${faqLd}<` + `/script>`}
</svelte:head>

<!-- 2 · Hero — service, person, next action, without scrolling -->
<section class="hero">
	<!-- Decorative station art sits behind the copy on phones and beside it on
	     desktop; absolutely positioned, so it can never shift the layout. -->
	<div class="hero-art" aria-hidden="true"><HeroArt /></div>
	<div class="hero-inner">
		<p class="eyebrow">{home.hero.eyebrow}</p>
		<div class="hero-mark"><Wordmark size="hero" /></div>
		<div class="hero-copy">
			<h1>{home.hero.h1}</h1>
			<p class="lede">{home.hero.sub}</p>
			<p class="byline">
				{home.hero.byline}
				<a href={home.hero.bylineLink.href}>{home.hero.bylineLink.label} →</a>
			</p>
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

<!-- 3 · Proof strip — checkable before the pitch -->
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
</section>

<!-- 4 · Capabilities — the thing being sold -->
<section id="capabilities" class="section section-divided">
	<p class="eyebrow">{home.capabilities.eyebrow}</p>
	<Heading {...home.capabilities.h2} />
	<p class="lede">{home.capabilities.sub}</p>
	<!-- Fixed 2x2 on desktop, one column on phones. Four static tiles: no
	     marquee, no duplicated set. The whole tile is the link. -->
	<div class="tiles">
		{#each capabilities.items as c (c.id)}
			<a class="tile reveal" href={c.href}>
				<span class="chip-lg"><CapabilityIcon name={c.id as 'automation' | 'platform' | 'bots' | 'fullstack'} /></span>
				<h3>{c.name}</h3>
				<p>{c.summary}</p>
				<span class="go" aria-hidden="true">→</span>
			</a>
		{/each}
	</div>
	<div class="btn-row">
		<a class="btn btn-ghost" href="/capabilities">Scope, deliverables, and how to start →</a>
	</div>
</section>

<!-- 4b · Three proofs at length. Alternating sides; the cards show real output
     shapes, never live numbers. -->
{#each home.features as f, i (f.id)}
	<FeatureSplit
		eyebrow={f.eyebrow}
		heading={f.h2}
		body={f.body}
		link={f.link}
		evidence={f.evidence}
		flip={i % 2 === 1}
	>
		{#snippet media()}
			<TerminalCard title={f.card.title} lines={f.card.lines} caption={f.card.caption} evidence={f.evidence} />
		{/snippet}
	</FeatureSplit>
{/each}

<!-- 4c · Featured case — one live product on real device captures -->
<section id="featured" class="section section-divided" data-evidence={home.featured.evidence}>
	<div class="split">
		<div class="copy">
			<p class="eyebrow">{home.featured.eyebrow}</p>
			<Heading {...home.featured.h2} />
			<p class="lede">{home.featured.body}</p>
			<p class="btn-row">
				{#each home.featured.links as l (l.href)}
					<a class="btn btn-secondary" href={l.href} rel="noopener">{l.label} →</a>
				{/each}
			</p>
		</div>
		<div class="media">
			<DeviceMockup desktop={home.featured.desktop} mobile={home.featured.mobile} />
		</div>
	</div>
</section>

<!-- 4d · How it works — three static steps, numbered by CSS counter -->
<section id="how" class="section section-divided">
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

<!-- 5 · Selected work — the products appear as proof, not as a shop shelf -->
<section id="fleet" class="section section-divided">
	<p class="eyebrow">{home.work.eyebrow}</p>
	<Heading {...home.work.h2} />
	<p class="lede">{home.work.sub}</p>
	<div class="grid-2">
		{#each work.items as w (w.id)}
			<a class="card reveal" href={w.href} rel="noopener" data-evidence={w.evidence}>
				<h3>{w.name}</h3>
				<p class="what">{w.what}</p>
				<p><span class="tag">{w.status}</span></p>
				<p>{w.proves}</p>
			</a>
		{/each}
	</div>
</section>

<!-- 6 · Operating principles -->
<section id="principles" class="section section-divided">
	<p class="eyebrow">{home.principles.eyebrow}</p>
	<Heading {...home.principles.h2} />
	<p class="lede">{home.principles.sub}</p>
	<ul class="ev-list principles">
		{#each principles as p (p.title)}
			<li data-evidence={p.evidence}>
				<strong>{p.title}</strong>
				{p.detail}
				{#if p.link}
					<a href={p.link.href} rel={p.link.href.startsWith('/') ? undefined : 'noopener'}>{p.link.label} →</a>
				{/if}
			</li>
		{/each}
	</ul>
</section>

<!-- 7 · Operator teaser -->
<section id="operator" class="section section-divided">
	<p class="eyebrow">{home.operator.eyebrow}</p>
	<h2>{home.operator.h2}</h2>
	<div class="prose">
		<p>{operator.lede}</p>
	</div>
	<div class="btn-row">
		<a class="btn btn-ghost" href={home.operator.cta.href}>{home.operator.cta.label} →</a>
	</div>
</section>

<!-- 8 · FAQ -->
<section id="faq" class="section section-divided">
	<p class="eyebrow">{faq.eyebrow}</p>
	<Heading {...faq.h2} />
	<Faq items={faq.items} />
</section>

<!-- 9 · Closing CTA band — raised panel with an amber halo -->
<section id="start" class="section section-divided">
	<div class="band reveal">
		<p class="eyebrow">{home.contact.eyebrow}</p>
		<Heading {...home.contact.h2} />
		<p class="lede">{home.contact.body}</p>
		<ul class="checks">
			{#each home.contact.checklist as item, i (item)}
				<li data-evidence={i === 0 ? ev('no-third-party-tracking') : undefined}>
					<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
					{item}
				</li>
			{/each}
		</ul>
		<p class="availability">{home.contact.availability(data.availableFrom)}</p>
		<div class="btn-row">
			<a class="btn btn-primary" href={home.contact.cta.href}>{home.contact.cta.label}</a>
			<a class="btn btn-secondary" href={'mailto:' + site.email}>{site.email}</a>
		</div>
	</div>
</section>

<style>
	.hero {
		position: relative;
		overflow: hidden; /* art may bleed past the edge; never scroll sideways */
		background: radial-gradient(ellipse at 20% -10%, var(--bg-raised) 0%, var(--bg) 65%);
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
	/* Phones: art is a faint backdrop, bottom-right, low opacity so the
	   muted-text contrast the copy relies on is unchanged. */
	.hero-art {
		position: absolute;
		right: -30%;
		bottom: 8%;
		width: 110%;
		max-width: 560px;
		opacity: 0.22;
		pointer-events: none;
	}
	/* Desktop: text left, art right, art at full strength. */
	@media (min-width: 900px) {
		/* Copy and art are disjoint columns: copy takes at most 54% of the row, the
		   art sits in the right 40%, so panel grid lines never cross text. */
		.hero-copy {
			max-width: 54%;
		}
		.hero-art {
			right: max(0px, calc((100% - var(--page)) / 2 - var(--sp-7)));
			bottom: var(--sp-5);
			width: 40%;
			max-width: 520px;
			opacity: 1;
		}
	}
	/* ── capability tiles ───────────────────────────────────────────────── */
	.tiles {
		display: grid;
		gap: var(--sp-4);
		grid-template-columns: 1fr;
	}
	@media (min-width: 700px) {
		.tiles {
			grid-template-columns: 1fr 1fr;
			gap: var(--sp-5);
		}
	}
	.tile {
		position: relative;
		display: block;
		padding: var(--sp-5);
		background: linear-gradient(180deg, var(--surface-2) 0%, var(--surface) 100%);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-soft);
		color: inherit;
		transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
	}
	.tile:hover {
		transform: translateY(var(--lift));
		box-shadow: var(--shadow-lift);
		border-color: var(--accent);
		text-decoration: none;
		color: inherit;
	}
	.tile h3 {
		color: var(--text);
		margin-bottom: var(--sp-2);
	}
	.tile p {
		color: var(--text-muted);
		font-size: var(--fs-1);
		margin: 0;
		padding-right: var(--sp-6); /* keeps copy clear of the arrow */
	}
	.go {
		position: absolute;
		right: var(--sp-5);
		bottom: var(--sp-5);
		color: var(--accent);
		transition: transform 0.2s ease;
	}
	.tile:hover .go {
		transform: translateX(var(--sp-1));
	}
	/* No lift for people who asked for less motion; border still signals hover. */
	@media (prefers-reduced-motion: reduce) {
		.tile:hover,
		.tile:hover .go {
			transform: none;
		}
	}
	/* ── featured case ──────────────────────────────────────────────────── */
	.split {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--sp-6);
		align-items: center;
	}
	@media (min-width: 900px) {
		.split {
			grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
			gap: var(--sp-8);
		}
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
	/* ── how it works: CSS counter, so no digits live in the copy ───────── */
	.steps {
		list-style: none;
		margin: var(--sp-5) 0 0;
		padding: 0;
		display: grid;
		gap: var(--sp-4);
		counter-reset: step;
	}
	@media (min-width: 800px) {
		.steps {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: var(--sp-5);
		}
	}
	.steps li {
		counter-increment: step;
		padding: var(--sp-5);
		background: var(--surface);
		border: 1px solid var(--border);
		border-top: 2px solid var(--accent);
		border-radius: var(--radius-lg);
	}
	.steps li::before {
		content: counter(step, decimal-leading-zero);
		display: block;
		margin-bottom: var(--sp-3);
		font-size: var(--fs-4);
		font-weight: 700;
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
	.byline {
		color: var(--text-muted);
		font-size: var(--fs-1);
		max-width: var(--measure);
		margin-top: var(--sp-4);
	}
	.what {
		color: var(--text);
	}
	.card .tag {
		color: var(--text-muted);
	}
	.principles li {
		max-width: var(--measure);
	}
	/* Availability reads as a live status, not as marketing copy — hence the
	   accent dot and the quieter weight. */
	.availability {
		color: var(--text);
		font-size: var(--fs-1);
		margin-top: var(--sp-3);
		display: flex;
		align-items: center;
		gap: var(--sp-2);
	}
	.availability::before {
		content: '';
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent);
		flex-shrink: 0;
	}
</style>
