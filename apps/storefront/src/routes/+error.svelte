<script lang="ts">
	import { page } from '$app/state';

	// 404 per design brief section 2 and ruling 6: a static starfield (no
	// animation) and three exits. Other errors get an honest, shorter variant.
	const notFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{notFound ? 'Page not found · Starhold' : 'Something went wrong · Starhold'}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="section lost">
	<div class="field" aria-hidden="true"></div>
	<div class="inner">
		{#if notFound}
			<p class="eyebrow">404 · Page not found</p>
			<h1>No signal at this address.</h1>
			<p class="lede">
				This page doesn't exist here, or its address may have moved. Nothing else happened.
			</p>
		{:else}
			<p class="eyebrow">{page.status} · Something went wrong</p>
			<h1>That didn't work.</h1>
			<p class="lede">The request failed on our side. Try again, or tell us if it keeps happening.</p>
		{/if}
		<div class="btn-row">
			<a class="btn btn-primary" href="/">Home</a>
			<a class="btn btn-secondary" href="https://starhold.app" rel="noopener">Hangar</a>
			<a class="btn btn-secondary" href="/contact">Contact</a>
		</div>
	</div>
</section>

<style>
	.lost {
		position: relative;
		overflow: hidden;
	}
	/* Fixed stars drawn from design tokens; nothing moves. */
	.field {
		position: absolute;
		inset: 0;
		opacity: 0.55;
		pointer-events: none;
		background-image:
			radial-gradient(circle at 8% 22%, var(--text) 0 1px, transparent 1.5px),
			radial-gradient(circle at 21% 74%, var(--text-muted) 0 1px, transparent 1.5px),
			radial-gradient(circle at 37% 12%, var(--text-muted) 0 1px, transparent 1.5px),
			radial-gradient(circle at 52% 58%, var(--text) 0 1px, transparent 1.5px),
			radial-gradient(circle at 66% 28%, var(--accent) 0 1.5px, transparent 2px),
			radial-gradient(circle at 78% 82%, var(--text-muted) 0 1px, transparent 1.5px),
			radial-gradient(circle at 91% 44%, var(--text) 0 1px, transparent 1.5px),
			radial-gradient(circle at 14% 46%, var(--text-muted) 0 1px, transparent 1.5px),
			radial-gradient(circle at 59% 91%, var(--text-muted) 0 1px, transparent 1.5px),
			radial-gradient(circle at 87% 9%, var(--text-muted) 0 1px, transparent 1.5px);
	}
	.inner {
		position: relative;
	}
</style>
