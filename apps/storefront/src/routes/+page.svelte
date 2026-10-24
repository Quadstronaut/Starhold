<script lang="ts">
	import Heading from '$lib/components/Heading.svelte';
	import Wordmark from '$lib/components/Wordmark.svelte';
	import HeroArt from '$lib/components/HeroArt.svelte';
	import Faq from '$lib/components/Faq.svelte';
	import { home, services, principles, comingSoon, faq } from '$lib/content/copy';

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
	<!-- Decorative station art sits behind the copy on phones and beside it on
	     desktop; absolutely positioned, so it can never shift the layout. -->
	<div class="hero-art" aria-hidden="true"><HeroArt /></div>
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
	/* ── access steps: CSS counter, so no digits live in the copy ───────── */
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
