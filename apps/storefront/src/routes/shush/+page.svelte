<script lang="ts">
	import { shush } from '$lib/content/copy';
</script>

<svelte:head>
	<title>{shush.title}</title>
	<meta name="description" content={shush.description} />
</svelte:head>

<!-- No cross-links to other Starhold products on this page (brief unasked item 9). -->
<section class="section" data-evidence={shush.evidence}>
	<p class="eyebrow verbatim">{shush.eyebrow}</p>
	<h1>{shush.h1}</h1>
	<p class="lede">{shush.lede}</p>
	<div class="prose">
		{#each shush.body as para (para)}
			<p>{para}</p>
		{/each}
	</div>
	<div class="btn-row">
		<a class="btn btn-primary" href={shush.cta.href} rel="noopener">{shush.cta.label}</a>
	</div>
</section>

<section class="section section-divided">
	<h2>{shush.privacyHeading}</h2>
	<div class="prose">
		{#each shush.privacy as para (para)}
			<p>{para}</p>
		{/each}
	</div>
</section>
