<script lang="ts">
	import { ENGAGEMENT_RULES } from '$lib/content/managed-ops';
	import { RATES, usd } from '$lib/content/rates';
	import { BILLING_TERMS } from '$lib/content/hangar-hosting';
	import { SERVICES_TERMS_APPROVED } from '$lib/site-links';

	// Rule copy lives once, in the content module; look each up by id.
	const rule = (id: string) => ENGAGEMENT_RULES.find((r) => r.id === id)?.text ?? '';
</script>

<svelte:head>
	<title>Services Terms · Starhold Software</title>
	{#if !SERVICES_TERMS_APPROVED}
		<meta name="robots" content="noindex" />
	{/if}
</svelte:head>

<section class="section legal">
	<div class="label">Effective 22 October 2026</div>
	<h1>Services Terms</h1>

	<h2>1. Applicability</h2>
	<p>These Services Terms apply to the <strong>Managed Ops</strong> and <strong>Hangar hosting</strong> monthly subscriptions and to <strong>hourly work</strong> provided by Copper Jerky LLC, an Arizona limited liability company doing business as Starhold Software ("Starhold", "we", "us"). The <a href="/legal/terms">Terms of Service</a> and <a href="/legal/privacy">Privacy Policy</a> still apply. Where they conflict with these Services Terms, these Services Terms control for the services described here.</p>

	<h2>2. Intake and access</h2>
	<p>{rule('intake')}</p>

	<h2>3. Customer-gated deployments</h2>
	<p>{rule('gated-deploy')}</p>

	<h2>4. Liability</h2>
	<p>{rule('liability')}</p>
	<!-- OPERATOR REVIEW: the rule above now reads "anything Starhold builds" (was "I build") so the obligation binds the LLC; the same text shows on the Managed Ops marketing page. -->
	<p>The customer remains responsible for every deployment the customer gates. The disclaimers in section 11 and the limitation of liability in section 12 of the <a href="/legal/terms">Terms of Service</a> apply to these services, including the liability cap.</p>

	<h2>5. Scope: no database work</h2>
	<p>{rule('no-databases')}</p>
	<p><strong>Backup verification</strong>, as included in Managed Ops, means confirming that backup jobs ran and that restore points exist. It never includes opening, querying, or restoring database contents. Put plainly: <strong>Starhold does not access databases.</strong></p>

	<h2>6. Response times</h2>
	<p>{rule('sla')}</p>

	<h2>7. Billing</h2>
	<p>Managed Ops is {usd(RATES.managedOpsServerMonthlyUsd)} per server per month, billed monthly through <strong>Stripe</strong> as a subscription set up by Starhold for each engagement. Hourly work is invoiced at the published rates: {usd(RATES.personalHourlyUsd)}/hr for personal work and {usd(RATES.businessHourlyUsd)}/hr for business work, including small business. See <a href="/rates">Rates</a>. {BILLING_TERMS} Hangar hosting is {usd(RATES.hangarHostingAppMonthlyUsd)} per app per month. Cancellation and refunds follow the <a href="/legal/terms">Terms of Service</a> and <a href="/legal/refunds">Refund Policy</a>.</p>

	<h2>8. Contact</h2>
	<p>Copper Jerky LLC, doing business as Starhold Software — <a href="mailto:hello@starhold.dev">hello@starhold.dev</a>.</p>

	<p class="label">
		Last updated 22 October 2026.{#if !SERVICES_TERMS_APPROVED} Draft wording pending operator review; not legal advice.{/if}
	</p>
</section>
