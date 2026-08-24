<script lang="ts">
	import { page } from '$app/state';
	import { primary, utility, legal } from '$lib/nav';
	import { site } from '$lib/content/copy';

	// /operator already carries the profile link in its own body. Rendering it
	// again down here would give that page two links to the same URL, which is
	// noise for a screen reader and a duplicate the acceptance suite rejects.
	const showLinkedIn = $derived(page.url.pathname !== '/operator');
</script>

<footer>
	<div class="inner">
		<div class="col">
			<p class="brandline">{site.fullName} — {site.operator}</p>
			<p class="strapline">{site.strapline}</p>
			<p class="meta">Est. {site.foundedYear}</p>
		</div>

		<nav class="col" aria-label="Footer">
			<p class="eyebrow">Site</p>
			<ul>
				{#each primary as item (item.href)}
					<li><a href={item.href}>{item.label}</a></li>
				{/each}
			</ul>
		</nav>

		<div class="col">
			<p class="eyebrow">Elsewhere</p>
			<ul>
				{#each utility as item (item.href)}
					<li><a href={item.href} rel="noopener">{item.label}</a></li>
				{/each}
				{#if showLinkedIn}
					<li><a href={site.linkedin} rel="noopener">LinkedIn</a></li>
				{/if}
			</ul>
		</div>

		<div class="col">
			<p class="eyebrow">Legal</p>
			<ul>
				{#each legal as item (item.href)}
					<li><a href={item.href}>{item.label}</a></li>
				{/each}
				<li><a href={'mailto:' + site.email}>{site.email}</a></li>
			</ul>
		</div>
	</div>
</footer>

<style>
	footer {
		border-top: 1px solid var(--border);
		background: var(--bg-raised);
		margin-top: var(--sp-8);
	}
	.inner {
		max-width: var(--page);
		margin: 0 auto;
		padding: var(--sp-7) var(--sp-5);
		display: grid;
		gap: var(--sp-6);
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
	}
	.col p {
		margin: 0 0 var(--sp-3);
	}
	.brandline {
		color: var(--text);
		font-weight: 600;
	}
	.strapline,
	.meta {
		color: var(--text-muted);
		font-size: var(--fs-1);
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--sp-2);
	}
	li {
		margin: 0;
	}
	li a {
		color: var(--text-muted);
		font-size: var(--fs-1);
	}
	li a:hover {
		color: var(--accent);
	}
</style>
