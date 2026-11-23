<script lang="ts">
	import {
		PERIDOT_SUPPORTERS,
		PERIDOT_DEDICATION,
		PATREON_URL,
		PATREON_LINK_TEXT,
		PERIDOT_PLAY_URL,
		PERIDOT_DOWNLOAD_ENABLED
	} from '#lib/peridot/page-content.js';
	import PeridotDownload from '#lib/peridot/PeridotDownload.svelte';
</script>

<svelte:head>
	<title>Peridot</title>
	<meta name="description" content="Peridot is a free, private cycle tracker for Android. Your data stays on your phone." />
</svelte:head>

<!-- STAR-301: static page. No script, form, cookie or third-party request. One Patreon link, once (a thank you, never an ask). Not in the site nav or product lists until the app is on Google Play. -->
<section class="section legal">
	<h1>Peridot</h1>

	<h2>What it is</h2>
	<p>Peridot is a period tracker for Android. It keeps everything on your phone, encrypted. What you share with a circle travels encrypted through relays, one of them run by Starhold, and Starhold cannot read it.</p>
	<p>Peridot is free. There is no price, no purchases and no ads.</p>

	<h2>Why it exists</h2>
	<p>After the Dobbs decision in 2022, period tracking data became a legal risk. Most apps store it on company servers, where it can be subpoenaed, sold or breached, and their answer was a privacy policy that can be changed at any time.</p>
	<p>Peridot takes a different approach. It keeps no readable cycle data anywhere a company or government can reach.</p>

	<h2>Where to get it</h2>
	{#if PERIDOT_PLAY_URL}
		<p><a href={PERIDOT_PLAY_URL}>Get Peridot on Google Play</a></p>
	{:else}
		<p>Coming to Google Play.</p>
	{/if}

	<!-- PERI-15: flag is OFF, so this renders nothing today. -->
	{#if PERIDOT_DOWNLOAD_ENABLED}
		<PeridotDownload />
	{/if}

	<h2>Thanks</h2>
	<p>Thank you to the people who support Starhold on Patreon. Their support paid for the time to build this.</p>
	{#if PERIDOT_SUPPORTERS.length}
		<ul>
			{#each PERIDOT_SUPPORTERS as name (name)}
				<li>{name}</li>
			{/each}
		</ul>
	{/if}
	<p><a href={PATREON_URL}>{PATREON_LINK_TEXT}</a></p>
	<p><em>{PERIDOT_DEDICATION}</em></p>

	<nav aria-label="Peridot pages">
		<a href="/peridot/privacy">Peridot privacy policy</a> ·
		<a href="/peridot/delete">Delete your Peridot data</a> ·
		<a href="/peridot/terms">Peridot terms of use</a>
	</nav>
</section>
