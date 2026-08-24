<script lang="ts">
	import { cart } from '$lib/cart.svelte';
	import { BOT_FEATURES } from '$lib/bot-features';

	let { data } = $props();

	const featureName = new Map(BOT_FEATURES.map((f) => [f.id, f.name]));
	let busy = $state(false);
	let errorMsg = $state('');
	const total = $derived(cart.count * data.monthlyUsd);

	async function checkout() {
		busy = true;
		errorMsg = '';
		try {
			const res = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ bots: cart.items })
			});
			const body = await res.json().catch(() => null);
			if (!res.ok || !body?.url) throw new Error(body?.message ?? 'checkout failed — try again');
			window.location.href = body.url; // hand off to Stripe Checkout
		} catch (e) {
			errorMsg = e instanceof Error ? e.message : 'checkout failed — try again';
			busy = false;
		}
	}
</script>

<svelte:head><title>Cart · Starhold Software</title></svelte:head>

<section class="section">
	<p class="eyebrow">Your order</p>
	<h1>Cart</h1>
	{#if cart.count === 0}
		<p class="lede">Nothing in the cart yet. <a href="/products/custom-bots">Build a bot →</a></p>
	{:else}
		{#each cart.items as bot, i (i)}
			<div class="card item">
				<strong>Bot {i + 1}{bot.server ? ` — ${bot.server}` : ''}</strong>
				<p>{bot.features.map((f) => featureName.get(f) ?? f).join(', ')}</p>
				<button class="btn btn-ghost remove" disabled={busy} onclick={() => cart.remove(i)}>
					Remove
				</button>
			</div>
		{/each}
		<p class="total">
			<strong>${total}/month</strong> — billed monthly via Stripe. Cancel anytime; see
			<a href="/legal/refunds">refunds &amp; cancellation</a> and <a href="/legal/terms">terms</a>.
		</p>
		<!-- literal text, not an expression: the wording is part of the contract
		     and the acceptance suite reads it straight out of the template -->
		<button class="btn btn-primary" disabled={busy} onclick={checkout}>
			{#if busy}Starting checkout…{:else}Continue to payment{/if}
		</button>
		{#if errorMsg}<p class="err">{errorMsg} — <a href="/contact">email us</a> if it persists.</p>{/if}
	{/if}
</section>

<style>
	.item {
		margin: var(--sp-3) 0;
		display: grid;
		gap: var(--sp-2);
		justify-items: start;
		max-width: 560px;
	}
	.item p {
		margin: 0;
		color: var(--text-muted);
		font-size: var(--fs-1);
	}
	.remove {
		font-size: var(--fs-0);
		padding: var(--sp-1) var(--sp-3);
	}
	.total {
		margin-top: var(--sp-5);
		max-width: var(--measure);
	}
</style>
