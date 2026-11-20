<script lang="ts">
	import { markdownToHtml } from '#lib/peridot/markdown.js';
	import source from '#lib/peridot/terms.md?raw';
	// Trusted: the Markdown is a committed file, escaped by markdownToHtml, never user input.
	const html = markdownToHtml(source);
</script>

<svelte:head>
	<title>Peridot terms of use</title>
</svelte:head>

<!-- PERI-10: static page for Google Play and the Google sign-in consent screen. No script, form, cookie or external request. Not linked from the site nav. -->
<section class="section legal">
	{@html html}
	<nav aria-label="Peridot pages"><a href="/peridot">About Peridot</a> · <a href="/peridot/privacy">Peridot privacy policy</a> · <a href="/peridot/delete">Delete your Peridot data</a></nav>
</section>
