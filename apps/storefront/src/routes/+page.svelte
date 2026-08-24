<script lang="ts">
	import { home, capabilities, work, principles, operator, site } from '$lib/content/copy';
</script>

<svelte:head>
	<title>{home.title}</title>
	<meta name="description" content={home.description} />
</svelte:head>

<!-- 2 · Hero — service, person, next action, without scrolling -->
<section class="hero">
	<div class="hero-inner">
		<p class="eyebrow">{home.hero.eyebrow}</p>
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
</section>

<!-- 3 · Proof strip — checkable before the pitch -->
<section class="section section-tight" aria-label={home.proofHeading}>
	<p class="eyebrow">{home.proofHeading}</p>
	<ul class="proof">
		{#each home.proof as p (p.href)}
			<li>
				<a href={p.href} rel="noopener" data-evidence={p.evidence}>
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
	<h2>{home.capabilities.h2}</h2>
	<p class="lede">{home.capabilities.sub}</p>
	<div class="grid-2">
		{#each capabilities.items as c (c.id)}
			<a class="card" href={c.href}>
				<h3>{c.name}</h3>
				<p>{c.summary}</p>
			</a>
		{/each}
	</div>
	<div class="btn-row">
		<a class="btn btn-ghost" href="/capabilities">Scope, deliverables, and how to start →</a>
	</div>
</section>

<!-- 5 · Selected work — the products appear as proof, not as a shop shelf -->
<section id="fleet" class="section section-divided">
	<p class="eyebrow">{home.work.eyebrow}</p>
	<h2>{home.work.h2}</h2>
	<p class="lede">{home.work.sub}</p>
	<div class="grid-2">
		{#each work.items as w (w.id)}
			<a class="card" href={w.href} rel="noopener" data-evidence={w.evidence}>
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
	<h2>{home.principles.h2}</h2>
	<p class="lede">{home.principles.sub}</p>
	<ul class="ev-list principles">
		{#each principles as p (p.title)}
			<li data-evidence={p.evidence}>
				<strong>{p.title}</strong>
				{p.detail}
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
		<ul class="ev-list">
			{#each operator.certs as c (c.text)}
				<li data-evidence={c.evidence}>{c.text}</li>
			{/each}
			<li data-evidence={operator.dayJob.evidence}>{operator.dayJob.text}</li>
		</ul>
	</div>
	<div class="btn-row">
		<a class="btn btn-ghost" href={home.operator.cta.href}>{home.operator.cta.label} →</a>
	</div>
</section>

<!-- 8 · Contact band -->
<section id="start" class="section section-divided">
	<p class="eyebrow">{home.contact.eyebrow}</p>
	<h2>{home.contact.h2}</h2>
	<p class="lede">{home.contact.body}</p>
	<div class="btn-row">
		<a class="btn btn-primary" href={home.contact.cta.href}>{home.contact.cta.label}</a>
		<a class="btn btn-secondary" href={'mailto:' + site.email}>{site.email}</a>
	</div>
</section>

<style>
	.hero {
		background: radial-gradient(ellipse at 20% -10%, var(--bg-raised) 0%, var(--bg) 65%);
		border-bottom: 1px solid var(--border);
	}
	.hero-inner {
		max-width: var(--page);
		margin: 0 auto;
		padding: var(--sp-7) var(--sp-5) var(--sp-6);
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
</style>
