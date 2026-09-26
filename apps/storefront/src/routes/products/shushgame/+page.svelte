<script lang="ts">
	import { shushgame } from '$lib/content/copy';
</script>

<svelte:head>
	<title>{shushgame.title}</title>
	<meta name="description" content={shushgame.description} />
</svelte:head>

<section class="section">
	<p class="eyebrow">{shushgame.eyebrow}</p>
	<h1>{shushgame.h1}</h1>
	<p class="lede">{shushgame.lede}</p>
	<div class="prose">
		{#each shushgame.body as para (para)}
			<p>{para}</p>
		{/each}
	</div>
	<div class="btn-row">
		<a class="btn btn-primary" href={shushgame.visitHref} rel="noopener">{shushgame.visitLabel}</a>
	</div>
</section>

<section class="section section-divided">
	<h2>{shushgame.provesHeading}</h2>
	<p class="prose proves" data-evidence={shushgame.proves.evidence}>{shushgame.proves.text}</p>
	<div class="btn-row">
		<a class="btn btn-ghost" href="/work">The rest of the work →</a>
		<a class="btn btn-ghost" href="/contact?intent=quote">Request a quote</a>
	</div>
</section>

<style>
	.proves {
		color: var(--text-muted);
	}
</style>
