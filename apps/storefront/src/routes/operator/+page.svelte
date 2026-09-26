<script lang="ts">
	import { operator, site } from '$lib/content/copy';
	import { DISCORD_INVITE } from '$lib/site-links';

	// Resolved once at render: Discord is in the list only while an invite exists.
	const links = operator.links(DISCORD_INVITE);
</script>

<svelte:head>
	<title>{operator.title}</title>
	<meta name="description" content={operator.description} />
</svelte:head>

<section class="section">
	<p class="eyebrow">{operator.eyebrow}</p>
	<h1>{operator.h1}</h1>
	<p class="lede">{operator.lede}</p>
	<div class="prose">
		{#each operator.bio as para (para)}
			<p>{para}</p>
		{/each}
	</div>
</section>

<section class="section section-divided">
	<h2>{operator.howHeading}</h2>
	<ol class="how">
		{#each operator.how as step (step)}
			<li>{step}</li>
		{/each}
	</ol>
</section>

<section class="section section-divided">
	<h2>{operator.linkHeading}</h2>
	<!-- No data-evidence on these: they are places to find me, not claims a
	     reader could verify, so the anti-fabrication suite has nothing to check. -->
	<ul class="links">
		{#each links as link (link.href)}
			<li><a href={link.href} rel="noopener">{link.label}</a></li>
		{/each}
		<li><a href={'mailto:' + site.email}>{site.email}</a></li>
	</ul>
	<div class="btn-row">
		<a class="btn btn-primary" href={operator.cta.href}>{operator.cta.label}</a>
		<a class="btn btn-secondary" href="/work">See the work</a>
	</div>
</section>

<style>
	.how {
		max-width: var(--measure);
		color: var(--text-muted);
	}
	.links {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--sp-2);
	}
	.links li {
		margin: 0;
	}
</style>
