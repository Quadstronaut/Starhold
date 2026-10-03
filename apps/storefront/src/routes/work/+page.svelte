<script lang="ts">
	import CtaBand from '$lib/components/CtaBand.svelte';
	import { work } from '$lib/content/copy';
</script>

<svelte:head>
	<title>{work.title}</title>
	<meta name="description" content={work.description} />
</svelte:head>

<section class="section">
	<p class="eyebrow">{work.eyebrow}</p>
	<h1>{work.h1}</h1>
	<p class="lede">{work.intro}</p>
</section>

<section class="section section-divided">
	<h2 class="visually-hidden">Projects</h2>
	<div class="items">
		{#each work.items as w (w.id)}
			<article class="card reveal" data-evidence={w.evidence}>
				<h3>{w.name}</h3>
				<p class="status"><span class="tag">{w.status}</span></p>
				<p class="what">{w.what}</p>
				<p class="proves"><span class="eyebrow">What it demonstrates</span>{w.proves}</p>
				<p class="go"><a href={w.href} rel="noopener">Look at it →</a></p>
			</article>
		{/each}
	</div>
</section>

<CtaBand {...work.cta} />

<style>
	.items {
		display: grid;
		gap: var(--sp-4);
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr));
	}
	.what {
		color: var(--text);
		font-size: var(--fs-2);
	}
	.proves {
		margin-top: var(--sp-4);
	}
	.go {
		margin-top: var(--sp-4);
		margin-bottom: 0;
	}
	.status {
		margin-bottom: var(--sp-3);
	}
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
