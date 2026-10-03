<script lang="ts">
	import Heading from './Heading.svelte';
	import { site } from '$lib/content/copy';

	// Closing panel for inner pages: same amber-halo look as the home band,
	// minus the checklist. One primary action, one fallback (email).
	let {
		heading,
		body,
		cta,
		secondary
	}: {
		heading: { pre: string; em: string; post?: string };
		body: string;
		cta: { href: string; label: string };
		/** Optional second route (e.g. browse first), shown between the primary and the email. */
		secondary?: { href: string; label: string };
	} = $props();
</script>

<section class="section section-divided">
	<div class="band reveal">
		<Heading {...heading} />
		<p class="lede">{body}</p>
		<div class="btn-row">
			<a class="btn btn-primary" href={cta.href}>{cta.label}</a>
			{#if secondary}<a class="btn btn-secondary" href={secondary.href}>{secondary.label}</a>{/if}
			<a class="btn btn-ghost" href={'mailto:' + site.email}>{site.email}</a>
		</div>
	</div>
</section>
