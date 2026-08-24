<script lang="ts">
	import IntakeForm from '$lib/components/IntakeForm.svelte';
</script>

<svelte:head>
	<title>Server and Task Automation · Starhold Software</title>
	<meta
		name="description"
		content="Python, PowerShell, and Bash automation for servers and recurring work — scoped and quoted per job by Kyle Green."
	/>
</svelte:head>

<section class="section">
	<p class="eyebrow">Quoted services</p>
	<h1>Server and task automation</h1>
	<div class="prose">
		<p class="lede">The manual step, removed — and told to say so when it fails.</p>
		<p>
			Python, PowerShell, and Bash for servers and recurring work: scheduled jobs, data pipelines,
			monitoring glue, deployments, and the ops chores nobody wants to own. Scoped and quoted per
			job, so there are no surprises on the invoice.
		</p>
		<p>
			I test every automation end to end myself before it ships. I use AI-assisted coding to stay
			current with the latest documentation and practice around security, usability, and logical
			flow, but a person signs off on the whole path. The machine helps write it; I am the one who is
			accountable for it.
		</p>
		<p>
			Need a whole application rather than a script? That is
			<a href="/services/fullstack">Full Stack Solutions</a>.
		</p>
	</div>
	<IntakeForm kind="quote" cta="Request a quote" />
</section>
