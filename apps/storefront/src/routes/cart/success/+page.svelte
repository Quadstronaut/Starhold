<script lang="ts">
	import { onMount } from 'svelte';
	import { cart } from '$lib/cart.svelte';

	// the order is with Stripe now — clear the local cart
	onMount(() => cart.clear());
</script>

<svelte:head><title>Order received · Starhold Software</title></svelte:head>

<section class="section">
	<p class="eyebrow">Payment received</p>
	<h1>Order received</h1>
	<p class="lede">
		Your build sheet reached me. I will assemble and deploy the bot, and I will email you at your
		checkout address — usually within a day.
	</p>
	<div class="btn-row">
		<a class="btn btn-secondary" href="/">Home</a>
		<a class="btn btn-ghost" href="/contact">Ask me something</a>
	</div>
</section>
