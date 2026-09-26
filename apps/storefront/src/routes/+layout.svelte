<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
</svelte:head>

<Header />
<!-- every page renders `main > section` children; the acceptance suite scopes
     its structural assertions to exactly that shape -->
<main>{@render children()}</main>
<Footer />
