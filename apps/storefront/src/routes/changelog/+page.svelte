<script lang="ts">
	import PageHero from '#lib/components/PageHero.svelte';
	import { CHANGELOG, entryId } from '#lib/content/changelog.js';

	// STAR-310: what shipped, newest first, for customers. The list lives in lib/content/changelog.ts;
	// the RSS feed at /changelog/rss.xml is built from the same list. No script: plain HTML.
	let { data } = $props();
	const external = (href: string) => !href.startsWith('/');
	const day = (d: string) =>
		new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
</script>

<svelte:head>
	<title>Changelog · Starhold</title>
	<meta name="description" content="What I shipped across Starhold, newest first, with an RSS feed." />
	<link rel="alternate" type="application/rss+xml" title="Starhold changelog" href="https://starhold.dev/changelog/rss.xml" />
</svelte:head>

<PageHero
	pick={data.hero}
	eyebrow="Changelog"
	h1="What I shipped."
	lede="Changes you can see in Starhold products, newest first. Dates are in UTC."
>
	<a class="btn btn-secondary" href="/changelog/rss.xml">RSS feed</a>
</PageHero>

<section class="section">
	<ol class="log" data-testid="changelog">
		{#each CHANGELOG as e (entryId(e))}
			<li id={entryId(e)} class="card">
				<p class="meta">
					<time datetime={e.date}>{day(e.date)}</time>
					<span class="tag">{e.product}</span>
				</p>
				<h2>{e.title}</h2>
				<p>{e.body}</p>
				{#if e.link}
					<p><a href={e.link.href} rel={external(e.link.href) ? 'noopener' : undefined}>{e.link.label} →</a></p>
				{/if}
			</li>
		{/each}
	</ol>
</section>

<style>
	.log {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-4);
		max-width: var(--measure);
	}
	.log li {
		margin: 0;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-3);
		margin: 0 0 var(--sp-2);
		color: var(--text-muted);
		font-family: var(--font-mono);
		font-size: var(--fs-1);
	}
	.log h2 {
		font-size: var(--fs-4);
		margin: 0 0 var(--sp-2);
	}
	.log p:last-child {
		margin-bottom: 0;
	}
</style>
