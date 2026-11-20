<script lang="ts">
	import Heading from '#lib/components/Heading.svelte';
	import PageHero from '#lib/components/PageHero.svelte';
	import ProductCard from '#lib/components/ProductCard.svelte';
	import Packages from '#lib/components/Packages.svelte';
	import NotYet from '#lib/components/NotYet.svelte';
	import AccountCta from '#lib/components/AccountCta.svelte';
	import { audienceFor, PRICING } from '#lib/content/catalog.js';

	// STAR-299: the page for one audience, built from its entry in the one audience list.
	let { data } = $props();
	const a = $derived(audienceFor(data.audience)!);
</script>

<svelte:head>
	<title>{a.heading} · Starhold</title>
	<meta name="description" content={a.intro} />
</svelte:head>

<PageHero pick={data.hero} eyebrow={a.label} h1={a.heading} lede={a.intro}>
	<a class="btn btn-secondary" href="/#all-products">See everything we make</a>
</PageHero>

<section class="section" data-audience={a.id}>
	<div class="grid-2">
		{#each a.items as item (item.service)}
			<ProductCard {item} />
		{/each}
	</div>
</section>

<section id="sets" class="section section-divided">
	<p class="eyebrow">Sets</p>
	<Heading {...PRICING.packagesHeading} />
	<p class="lede">{PRICING.packagesSub}</p>
	<Packages packages={a.packages} />
	<div class="btn-row"><a class="btn btn-secondary" href="/pricing">See every price →</a></div>
</section>

{#if a.notYet}<NotYet />{/if}

<AccountCta />
