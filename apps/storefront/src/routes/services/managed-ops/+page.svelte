<script lang="ts">
	import { RATES, usd } from '$lib/content/rates';
	import { INCLUDED, ENGAGEMENT_RULES } from '$lib/content/managed-ops';
	import { SERVICES_TERMS_APPROVED } from '$lib/site-links';
</script>

<svelte:head>
	<title>Managed Ops · Starhold Software</title>
	<meta
		name="description"
		content="Ongoing server upkeep at a flat monthly price per server: rescans, update and backup checks, and a monthly report."
	/>
</svelte:head>

<section class="section">
	<p class="eyebrow">Managed Ops</p>
	<h1>Managed Ops</h1>
	<div class="prose">
		<p class="lede">
			{usd(RATES.managedOpsServerMonthlyUsd)} per server, per month. I invoice monthly, and you can cancel any
			time under the <a href="/legal/refunds">Refund Policy</a>.
		</p>

		<h2>What is included</h2>
		<ul>
			{#each INCLUDED as item}
				<li>{item}</li>
			{/each}
		</ul>

		<h2>Engagement rules</h2>
		<ol>
			{#each ENGAGEMENT_RULES as rule (rule.id)}
				<li>{rule.text}</li>
			{/each}
		</ol>
		{#if SERVICES_TERMS_APPROVED}
			<p>The full wording is in the <a href="/legal/services">engagement terms</a>.</p>
		{/if}

		<h2>Hands-on work is separate</h2>
		<p>
			Work beyond the monthly scope is billed hourly. See the <a href="/rates">rates</a>.
		</p>

		<p><a class="btn" href="/contact?intent=quote">Request Managed Ops</a></p>
	</div>
</section>
