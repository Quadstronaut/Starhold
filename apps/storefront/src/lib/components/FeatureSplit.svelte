<script lang="ts">
	import type { Snippet } from 'svelte';
	import Heading from './Heading.svelte';

	// One proof, told twice: words on one side, a terminal card on the other.
	// `flip` swaps the sides on wide screens so consecutive sections zig-zag.
	// On phones the text always comes first, then the card, whatever `flip` says.
	let {
		eyebrow,
		heading,
		body,
		link,
		evidence,
		flip = false,
		media
	}: {
		eyebrow: string;
		heading: { pre: string; em: string };
		body: string;
		link: { href: string; label: string };
		evidence: string;
		flip?: boolean;
		media: Snippet;
	} = $props();
</script>

<section class="section section-divided">
	<div class="split" class:flip>
		<div class="copy" data-evidence={evidence}>
			<p class="eyebrow">{eyebrow}</p>
			<Heading {...heading} />
			<p class="lede">{body}</p>
			<p class="more">
				<a href={link.href} rel={link.href.startsWith('/') ? undefined : 'noopener'}>{link.label} →</a>
			</p>
		</div>
		<div class="media">{@render media()}</div>
	</div>
</section>

<style>
	.split {
		display: grid;
		/* minmax(0,…) lets the column shrink below its widest monospace line */
		grid-template-columns: minmax(0, 1fr);
		gap: var(--sp-6);
		align-items: center;
	}
	.more {
		margin: var(--sp-4) 0 0;
		font-weight: 600;
	}
	@media (min-width: 800px) {
		.split {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			gap: var(--sp-8);
		}
		/* swap sides without touching DOM order, so reading order stays text-first */
		.flip .copy {
			order: 2;
		}
	}
</style>
