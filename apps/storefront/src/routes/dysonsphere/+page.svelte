<script lang="ts">
	import DysonsphereForm from '#lib/components/DysonsphereForm.svelte';
	import { labelFor } from '#lib/labels.js';
	import { formNotices } from '#lib/content/copy.js';
</script>

<svelte:head>
	<title>DysonSphere · Starhold</title>
	<meta name="description" content={formNotices.dysonsphere.line} />
</svelte:head>

<section class="section">
	<p class="eyebrow verbatim">{labelFor('dysonsphere')}</p>
	<h1>DysonSphere</h1>
	<p class="lede">{formNotices.dysonsphere.line}</p>
</section>

<section class="section section-divided">
	<h2>{formNotices.dysonsphere.heading}</h2>
	<DysonsphereForm />
</section>
