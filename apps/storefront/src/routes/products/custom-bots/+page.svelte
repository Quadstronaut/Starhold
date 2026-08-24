<script lang="ts">
	import BotConfigurator from '$lib/components/BotConfigurator.svelte';
	import { customBots } from '$lib/content/copy';

	let { data } = $props();
</script>

<svelte:head>
	<title>{customBots.title}</title>
	<meta name="description" content={customBots.description} />
</svelte:head>

<section class="section">
	<p class="eyebrow">{customBots.eyebrow}</p>
	<h1>{customBots.h1}</h1>
	<p class="lede">{customBots.lede}</p>
	<p class="price"><strong>${data.monthlyUsd}/month</strong>, flat, cancel whenever.</p>
	<div class="prose">
		{#each customBots.body as para (para)}
			<p>{para}</p>
		{/each}
	</div>
</section>

<section class="section section-divided">
	<h2>{customBots.provesHeading}</h2>
	<p class="prose proves" data-evidence={customBots.proves.evidence}>{customBots.proves.text}</p>
</section>

<section class="section section-divided">
	<h2>{customBots.configureHeading}</h2>
	<BotConfigurator monthlyUsd={data.monthlyUsd} />
</section>

<style>
	.price {
		font-size: var(--fs-4);
		color: var(--text);
	}
	.proves {
		color: var(--text-muted);
	}
</style>
