<script lang="ts">
	import { operator, site } from '$lib/content/copy';
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
	<h2>{operator.certsHeading}</h2>
	<ul class="ev-list">
		{#each operator.certs as c (c.text)}
			<li data-evidence={c.evidence}>{c.text}</li>
		{/each}
	</ul>

	<h3 class="subhead">{operator.dayJobHeading}</h3>
	<p class="prose day" data-evidence={operator.dayJob.evidence}>{operator.dayJob.text}</p>
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
	<ul class="links">
		<li>
			<a
				href={operator.profileLink.href}
				rel="noopener"
				data-evidence={operator.profileLink.evidence}>{operator.profileLink.label}</a
			>
		</li>
		<li><a href={'mailto:' + site.email}>{site.email}</a></li>
	</ul>
	<div class="btn-row">
		<a class="btn btn-primary" href={operator.cta.href}>{operator.cta.label}</a>
		<a class="btn btn-secondary" href="/work">See the work</a>
	</div>
</section>

<style>
	.subhead {
		margin-top: var(--sp-7);
	}
	.day {
		color: var(--text-muted);
		margin-top: var(--sp-3);
	}
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
