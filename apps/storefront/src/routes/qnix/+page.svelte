<script lang="ts">
	import QnixForm from '$lib/components/QnixForm.svelte';
	import { labelFor } from '$lib/labels';
	import { formNotices } from '$lib/content/copy';
</script>

<svelte:head>
	<title>QNix · Starhold</title>
	<meta name="description" content={formNotices.qnix.line} />
</svelte:head>

<section class="section">
	<p class="eyebrow verbatim">{labelFor('qnix')}</p>
	<h1>QNix</h1>
	<p class="lede">{formNotices.qnix.line}</p>
</section>

<section class="section section-divided">
	<h2>{formNotices.qnix.heading}</h2>
	<QnixForm />
</section>
