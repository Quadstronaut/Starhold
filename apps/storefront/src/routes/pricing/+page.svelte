<script lang="ts">
	import Heading from '#lib/components/Heading.svelte';
	import PageHero from '#lib/components/PageHero.svelte';
	import Packages from '#lib/components/Packages.svelte';
	import NotYet from '#lib/components/NotYet.svelte';
	import AccountCta from '#lib/components/AccountCta.svelte';
	import { serviceItems, faq } from '#lib/content/copy.js';
	import { AUDIENCES, PRICING } from '#lib/content/catalog.js';
	import { SUITE_LINE } from '#lib/availability.js';
	import { LAUNCHED, ACCOUNT_URL } from '#lib/launch.js';
	import { noteWithYearly, suiteYearlySuffix } from '#lib/yearly.js';

	// STAR-299: the one public price table. No price is typed on this page: each product's
	// price line is its availability line (lib/availability.ts), the Suite line is SUITE_LINE,
	// and the payment and refund paragraph is the FAQ answer, reused word for word.
	// SHIP-6: yearly prices come from lib/yearly.ts and appear only while YEARLY_PLANS is on; while it
	// is off `items` equals serviceItems and the suffix is "", so the page is byte-identical.
	let { data } = $props();
	const items = serviceItems.map((s) => ({ ...s, note: noteWithYearly(s.id, s.note) }));
	const suiteYearly = suiteYearlySuffix();
	const payment = faq.items.find((i) => i.q === PRICING.paymentFaq);
	const external = (href: string) => !href.startsWith('/');
</script>

<svelte:head>
	<title>{PRICING.title}</title>
	<meta name="description" content={PRICING.description} />
</svelte:head>

<PageHero pick={data.hero} eyebrow={PRICING.eyebrow} h1={PRICING.h1} lede={PRICING.lede} />

<section id="prices" class="section">
	<Heading {...PRICING.tableHeading} />
	<div class="table-scroll">
		<table class="prices">
			<thead>
				<tr>
					<th scope="col">Product</th>
					<th scope="col">What it does</th>
					<th scope="col">Plans and prices</th>
					<th scope="col">Link</th>
				</tr>
			</thead>
			<tbody>
				{#each items as s (s.id)}
					<tr data-product={s.id}>
						<th scope="row">{s.name} <span class="tag">{s.status}</span></th>
						<td data-l="What it does">{s.what}</td>
						<td data-l="Plans and prices">
							<span class="line" data-testid="availability">{s.availability}</span>
							{#if s.note}<span class="note">{s.note}</span>{/if}
						</td>
						<td data-l="Link">
							{#if s.href && !s.invite}
								<a href={s.href} rel={external(s.href) ? 'noopener' : undefined}>{s.action} →</a>
							{:else}
								{s.action}
							{/if}
						</td>
					</tr>
				{/each}
				<tr data-product="suite">
					<th scope="row">Starhold Suite</th>
					<td data-l="What it does">One bill for every tool.</td>
					<td data-l="Plans and prices"><span class="line" data-testid="suite-line">{SUITE_LINE}.{suiteYearly}</span></td>
					<td data-l="Link">
						{#if LAUNCHED}<a href={`${ACCOUNT_URL}/account/subscriptions`} rel="noopener">Get the Suite →</a>{/if}
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</section>

<section id="sets" class="section section-divided">
	<p class="eyebrow">Sets</p>
	<Heading {...PRICING.packagesHeading} />
	<p class="lede">{PRICING.packagesSub}</p>
	{#each AUDIENCES as a (a.id)}
		<h3 class="aud">{a.label}</h3>
		<Packages packages={a.packages} />
	{/each}
</section>

{#if payment}
	<section id="paying" class="section section-divided" data-evidence={payment.evidence}>
		<p class="eyebrow">Payment</p>
		<Heading {...PRICING.paymentHeading} />
		<div class="prose">
			<p>{payment.a}</p>
			{#if payment.link}<p><a href={payment.link.href}>{payment.link.label} →</a></p>{/if}
		</div>
	</section>
{/if}

<NotYet />

<AccountCta />

<style>
	.table-scroll {
		overflow-x: auto;
		margin-top: var(--sp-4);
	}
	.prices {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--fs-1);
	}
	.prices th,
	.prices td {
		text-align: left;
		vertical-align: top;
		padding: var(--sp-3);
		border-bottom: 1px solid var(--border);
	}
	.prices thead th {
		font-family: var(--font-mono);
		font-size: var(--fs-0);
		font-weight: 400;
		color: var(--text-muted);
	}
	.prices tbody th {
		color: var(--text);
		font-weight: 600;
		white-space: nowrap;
	}
	.prices tbody th .tag {
		display: flex;
		width: max-content;
		margin-top: var(--sp-1);
		color: var(--text-muted);
	}
	.prices td {
		color: var(--text-muted);
	}
	.prices .line {
		display: block;
		color: var(--text);
		font-weight: 600;
	}
	.prices .note {
		display: block;
		margin-top: var(--sp-1);
	}
	.aud {
		margin-top: var(--sp-6);
		font-size: var(--fs-4);
	}
	@media (min-width: 641px) {
		.prices {
			min-width: 760px;
		}
	}
	@media (max-width: 640px) {
		.prices thead {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip-path: inset(50%);
		}
		.prices,
		.prices tbody,
		.prices tr,
		.prices th,
		.prices td {
			display: block;
			width: 100%;
		}
		.prices tr {
			padding: var(--sp-3) 0;
			border-bottom: 1px solid var(--border);
		}
		.prices th,
		.prices td {
			border: 0;
			padding: 2px 0;
		}
		.prices tbody th {
			white-space: normal;
			font-size: var(--fs-2);
		}
		.prices td[data-l]::before {
			content: attr(data-l) ': ';
			font-family: var(--font-mono);
			font-size: var(--fs-0);
			color: var(--text-muted);
		}
	}
</style>
