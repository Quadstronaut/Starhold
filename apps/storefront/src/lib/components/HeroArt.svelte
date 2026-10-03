<script lang="ts">
	// Original line-art of "the hold": a small orbital station seen from a
	// slight angle, drawn with sketch-like single strokes. Pure decoration, so
	// it is hidden from assistive tech and carries no text.
	//
	// Colour never appears as a literal here: every stroke/fill is
	// `currentColor`, and the CSS classes below point currentColor at a token.
	// Motion is CSS-only (no JS), so the art is identical with scripts off.

	// Fixed starfield [x, y, r] in viewBox units. Hand-placed rather than
	// generated at render time, so server and client render the same markup (no hydration
	// mismatch) and the sky never reshuffles between visits.
	const stars: [number, number, number][] = [
		[40, 60, 1.2], [120, 30, 0.9], [200, 80, 1.4], [330, 40, 1], [420, 90, 1.3],
		[455, 170, 0.9], [60, 190, 1], [25, 300, 1.3], [95, 410, 1], [170, 450, 1.2],
		[300, 460, 0.9], [405, 420, 1.4], [450, 330, 1], [360, 130, 0.8], [150, 140, 0.8],
		[260, 30, 1.1], [75, 120, 0.8], [440, 250, 0.8], [210, 430, 0.9], [350, 380, 0.8]
	];
</script>

<svg
	class="art"
	viewBox="0 0 480 480"
	fill="none"
	stroke="currentColor"
	stroke-width="1.5"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	focusable="false"
>
	<!-- faint starfield: each star twinkles on its own offset (nth-child delay) -->
	<g class="stars" fill="currentColor" stroke="none">
		{#each stars as [x, y, r]}
			<circle cx={x} cy={y} {r} />
		{/each}
	</g>

	<!-- the whole station drifts as one body -->
	<g class="station">
		<!-- orbit lanes, drawn dashed so they read as pencil -->
		<ellipse class="lane" cx="240" cy="250" rx="215" ry="70" stroke-dasharray="3 9" transform="rotate(-18 240 250)" />
		<ellipse class="lane" cx="240" cy="250" rx="165" ry="52" stroke-dasharray="2 7" transform="rotate(-18 240 250)" />

		<!-- solar wings: two frames with cell ribs, left and right of the hub -->
		<g class="wing">
			<path d="M40 214 L168 196 L168 270 L40 288 Z" />
			<path d="M72 210 L72 284 M104 205 L104 279 M136 200 L136 274" />
			<path d="M44 251 L168 233" />
			<path d="M312 196 L440 214 L440 288 L312 270 Z" />
			<path d="M344 200 L344 274 M376 205 L376 279 M408 210 L408 284" />
			<path d="M312 233 L436 251" />
		</g>

		<!-- spars joining wings to the hub -->
		<path d="M168 233 L194 240 M312 233 L286 240" />

		<!-- the hold itself: hexagonal core (echoes the header mark) -->
		<path class="core" d="M286 240 L263 279.8 L217 279.8 L194 240 L217 200.2 L263 200.2 Z" />
		<path d="M274 240 L257 269.4 L223 269.4 L206 240 L223 210.6 L257 210.6 Z" />
		<!-- hatching on the inner face: the sketchy shading -->
		<path d="M214 232 L232 214 M222 246 L248 220 M232 262 L262 232 M248 266 L268 246" opacity="0.55" />

		<!-- docking ring around the core, tilted -->
		<ellipse cx="240" cy="240" rx="82" ry="24" transform="rotate(-18 240 240)" />

		<!-- mast + dish up top, mast down below -->
		<path d="M240 200 L240 150 M240 150 L224 138 M240 150 L256 138 M224 138 Q240 124 256 138" />
		<path d="M240 280 L240 326 M228 326 L252 326" />

		<!-- a small visiting craft on the outer lane -->
		<g class="craft">
			<path d="M388 332 L408 322 L418 336 L398 346 Z" />
			<path d="M418 336 L436 340" />
		</g>
	</g>

	<!-- amber signal lights: hub beacon, wing tips, mast top, craft -->
	<g class="lights" fill="currentColor" stroke="none">
		<circle cx="240" cy="240" r="5" />
		<circle cx="40" cy="214" r="3" />
		<circle cx="440" cy="288" r="3" />
		<circle cx="240" cy="138" r="2.5" />
		<circle cx="436" cy="340" r="2.5" />
	</g>
</svg>

<style>
	.art {
		display: block;
		width: 100%;
		height: auto;
		/* base line colour: quiet, so it never competes with the copy */
		color: var(--text-muted);
		overflow: visible;
	}

	.lane {
		color: var(--border-strong);
	}
	.stars {
		color: var(--text-muted);
	}
	.lights {
		color: var(--accent);
	}
	/* a hint of amber in one structural line, not just the lights */
	.core {
		color: var(--accent);
	}
	.wing {
		color: var(--text-muted);
	}

	/* Motion. Slow enough to feel like drift, small enough to cost nothing:
	   transform/opacity only, so the compositor handles it and layout is
	   never touched. */
	/* SVG groups default to the viewBox origin; pivot on the element's own box so
	   the small rotation is a gentle tilt, not a sweep around the top-left. */
	.station,
	.craft {
		transform-box: fill-box;
		transform-origin: center;
	}
	.station {
		animation: drift 14s ease-in-out infinite alternate;
	}
	.craft {
		animation: pass 22s ease-in-out infinite alternate;
	}
	.stars circle {
		animation: twinkle 5s ease-in-out infinite;
	}
	.stars circle:nth-child(3n) {
		animation-delay: -1.7s;
		animation-duration: 7s;
	}
	.stars circle:nth-child(3n + 1) {
		animation-delay: -3.2s;
	}
	.stars circle:nth-child(5n) {
		animation-duration: 9s;
	}
	.lights circle {
		animation: blink 3.6s ease-in-out infinite;
	}
	.lights circle:nth-child(2n) {
		animation-delay: -1.8s;
	}

	@keyframes drift {
		from {
			transform: translateY(-6px) rotate(-0.8deg);
		}
		to {
			transform: translateY(8px) rotate(0.8deg);
		}
	}
	@keyframes pass {
		from {
			transform: translate(-14px, 4px);
		}
		to {
			transform: translate(10px, -6px);
		}
	}
	@keyframes twinkle {
		0%,
		100% {
			opacity: 0.25;
		}
		50% {
			opacity: 1;
		}
	}
	@keyframes blink {
		0%,
		100% {
			opacity: 0.45;
		}
		50% {
			opacity: 1;
		}
	}

	/* app.css already collapses all animation under this query, but a stopped,
	   fully-visible frame is the intended result, so say so explicitly. */
	@media (prefers-reduced-motion: reduce) {
		.station,
		.craft,
		.stars circle,
		.lights circle {
			animation: none;
		}
		.stars circle,
		.lights circle {
			opacity: 0.8;
		}
	}
</style>
