<script lang="ts">
	import type { TermLine } from '$lib/content/copy';

	// A faux terminal window: chrome bar plus monospace lines. Pure CSS and
	// text, so it is visible with JS off, selectable, and read by screen readers
	// as an ordinary figure.
	//
	// The lines are content, not decoration, so they come from copy.ts and each
	// card names the evidence row that backs what it shows. Cards show the
	// SHAPE of real output (field names, commands) and never invent live values.
	let {
		title,
		lines,
		caption,
		evidence
	}: { title: string; lines: TermLine[]; caption: string; evidence: string } = $props();
</script>

<figure class="term" data-evidence={evidence}>
	<div class="bar" aria-hidden="true">
		<span class="dot"></span><span class="dot"></span><span class="dot"></span>
		<span class="name">{title}</span>
	</div>
	<!-- Scrollable at narrow widths, so it must be reachable by keyboard (WCAG 2.1.1):
	     a named, focusable region. The global :focus-visible ring applies. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div class="body" tabindex="0" role="region" aria-label={title + ' output'}>
		{#each lines as l, i (i)}
			<p class="ln {l.kind}" data-evidence={l.evidence}>
				<span class="t">{l.t}</span>{#if l.v}<span class="v">{l.v}</span>{/if}
			</p>
		{/each}
		<!-- blinking caret: decorative, switched off by the reduced-motion rule -->
		<span class="caret" aria-hidden="true"></span>
	</div>
	<figcaption>{caption}</figcaption>
</figure>

<style>
	.term {
		margin: 0;
		background: var(--bg-raised);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lift);
		overflow: hidden;
		min-width: 0; /* lets long monospace lines scroll instead of widening the grid */
	}
	.bar {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
		padding: var(--sp-2) var(--sp-3);
		background: var(--surface-2);
		border-bottom: 1px solid var(--border);
	}
	/* Window dots are neutral on purpose: red/green are reserved for status. */
	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--border-strong);
	}
	.name {
		margin-left: var(--sp-2);
		font-family: var(--font-mono);
		font-size: var(--fs-0);
		color: var(--text-muted);
	}
	.body {
		padding: var(--sp-4);
		font-family: var(--font-mono);
		font-size: var(--fs-1);
		line-height: 1.7;
		overflow-x: auto;
	}
	.ln {
		margin: 0;
		display: flex;
		justify-content: space-between;
		gap: var(--sp-4);
		white-space: pre;
		color: var(--text);
	}
	.v {
		color: var(--text-muted);
	}
	.dim .t {
		color: var(--text-muted);
	}
	.cmd .t::before {
		content: '$ ';
		color: var(--accent);
	}
	.ok .v {
		color: var(--ok);
	}
	.err .v {
		color: var(--danger);
	}
	.caret {
		display: inline-block;
		width: 8px;
		height: 1em;
		margin-top: var(--sp-1);
		background: var(--accent);
		vertical-align: text-bottom;
		animation: blink 1.1s steps(1) infinite;
	}
	@keyframes blink {
		50% {
			opacity: 0;
		}
	}
	figcaption {
		padding: var(--sp-3) var(--sp-4);
		border-top: 1px solid var(--border);
		font-size: var(--fs-0);
		color: var(--text-muted);
	}
</style>
