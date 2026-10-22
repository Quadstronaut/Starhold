<script lang="ts">
	import { RATES, usd } from '$lib/content/rates';
	import { ENGAGEMENT_RULES } from '$lib/content/managed-ops';
	import { SERVICES_TERMS_APPROVED } from '$lib/site-links';
</script>

<svelte:head>
	<title>Rates · Starhold Software</title>
	<meta
		name="description"
		content="Hourly rates for server and systems work: personal and business, with one rule separating them."
	/>
</svelte:head>

<section class="section">
	<p class="eyebrow">Rates</p>
	<h1>Hourly rates</h1>
	<div class="prose">
		<p class="lede">Two rates. The only difference is whether the work is for a business or for you personally.</p>
		<ul>
			<li>
				<strong>Private individuals: {usd(RATES.personalHourlyUsd)}/hr.</strong> For example, a Plex
				box at home.
			</li>
			<li>
				<strong>Any business, including small business: {usd(RATES.businessHourlyUsd)}/hr.</strong>
			</li>
		</ul>
		<p>
			Want ongoing upkeep instead of hourly work? See the
			<a href="/services/managed-ops">Managed Ops</a> monthly product, or
			<a href="/services/hosting">Hangar hosting</a> to have an app run for you.
		</p>

		<h2>How I work</h2>
		<ol>
			{#each ENGAGEMENT_RULES as rule (rule.id)}
				<li>{rule.text}</li>
			{/each}
		</ol>
		{#if SERVICES_TERMS_APPROVED}
			<p>The full wording is in the <a href="/legal/services">engagement terms</a>.</p>
		{/if}

		<p><a href="/contact?intent=quote">Request a quote</a></p>
	</div>
</section>
