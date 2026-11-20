<script lang="ts">
	import { SUITE_LINE } from '#lib/availability.js';
	import { serviceFor, packageMonthlyUsd, TIER_LABEL, type Package } from '#lib/content/catalog.js';

	// STAR-299 (operator ruling 2026-11-19): a package is a recommended set of EXISTING plans.
	// It has no price of its own: the total shown is the plans added up from the shared price
	// steps, and the Suite line is the one in lib/availability.ts. Nothing is typed here.
	let { packages }: { packages: Package[] } = $props();
</script>

<div class="grid-2 packages">
	{#each packages as p (p.name)}
		{@const total = packageMonthlyUsd(p)}
		<article class="card package reveal" data-package={p.name}>
			<h3>{p.name}</h3>
			<p>{p.body}</p>
			<ul>
				{#each p.plans as plan (plan.service)}
					<li><strong>{serviceFor(plan.service).name}</strong>: {TIER_LABEL[plan.tier]}</li>
				{/each}
			</ul>
			<p class="total" data-testid="package-total" data-price>
				{#if p.suite}
					{SUITE_LINE}.
				{:else if total === 0}
					Adds up to nothing: every line is a free tier.
				{:else}
					Adds up to ${total} a month.
				{/if}
			</p>
		</article>
	{/each}
</div>

<style>
	.packages {
		margin-top: var(--sp-5);
	}
	.package ul {
		margin: var(--sp-3) 0 0;
		padding-left: var(--sp-5);
	}
	.package strong {
		color: var(--text);
		font-weight: 600;
	}
	.package .total {
		margin-top: var(--sp-4);
		padding-top: var(--sp-3);
		border-top: 1px solid var(--border);
		color: var(--text);
		font-weight: 600;
	}
</style>
