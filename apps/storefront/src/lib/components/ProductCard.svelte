<script lang="ts">
	import { services } from '#lib/content/copy.js';
	import { serviceFor, type AudienceItem } from '#lib/content/catalog.js';

	// STAR-299: one product as an audience meets it. The outcome in plain words leads; the
	// product name, its status label, its one availability line (which is also its price
	// line) and its one action all come from the product list in copy.ts, unchanged.
	let { item }: { item: AudienceItem } = $props();
	const s = $derived(serviceFor(item.service));
	const external = (href: string) => !href.startsWith('/');
</script>

<article class="card product reveal" data-evidence={s.evidence} data-product={s.id}>
	<h4 class="outcome">{item.outcome}</h4>
	<p class="body">{item.body}</p>
	<div class="namerow">
		<span class="name">{s.name}</span>
		<span class="tag">{s.status}</span>
	</div>
	<p class="availability" data-testid="availability">{s.availability}</p>
	{#if s.note}<p class="note" data-price>{s.note}</p>{/if}
	{#if s.host}<p class="host">{s.host}</p>{/if}
	{#if s.invite}
		<p class="service-links"><a href={services.inviteHref(s.id)}>{s.action} →</a></p>
	{:else if s.href}
		<p class="service-links">
			<a href={s.href} rel={external(s.href) ? 'noopener' : undefined}>{s.action} →</a>
		</p>
	{:else if s.disabled}
		<p class="service-links"><button type="button" disabled aria-disabled="true">{s.action}</button></p>
	{/if}
</article>

<style>
	.product {
		display: flex;
		flex-direction: column;
		gap: var(--sp-2);
	}
	.outcome {
		margin: 0;
		font-size: var(--fs-4);
		line-height: 1.25;
		color: var(--text);
	}
	.body {
		color: var(--text-muted);
	}
	.namerow {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-2) var(--sp-3);
		margin-top: auto;
		padding-top: var(--sp-3);
		border-top: 1px solid var(--border);
	}
	.name {
		font-weight: 600;
		color: var(--text);
	}
	.namerow .tag {
		color: var(--text-muted);
	}
	.availability {
		color: var(--text);
		font-weight: 600;
	}
	.host {
		font-family: var(--font-mono);
		font-size: var(--fs-0);
		overflow-wrap: anywhere;
	}
	.product p + p {
		margin-top: 0;
	}
	.service-links a {
		font-weight: 600;
	}
</style>
