<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	let { children } = $props();
</script>

<svelte:head>
	<!-- STAR-166 mark set (brand/mark/): M2 held star at 16 px, the operator's PNG from 32 px up. -->
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="16x16" />
	<link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
	<link rel="icon" href="/favicon-48.png" type="image/png" sizes="48x48" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
</svelte:head>

{#if page.error}
	<!-- STAR-168: error pages are the shared Starhold set and bring their own main + footer -->
	<div class="err-shell">{@render children()}</div>
{:else}
	<Header />
	<!-- every page renders `main > section` children; the acceptance suite scopes
	     its structural assertions to exactly that shape -->
	<main>{@render children()}</main>
	<Footer />
{/if}

<style>
	.err-shell {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
</style>
