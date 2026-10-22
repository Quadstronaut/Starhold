<script lang="ts">
	import { RATES, usd } from '$lib/content/rates';
	import { SUMMARY, INCLUDED, NOT_INCLUDED, ONBOARDING } from '$lib/content/hangar-hosting';
	import { SERVICES_TERMS_APPROVED } from '$lib/site-links';
</script>

<svelte:head>
	<title>Hangar hosting · Starhold Software</title>
	<meta
		name="description"
		content="Flat-price hosting for containerized apps, static sites and bots, run on Starhold's own servers."
	/>
</svelte:head>

<section class="section">
	<p class="eyebrow">Hangar hosting</p>
	<h1>Hangar hosting</h1>
	<div class="prose">
		<p class="lede">
			{usd(RATES.hangarHostingAppMonthlyUsd)}/app/month, flat, nothing metered. I invoice monthly,
			and you can cancel any time under the <a href="/legal/refunds">Refund Policy</a>.
		</p>
		<p>{SUMMARY}</p>

		<h2>What is included</h2>
		<ul>
			{#each INCLUDED as item}
				<li>{item}</li>
			{/each}
		</ul>

		<h2>What is not</h2>
		<ul>
			{#each NOT_INCLUDED as item}
				<li>{item}</li>
			{/each}
		</ul>
		<p>
			Want upkeep for a server you own instead? See <a href="/services/managed-ops">Managed Ops</a>.
		</p>

		<h2>How onboarding works</h2>
		<ol>
			{#each ONBOARDING as step}
				<li>{step}</li>
			{/each}
		</ol>
		{#if SERVICES_TERMS_APPROVED}
			<p>The full wording is in the <a href="/legal/services">engagement terms</a>.</p>
		{/if}

		<p><a class="btn" href="/contact?intent=hosting">Request Hangar hosting</a></p>
	</div>
</section>