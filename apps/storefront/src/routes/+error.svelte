<script lang="ts">
	import Wordmark from '$lib/components/Wordmark.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import {
		copyFor,
		errContact,
		errFallbackSrc,
		errLinks,
		errSrcset,
		errSvg,
		ERR_SIZES,
		pickErr,
		poolFor,
		type ErrEntry
	} from '$lib/errors';

	// STAR-168: the shared Starhold error page (brand/errors). SvelteKit keeps the HTTP status;
	// this only renders the body. The server render and no-JS visitors get the pool's first
	// entry; in the browser a random one replaces it on mount (?img=<id> forces one), like
	// brand/errors/err-pool.js. No inline script, so the storefront CSP is untouched.
	const status = $derived(page.status);
	const copy = $derived(copyFor(status));
	const pool = $derived(poolFor(status));
	let chosen = $state<ErrEntry | null>(null);
	const pick = $derived(chosen && pool.some((e) => e.id === chosen!.id) ? chosen : (pool[0] ?? null));

	onMount(() => {
		chosen = pickErr(pool, new URLSearchParams(location.search).get('img'));
	});

	// "← Go back" is a plain link home; with history it steps back instead (progressive enhancement).
	function back(e: MouseEvent) {
		if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		if (history.length > 1) {
			e.preventDefault();
			history.back();
		}
	}
</script>

<svelte:head>
	<title>{copy.code} · {copy.title} · Starhold</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="err" data-err-status={status}>
	<div class="err-band">
		<a class="err-nav err-back" href="/" onclick={back}>{errLinks.back}</a>
		{#if pick}
			<figure class="err-figure" data-err-pick={pick.id}>
				{#if pick.kind === 'svg'}
					{@html errSvg(status, pick)}
				{:else}
					<picture>
						<source type="image/avif" srcset={errSrcset(status, pick, 'avif')} sizes={ERR_SIZES} />
						<source type="image/webp" srcset={errSrcset(status, pick, 'webp')} sizes={ERR_SIZES} />
						<img
							class="err-img"
							class:err-fade={pick.fade}
							src={errFallbackSrc(status, pick)}
							width={pick.width}
							height={pick.height}
							alt=""
							decoding="async"
						/>
					</picture>
				{/if}
			</figure>
		{/if}
		<a class="err-nav err-home" href="/">{errLinks.home}</a>
	</div>
	<h1 class="err-title"><span class="err-code">{copy.code}</span> · {copy.title}</h1>
	<p class="err-text">{copy.explanation}</p>
</main>
<footer class="err-foot">
	<p class="err-contact">{errContact.label} <a href="mailto:{errContact.email}">{errContact.email}</a></p>
	<a class="brand" href="/">
		<img class="mark" src="/mark/mark-64.png" srcset="/mark/mark-64.webp 1x, /mark/mark-128.webp 2x" width="36" height="36" alt="" />
		<Wordmark />
	</a>
</footer>

<style>
	.err {
		flex: 1;
		width: 100%;
		padding: var(--sp-7) 0 var(--sp-6);
	}
	.err-band {
		display: grid;
		grid-template-columns: 1fr minmax(0, 960px) 1fr;
		align-items: center;
		gap: var(--sp-5);
		padding-inline: var(--sp-5);
	}
	.err-figure {
		grid-column: 2;
		grid-row: 1;
		margin: 0;
		width: 100%;
		min-width: 0;
	}
	.err-figure :global(svg) {
		display: block;
		width: 100%;
		height: auto;
	}
	picture {
		display: block;
	}
	.err-img {
		display: block;
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: min(540px, 56.25vw);
		margin-inline: auto;
	}
	.err-fade {
		-webkit-mask-image: linear-gradient(to right, transparent, var(--bg) 7%, var(--bg) 93%, transparent),
			linear-gradient(to bottom, transparent, var(--bg) 9%, var(--bg) 91%, transparent);
		-webkit-mask-composite: source-in;
		mask-image: linear-gradient(to right, transparent, var(--bg) 7%, var(--bg) 93%, transparent),
			linear-gradient(to bottom, transparent, var(--bg) 9%, var(--bg) 91%, transparent);
		mask-composite: intersect;
	}
	.err-nav {
		grid-row: 1;
		font-size: var(--fs-2);
		font-weight: 500;
		text-decoration: none;
		white-space: nowrap;
		padding: var(--sp-2) var(--sp-3);
	}
	.err-nav:hover {
		text-decoration: underline;
	}
	.err-back {
		grid-column: 1;
		justify-self: end;
	}
	.err-home {
		grid-column: 3;
		justify-self: start;
	}
	.err-title {
		margin: var(--sp-5) auto 0;
		padding-inline: var(--sp-5);
		max-width: calc(var(--measure) + 2 * var(--sp-5));
		font-size: var(--fs-5);
		font-weight: 600;
		letter-spacing: 0.06em;
		line-height: 1.25;
		text-align: center;
	}
	.err-code {
		color: var(--accent);
	}
	.err-text {
		margin: var(--sp-4) auto 0;
		padding-inline: var(--sp-5);
		max-width: calc(var(--measure) + 2 * var(--sp-5));
		color: var(--text-muted);
		text-align: center;
	}
	.err-foot {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: var(--sp-3) var(--sp-6);
		padding: var(--sp-5);
		border-top: 1px solid var(--border);
		font-size: var(--fs-1);
		color: var(--text-muted);
	}
	.err-contact {
		margin: 0;
	}
	.brand {
		display: inline-flex;
		align-items: center;
		gap: var(--sp-2);
		color: var(--text);
		text-decoration: none;
	}
	.brand .mark {
		display: block;
		width: 2em;
		height: 2em;
		margin-inline: -0.3em -0.35em;
	}
	@media (max-width: 1099px) {
		.err {
			padding-top: var(--sp-5);
		}
		.err-band {
			grid-template-columns: 1fr 1fr;
			padding-inline: 0;
			row-gap: var(--sp-3);
			column-gap: 0;
		}
		.err-figure {
			grid-column: 1 / -1;
			grid-row: 1;
		}
		.err-back {
			grid-column: 1;
			grid-row: 2;
			justify-self: start;
			margin-left: var(--sp-3);
		}
		.err-home {
			grid-column: 2;
			grid-row: 2;
			justify-self: end;
			margin-right: var(--sp-3);
		}
		.err-title {
			font-size: var(--fs-4);
		}
		.err-text {
			font-size: var(--fs-2);
		}
	}
	/* The drawing: fleet art roles; motion is finite and reduced-motion safe. */
/* ═══ the drawing: the fleet art roles, weights set in the file ══════════ */
.err-figure :global(.err-art) {
	color: var(--text-muted);
	overflow: visible;
}
.err-figure :global(.err-art .tech-grid) {
	color: var(--border);
}
.err-figure :global(.err-art .far) {
	color: var(--border-strong);
}
.err-figure :global(.err-art .quiet) {
	color: var(--text-muted);
}
.err-figure :global(.err-art .lit) {
	color: var(--accent);
}
.err-figure :global(.err-art .ink) {
	color: var(--text);
}
.err-figure :global(.err-art .drift) {
	transform-box: fill-box;
	transform-origin: center;
}
/* Motion is optional and finite: everything rests well before 30 s (B5). */
@media (prefers-reduced-motion: no-preference) {
	.err-figure :global(.err-art .blink) {
		animation: err-blink 3.6s ease-in-out 4 both;
	}
	.err-figure :global(.err-art .drift) {
		animation: err-drift 12s ease-in-out 2 alternate both;
	}
}
@keyframes err-blink {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0.35;
	}
}
@keyframes err-drift {
	from {
		translate: 0 0;
		rotate: 0deg;
	}
	to {
		translate: 0 -10px;
		rotate: 2deg;
	}
}
</style>
