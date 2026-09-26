<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>QFlix</title>
	<meta name="description" content="No ads. No price hikes. No selling your data. Ever." />

	<!-- This page travels by one person texting the link to the person beside
	     them. Without these it arrives as a naked URL with no title or promise. -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="QFlix — no ads, no price hikes, ever" />
	<meta
		property="og:description"
		content="Not a catalog. A request line. If it exists, you ask and it appears."
	/>
	<meta property="og:url" content="https://qflix.starhold.dev/" />
	<meta name="twitter:card" content="summary" />
	<meta name="theme-color" content="#0a1628" />
</svelte:head>

{@render children()}
