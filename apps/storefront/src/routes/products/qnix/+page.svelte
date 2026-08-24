<script lang="ts">
	import IntakeForm from '$lib/components/IntakeForm.svelte';
	import { qnix, capabilities } from '$lib/content/copy';

	const spec = capabilities.items.find((c) => c.id === 'platform')!;
</script>

<svelte:head>
	<title>{qnix.title}</title>
	<meta name="description" content={qnix.description} />
</svelte:head>

<section class="section">
	<p class="eyebrow">{qnix.eyebrow}</p>
	<h1>{qnix.h1}</h1>
	<p class="lede">{qnix.lede}</p>
	<div class="prose">
		{#each qnix.body as para (para)}
			<p>{para}</p>
		{/each}
	</div>
	<div class="btn-row">
		<a class="btn btn-secondary" href={qnix.docsHref} rel="noopener">{qnix.docsLabel}</a>
	</div>
</section>

<section class="section section-divided">
	<h2>{qnix.provesHeading}</h2>
	<p class="prose proves" data-evidence={qnix.proves.evidence}>{qnix.proves.text}</p>
</section>

<section class="section section-divided">
	<h2>What hosting from me includes</h2>
	<ul class="prose">
		{#each spec.deliverables as d (d)}
			<li>{d}</li>
		{/each}
	</ul>
</section>

<section class="section section-divided">
	<h2>{qnix.formHeading}</h2>
	<IntakeForm kind="qnix" cta="Register interest" />
</section>

<style>
	.proves {
		color: var(--text-muted);
	}
</style>
