<script lang="ts">
	import { cart } from '$lib/cart.svelte';
	import { BOT_FEATURES, OPS_FEATURES } from '$lib/bot-features';
	import { opsPackQty } from '$lib/build-sheet';

	let { data } = $props();

	const featureName = new Map(BOT_FEATURES.map((f) => [f.id, f.name]));
	let busy = $state(false);
	let errorMsg = $state('');
	// A bot carrying any ops feature pays the flat Ops Pack on top of the base.
	// This mirrors what /api/checkout bills server-side (it pushes a separate
	// STRIPE_PRICE_OPS_PACK line item), so the quoted total and the charge agree.
	const botHasOps = (features: string[]) => features.some((f) => OPS_FEATURES.has(f));
	const opsCount = $derived(opsPackQty(cart.items));
	const total = $derived(cart.count * data.monthlyUsd + opsCount * data.opsPackUsd);

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
				<p>
					{bot.features.map((f) => featureName.get(f) ?? f).join(', ')}
					{#if botHasOps(bot.features)}<span class="tag">Ops Pack</span>{/if}
				</p>
				<button class="btn btn-ghost remove" disabled={busy} onclick={() => cart.remove(i)}>
					Remove
				</button>
			</div>
		{/each}
		<p class="total">
			<strong>${total}/month</strong>
			<span class="breakdown">
				{'—'} {cart.count} bot{cart.count === 1 ? '' : 's'} @ ${data.monthlyUsd}{#if opsCount > 0}{' + '}{opsCount}
					Ops Pack{opsCount === 1 ? '' : 's'} @ ${data.opsPackUsd}{/if}
			</span>
			— billed monthly via Stripe. Cancel anytime; see
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
	.breakdown { color: var(--text-muted); font-size: var(--fs-0); }
	.tag { color: var(--accent); font-size: var(--fs-0); margin-left: var(--sp-2); }
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
