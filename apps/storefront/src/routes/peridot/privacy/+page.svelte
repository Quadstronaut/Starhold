<script lang="ts">
	import { markdownToHtml } from '#lib/peridot/markdown.js';
	import source from '#lib/peridot/privacy.md?raw';
	// Trusted: the Markdown is a committed file, escaped by markdownToHtml, never user input.
	const html = markdownToHtml(source);
</script>

<svelte:head>
	<title>Peridot privacy policy</title>
</svelte:head>

<!-- PERI-10: static page for Google Play. No script, form, cookie or external request. Not linked from the site nav. -->
<section class="section legal">
	{@html html}
	<nav aria-label="Peridot pages"><a href="/peridot/delete">Delete your Peridot data</a></nav>
</section>
