<script lang="ts">
	import Heading from '#lib/components/Heading.svelte';
	import PageHero from '#lib/components/PageHero.svelte';
	import HeroDomainCheck from '#lib/components/HeroDomainCheck.svelte';
	import ProductViews from '#lib/components/ProductViews.svelte';
	import Faq from '#lib/components/Faq.svelte';
	import { home, principles, comingSoon, faq } from '#lib/content/copy.js';
	import { OPEN_SOURCE, OPEN_SOURCE_THANKS } from '#lib/content/catalog.js';
	import { LAUNCHED, ACCOUNT_URL } from '#lib/launch.js';
	import { SUITE_LINE } from '#lib/availability.js';

	// STAR-166 hero pool: +page.server.ts picks an id per load; PageHero renders it.
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

<!-- 1 · Hero: what this is, who it is for, and the next action -->
<PageHero pick={data.hero} eyebrow={home.hero.eyebrow} h1={home.hero.h1} lede={home.hero.sub} wordmark>
	{#snippet extra()}<HeroDomainCheck />{/snippet}
	<a class="btn btn-primary" data-testid="cta-primary" href={home.hero.ctaPrimary.href}>
		{home.hero.ctaPrimary.label}
	</a>
	<a class="btn btn-secondary" data-testid="cta-secondary" href={home.hero.ctaSecondary.href}>
		{home.hero.ctaSecondary.label}
	</a>
</PageHero>

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

<!-- 3 · Products (STAR-299): one list, two views, the visitor chooses. The id stays
     "services" so every existing /#services link still lands here. -->
<section id="services" class="section section-divided">
	<p class="eyebrow">{home.work.eyebrow}</p>
	<Heading {...home.work.h2} />
	<p class="lede">{home.work.sub}</p>
	<ProductViews />
	{#if LAUNCHED}
		<p class="suite-line" data-testid="suite-line" data-price>
			<a href={`${ACCOUNT_URL}/account/subscriptions`} rel="noopener">{SUITE_LINE}.</a>
		</p>
	{/if}
	<div class="btn-row">
		<a class="btn btn-secondary" href={home.work.pricing.href}>{home.work.pricing.label} →</a>
		<a class="btn btn-secondary" href={home.work.products.href}>{home.work.products.label} →</a>
	</div>
</section>

<!-- 3b · Open source (STAR-299): its own section, outside both views and outside every
     audience. No audience tags, no price, no button, no Patreon link: a showcase, not an ask. -->
<section id="open-source" class="section section-divided">
	<p class="eyebrow">{home.openSource.eyebrow}</p>
	<Heading {...home.openSource.h2} />
	<p class="lede">{home.openSource.sub}</p>
	<div class="grid-2 os-grid">
		{#each OPEN_SOURCE as p (p.id)}
			<article class="card reveal" data-open-source={p.id}>
				<h3>{p.name}</h3>
				<p>{p.what}</p>
				<p class="os-state">{p.state}</p>
				<p>{p.source}</p>
			</article>
		{/each}
	</div>
	<p class="os-thanks">{OPEN_SOURCE_THANKS}</p>
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
		<p><a href={home.operator.link.href}>{home.operator.link.label} →</a></p>
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
	.suite-line {
		margin: var(--sp-5) 0 0;
		color: var(--text-muted);
	}
	/* ── open source cards ── */
	.os-grid {
		margin-top: var(--sp-5);
	}
	.os-state {
		color: var(--text);
		font-weight: 600;
	}
	.os-thanks {
		margin: var(--sp-5) 0 0;
		color: var(--text-muted);
		max-width: var(--measure);
	}
</style>
