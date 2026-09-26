<script lang="ts">
	import BotConfigurator from '$lib/components/BotConfigurator.svelte';

	let { data } = $props();
</script>

<svelte:head><title>Discord Bots · Starhold Software</title></svelte:head>

<section class="section">
	<p class="eyebrow">${data.monthlyUsd}/mo per bot · +${data.opsPackUsd}/mo Ops Pack · hosting included</p>
	<h1>Discord Bots</h1>
	<p class="lede">Discord, run like business software. Your team and community already live there — I make it your moderation desk, monitoring dashboard, automation runner, and event engine. One bot, under <strong>your server's own name and avatar</strong>, personally operated and hosted. Already running a server of <strong>18,000 users</strong>.</p>

	<p>Two flat prices, nothing metered. <strong>${data.monthlyUsd}/mo</strong> per bot covers the full Community and Automation feature set — the big-bot capabilities that usually cost more, here bespoke and to-order. A <strong>${data.opsPackUsd}/mo Ops Pack</strong> adds server, application, and scheduled-scraping monitoring (${data.monthlyUsd + data.opsPackUsd}/mo all-in). At that price an ops bot out-values a monitoring host, a scraper, and an automation plan <em>combined</em> — bundled, under your brand.</p>

	<p>Feature requests join the shared public roadmap: built once, every bot in the fleet gets them. Your request becomes everyone's feature. Need a whole app or a game rather than a bot? That's <a href="/services/fullstack">Full Stack Solutions</a>.</p>

	<BotConfigurator monthlyUsd={data.monthlyUsd} opsPackUsd={data.opsPackUsd} pipelineMode={data.pipelineMode} />
</section>

<style>
	.lede { font-size: 16px; }
</style>
