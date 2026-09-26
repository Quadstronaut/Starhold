<script lang="ts">
	/*
	 * The phone-flip. Hand your unlocked phone across the table, or print it
	 * and leave it on a desk. One promise, one code, nothing else competing.
	 *
	 * A bare QR converts poorly — the promise beside it is what lifts the
	 * scan rate, so it is not decoration and must not be trimmed.
	 */
</script>

<svelte:head>
	<title>QFlix — scan</title>
</svelte:head>

<main>
	<p class="kicker">Point your camera here</p>

	<h1>Everything.<br />On demand.<br /><em>No ads, ever.</em></h1>

	<img src="/qr.svg" alt="QR code linking to qflix.starhold.dev" width="320" height="320" />

	<p class="promise">Scan to see what's on the shelf right now</p>
	<p class="url">qflix.starhold.dev</p>
</main>

<style>
	main {
		min-height: 100svh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1.1rem;
		padding: 2rem 1.25rem;
		text-align: center;
	}

	.kicker {
		color: var(--amber);
		font-size: var(--step--1);
		text-transform: uppercase;
		letter-spacing: 0.16em;
	}

	h1 {
		font-size: var(--step-3);
		letter-spacing: -0.035em;
	}

	h1 em {
		font-style: normal;
		color: var(--amber);
	}

	img {
		/* Quiet zone plus a light plate — dark-on-light scans far more
		   reliably than inverted, especially under rink lighting. */
		width: min(78vw, 320px);
		height: auto;
		padding: 1rem;
		background: #fff;
		border-radius: 16px;
	}

	.promise {
		font-size: var(--step-1);
		font-weight: 600;
	}

	.url {
		color: var(--ink-faint);
		font-size: var(--step--1);
		letter-spacing: 0.04em;
	}

	/* Print as a card you can leave behind. */
	@media print {
		:global(body) {
			background: #fff;
			color: #000;
		}

		main {
			min-height: auto;
			gap: 0.8rem;
		}

		h1 em,
		.kicker {
			color: #b45309;
		}

		.url {
			color: #444;
		}

		img {
			padding: 0;
		}
	}
</style>
