<script lang="ts">
	// One small block of plain lines shown directly under a form (STAR-145, Q48).
	let { lines }: { lines: string[] } = $props();
</script>

<div class="notice">
	{#each lines as line (line)}<p>{line}</p>{/each}
</div>

<style>
	.notice {
		max-width: 520px;
		margin-top: var(--sp-3);
		font-size: 0.875rem;
		color: var(--muted, inherit);
	}
	p {
		margin: 0 0 var(--sp-1);
	}
</style>
