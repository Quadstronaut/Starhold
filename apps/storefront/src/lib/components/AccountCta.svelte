<script lang="ts">
	import Heading from '#lib/components/Heading.svelte';
	import { ACCOUNT_CTA } from '#lib/content/catalog.js';
	import { accountLinks, cta } from '#lib/nav.js';
	// STAR-299: "Create a free account", with the one line for returning people under it.
	// Before launch there is no sign-in, so the band offers the one pre-launch action instead.
</script>

<section class="section section-divided">
	<div class="band reveal">
		{#if accountLinks}
			<Heading {...ACCOUNT_CTA.heading} />
			<p class="lede">{ACCOUNT_CTA.body}</p>
			<div class="btn-row">
				<a class="btn btn-primary" href={accountLinks.create.href} rel="noopener">{accountLinks.create.label}</a>
			</div>
			<p class="already">{ACCOUNT_CTA.already} <a href={accountLinks.signIn.href} rel="noopener">{accountLinks.signIn.label}</a>.</p>
		{:else}
			<div class="btn-row"><a class="btn btn-primary" href={cta.href}>{cta.label}</a></div>
		{/if}
	</div>
</section>

<style>
	.already {
		margin: var(--sp-4) 0 0;
		font-size: var(--fs-1);
		color: var(--text-muted);
	}
</style>
