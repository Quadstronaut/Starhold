<script lang="ts">
	import type { FaqItem } from '$lib/content/copy';

	// Native <details>/<summary>: keyboard, screen-reader and no-JS behaviour
	// all come from the browser. The chevron is pure CSS and rotates on [open].
	let { items }: { items: FaqItem[] } = $props();
</script>

<div class="faq">
	{#each items as item (item.q)}
		<details data-evidence={item.evidence}>
			<summary>
				<span class="q">{item.q}</span>
				<svg class="chev" viewBox="0 0 24 24" aria-hidden="true" focusable="false"
					><path d="M6 9l6 6 6-6" /></svg
				>
			</summary>
			<div class="a">
				<p>{item.a}</p>
				{#if item.link}
					<p><a href={item.link.href}>{item.link.label} →</a></p>
				{/if}
			</div>
		</details>
	{/each}
</div>

<style>
	.faq {
		max-width: var(--measure);
		margin-top: var(--sp-5);
		border-top: 1px solid var(--border);
	}
	details {
		border-bottom: 1px solid var(--border);
	}
	summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sp-4);
		padding: var(--sp-4) 0;
		cursor: pointer;
		list-style: none; /* hide the default marker (Firefox/Chromium) */
		color: var(--text);
		font-weight: 600;
	}
	summary::-webkit-details-marker {
		display: none; /* Safari */
	}
	summary:hover .q {
		color: var(--accent);
	}
	summary:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: 2px;
		border-radius: var(--radius-sm);
	}
	.chev {
		width: var(--icon);
		height: var(--icon);
		flex-shrink: 0;
		fill: none;
		stroke: var(--accent);
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		transition: transform 0.2s ease;
	}
	details[open] .chev {
		transform: rotate(180deg);
	}
	.a {
		padding: 0 0 var(--sp-4);
		color: var(--text-muted);
	}
	.a p {
		margin: 0 0 var(--sp-2);
	}
	@media (prefers-reduced-motion: reduce) {
		.chev {
			transition: none;
		}
	}
</style>
