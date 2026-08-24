<script lang="ts">
	import { BOT_FEATURES } from '$lib/bot-features';
	import { cart } from '$lib/cart.svelte';

	let { monthlyUsd }: { monthlyUsd: number } = $props();

	let server = $state('');
	let selected = $state<string[]>([]);
	let justAdded = $state(false);

	function toggle(id: string) {
		selected = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
	}

	function add() {
		cart.add({ server: server.trim(), features: [...selected] });
		server = '';
		selected = [];
		justAdded = true;
		setTimeout(() => (justAdded = false), 4000);
	}
</script>

<div class="card configurator">
	<p class="eyebrow">Build sheet</p>
	<label class="field">
		<span class="eyebrow">Server name <em>(optional)</em></span>
		<input bind:value={server} maxlength="80" placeholder="e.g. The Lounge" />
	</label>
	<fieldset>
		<legend class="eyebrow">Features</legend>
		{#each BOT_FEATURES as f (f.id)}
			<label class="feature">
				<input
					class="check"
					type="checkbox"
					checked={selected.includes(f.id)}
					onchange={() => toggle(f.id)}
				/>
				<span><strong>{f.name}</strong> — {f.blurb}</span>
			</label>
		{/each}
	</fieldset>
	<button class="btn btn-primary" disabled={selected.length === 0} onclick={add}>
		Add to cart — ${monthlyUsd}/mo
	</button>
	{#if justAdded}
		<p class="added">Added. <a href="/cart">Go to cart →</a></p>
	{/if}
</div>

<style>
	.configurator {
		display: grid;
		gap: var(--sp-4);
		margin-top: var(--sp-5);
		max-width: 560px;
	}
	.field {
		display: grid;
		gap: var(--sp-1);
	}
	.field em {
		text-transform: none;
		letter-spacing: 0;
	}
	fieldset {
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		display: grid;
		gap: var(--sp-3);
		padding: var(--sp-4);
		margin: 0;
	}
	.feature {
		display: flex;
		gap: var(--sp-3);
		align-items: baseline;
		font-size: var(--fs-1);
		cursor: pointer;
	}
	.feature span {
		color: var(--text-muted);
	}
	.feature strong {
		color: var(--text);
	}
	.check {
		width: auto;
		flex-shrink: 0;
	}
	.btn {
		justify-self: start;
	}
	.added {
		font-size: var(--fs-1);
		color: var(--text-muted);
		margin: 0;
	}
</style>
