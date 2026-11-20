<script lang="ts">
	import Heading from '#lib/components/Heading.svelte';
	import PageHero from '#lib/components/PageHero.svelte';
	import { home, serviceItems } from '#lib/content/copy.js';
	import { PRODUCTS_PAGE } from '#lib/content/catalog.js';

	// STAR-299: the Products page (operator, 2026-11-20; first built as "How it runs", the
	// Hangar folded into this site). It leads with the products themselves, read from the one
	// product list in copy.ts: name, one plain line, status label, availability line and the
	// one action. No new facts and no prices typed here. Starbot follows its own switch, so
	// while it is closed it has no link. The evidence sits below as supporting sections.
	// Public facts only: this file is mirrored, so no machine names, addresses or internal detail.
	let { data } = $props();
	const external = (href: string) => !href.startsWith('/');
</script>

<svelte:head>
	<title>{PRODUCTS_PAGE.title}</title>
	<meta name="description" content={PRODUCTS_PAGE.description} />
</svelte:head>

<PageHero pick={data.hero} eyebrow={PRODUCTS_PAGE.eyebrow} h1={PRODUCTS_PAGE.h1} lede={PRODUCTS_PAGE.lede}>
	<a class="btn btn-primary" href="/pricing">See every price</a>
	<a class="btn btn-secondary" href="/#by-audience">Sort by who it’s for</a>
</PageHero>

<!-- The products themselves: what each is, one plain line, its status and its link. -->
<section id="products" class="section">
	<Heading {...PRODUCTS_PAGE.list} />
	<p class="lede">{PRODUCTS_PAGE.listSub}</p>
	<div class="list">
		{#each serviceItems as s (s.id)}
			<article class="card" data-product={s.id} data-evidence={s.evidence}>
				<div class="namerow">
					<h3>{s.name}</h3>
					<span class="tag">{s.status}</span>
				</div>
				<p class="what">{s.what}</p>
				<p class="availability" data-testid="availability">{s.availability}</p>
				{#if s.note}<p data-price>{s.note}</p>{/if}
				{#if s.href && !s.invite}
					<p class="action"><a href={s.href} rel={external(s.href) ? 'noopener' : undefined}>{s.action} →</a></p>
				{:else if s.disabled}
					<p class="action"><button type="button" disabled aria-disabled="true">{s.action}</button></p>
				{/if}
			</article>
		{/each}
	</div>
</section>

<!-- Supporting: what is running, and the address each product answers on. -->
<section id="running" class="section section-divided">
	<p class="eyebrow">Running</p>
	<Heading {...PRODUCTS_PAGE.running} />
	<p class="lede">{PRODUCTS_PAGE.runningSub}</p>
	<ul class="bays">
		{#each serviceItems as s (s.id)}
			<li data-product={s.id}>
				<span class="bay-name">{s.name}</span>
				<span class="tag">{s.status}</span>
				{#if s.host}<span class="host">{s.host}</span>{/if}
			</li>
		{/each}
	</ul>
</section>

<!-- Supporting: what the design does and does not promise. -->
<section id="where" class="section section-divided" data-evidence={home.fleet.evidence}>
	<p class="eyebrow">{home.fleet.eyebrow}</p>
	<h2>{home.fleet.h2}</h2>
	<div class="prose">
		<p>{home.fleet.body}</p>
		<p><a href={home.fleet.link.href} rel="noopener">{home.fleet.link.label} →</a></p>
	</div>
</section>

<!-- Supporting: the same three checkable items as the home page, and the test counts. -->
<section id="checks" class="section section-divided">
	<p class="eyebrow">{home.proofHeading}</p>
	<Heading {...PRODUCTS_PAGE.checks} />
	<p class="lede">{PRODUCTS_PAGE.checksSub}</p>
	<ul class="proof">
		{#each home.proof as p (p.href)}
			<li>
				<a href={p.href} rel={p.href.startsWith('/') ? undefined : 'noopener'} data-evidence={p.evidence}>
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

<!-- Supporting: who runs it. -->
<section id="who" class="section section-divided">
	<p class="eyebrow">{home.operator.eyebrow}</p>
	<h2>{home.operator.h2}</h2>
	<div class="prose">
		<p data-evidence="single-operator">{home.operator.lede}</p>
		<p><a href="/contact">Write to us →</a></p>
	</div>
</section>

<style>
	.list {
		margin-top: var(--sp-5);
		display: grid;
		gap: var(--sp-4);
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
	}
	.namerow {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-2) var(--sp-3);
		margin-bottom: var(--sp-2);
	}
	.namerow h3 {
		margin: 0;
	}
	.namerow .tag,
	.bays .tag {
		color: var(--text-muted);
	}
	.list .what {
		color: var(--text);
		font-size: var(--fs-2);
	}
	.availability {
		font-weight: 600;
	}
	.action a {
		font-weight: 600;
	}
	.bays {
		list-style: none;
		margin: var(--sp-4) 0 0;
		padding: 0;
		border-top: 1px solid var(--border);
		max-width: 820px;
	}
	.bays li {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-2) var(--sp-4);
		margin: 0;
		padding: var(--sp-3) 0;
		border-bottom: 1px solid var(--border);
	}
	.bay-name {
		font-weight: 600;
		min-width: 9em;
	}
	.host {
		margin-left: auto;
		font-family: var(--font-mono);
		font-size: var(--fs-0);
		color: var(--text-muted);
		overflow-wrap: anywhere;
	}
	.proof {
		margin-top: var(--sp-5);
	}
	.testline {
		margin-top: var(--sp-4);
		color: var(--text-muted);
		font-size: var(--fs-1);
		max-width: var(--measure);
	}
</style>
