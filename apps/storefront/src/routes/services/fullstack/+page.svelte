<script lang="ts">
	import IntakeForm from '$lib/components/IntakeForm.svelte';
</script>

<svelte:head>
	<title>Full Stack Solutions · Starhold Software</title>
	<meta
		name="description"
		content="Whole applications for small businesses — assembled from proven open-source components, built and operated by Kyle Green."
	/>
</svelte:head>

<section class="section">
	<p class="eyebrow">Quoted services</p>
	<h1>Full Stack Solutions</h1>
	<div class="prose">
		<p class="lede">
			Small-business software that does the job of a multi-thousand-dollar platform, without that
			invoice.
		</p>
		<p>
			I assemble proven open-source components and the automation and infrastructure around them into
			one system, scoped to how your business actually runs. Often it is the same underlying software
			the large suites are built on — the difference is the licence and the invoice, not the engine.
		</p>
		<p>
			I test every path end to end myself before it ships. I use AI-assisted coding to stay current
			with the latest documentation and practice around security, usability, and logical flow, but a
			person signs off on the whole path. The machine helps write it; I am the one who is accountable
			for it.
		</p>
		<p>
			Whole applications and games live here — something on the scale of Shushgame, rather than a
			$5 bot. If what you need is a script on a schedule, that is
			<a href="/services/automation">Server and task automation</a> instead.
		</p>
	</div>
	<IntakeForm kind="fullstack" cta="Request a quote" />
</section>
