<script lang="ts">
	import { account } from '$lib/content/copy';
	import { labelFor } from '$lib/labels';
</script>

<svelte:head>
	<title>{account.title}</title>
	<meta name="description" content={account.description} />
</svelte:head>

<!-- One honest stub (ruling 7). Not linked from the header until sign-in works. -->
<section class="section">
	<p class="eyebrow">{account.eyebrow}</p>
	<h1>{account.h1}</h1>
	<p><span class="tag">{labelFor('account')}</span></p>
	<p class="lede">{account.lede}</p>
	<div class="prose">
		{#each account.body as para (para)}
			<p>{para}</p>
		{/each}
	</div>
	<div class="btn-row">
		<a class="btn btn-primary" href={account.cta.href}>{account.cta.label}</a>
		<a class="btn btn-secondary" href={account.secondary.href}>{account.secondary.label}</a>
	</div>
</section>
