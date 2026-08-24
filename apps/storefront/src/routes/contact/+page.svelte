<script lang="ts">
	import { DISCORD_INVITE, DISCORD_TICKET_URL, CONTACT_EMAIL } from '$lib/site-links';
	import IntakeForm from '$lib/components/IntakeForm.svelte';
	import { contact } from '$lib/content/copy';

	let { data } = $props();
	const isQuote = $derived(data.intent === 'quote');
</script>

<svelte:head>
	<title>{contact.title}</title>
	<meta name="description" content={contact.description} />
</svelte:head>

<section class="section">
	<p class="eyebrow">{contact.eyebrow}</p>
	<h1>{isQuote ? contact.h1Quote : contact.h1Contact}</h1>
	<p class="lede">{isQuote ? contact.introQuote : contact.introContact}</p>

	<p class="email">
		<span class="eyebrow">{contact.emailLabel}</span>
		<a href={'mailto:' + CONTACT_EMAIL}>{CONTACT_EMAIL}</a>
	</p>

	{#if DISCORD_INVITE}
		<!-- The Discord channel only exists on the site once there is a public
		     invite to send people to. Half a door is worse than no door. -->
		<p class="discord">
			<a class="btn btn-secondary" href={DISCORD_INVITE} rel="noopener">Discord</a>
			<a href={DISCORD_TICKET_URL} rel="noopener">Already in the server? Open a ticket in #contact</a>
		</p>
	{/if}
</section>

<section class="section section-divided">
	<h2>{isQuote ? 'Quote request' : 'Send a message'}</h2>
	<IntakeForm
		kind={isQuote ? 'quote' : 'contact'}
		cta={isQuote ? 'Request a quote' : 'Send'}
	/>
</section>

<style>
	.email {
		margin-top: var(--sp-6);
	}
	.discord {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sp-4);
		align-items: center;
		margin-top: var(--sp-5);
	}
</style>
