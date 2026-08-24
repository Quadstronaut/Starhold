<script lang="ts">
	import IntakeForm from '$lib/components/IntakeForm.svelte';
	import { automation, capabilities } from '$lib/content/copy';

	const spec = capabilities.items.find((c) => c.id === 'automation')!;
</script>

<svelte:head>
	<title>{automation.title}</title>
	<meta name="description" content={automation.description} />
</svelte:head>

<section class="section">
	<p class="eyebrow">{automation.eyebrow}</p>
	<h1>{automation.h1}</h1>
	<p class="lede">{automation.lede}</p>
	<div class="prose">
		{#each automation.body as para (para)}
			<p>{para}</p>
		{/each}
	</div>
</section>

<section class="section section-divided">
	<h2>What you get</h2>
	<ul class="prose">
		{#each spec.deliverables as d (d)}
			<li>{d}</li>
		{/each}
	</ul>
</section>

<section class="section section-divided">
	<h2>{automation.formHeading}</h2>
	<p class="lede">{spec.start}</p>
	<IntakeForm kind="quote" cta="Request a quote" />
</section>
