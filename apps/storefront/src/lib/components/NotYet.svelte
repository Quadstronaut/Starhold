<script lang="ts">
	import Heading from '#lib/components/Heading.svelte';
	import { NOT_YET } from '#lib/content/catalog.js';
	// STAR-299: the short "what we don't do yet" list, on the Teams page and the pricing page.
	// Every line must be true on the day it ships (operator ruling 2026-11-19); the list and
	// where each fact comes from live in lib/content/catalog.ts.
</script>

<section id="not-yet" class="section section-divided">
	<p class="eyebrow">Before you buy</p>
	<Heading {...NOT_YET.heading} />
	<p class="lede">{NOT_YET.sub}</p>
	<ul class="notyet">
		{#each NOT_YET.items as item (item)}
			<li>{item}</li>
		{/each}
	</ul>
</section>

<style>
	.notyet {
		max-width: var(--measure);
		color: var(--text-muted);
		padding-left: var(--sp-5);
		margin-top: var(--sp-4);
	}
</style>
