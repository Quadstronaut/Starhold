<script lang="ts">
	import InviteForm from '$lib/components/InviteForm.svelte';
	import FormNotice from '$lib/components/FormNotice.svelte';
	import { invite, formNotices } from '$lib/content/copy';

	let { data } = $props();
</script>

<svelte:head>
	<title>{invite.title}</title>
	<meta name="description" content={invite.description} />
</svelte:head>

<section class="section">
	<p class="eyebrow">{invite.eyebrow}</p>
	<h1>{invite.h1}</h1>
	<p class="lede">{invite.lede}</p>
	{#key data.service}
		<InviteForm service={data.service} />
	{/key}
	<FormNotice lines={[formNotices.contact.notice, formNotices.contact.secrets]} />
</section>
