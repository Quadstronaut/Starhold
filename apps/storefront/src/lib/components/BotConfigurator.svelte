<script lang="ts">
	import { BOT_FEATURES, OPS_FEATURES, LIVE_FEATURES, type BotCategory } from '$lib/bot-features';
	import { cart } from '$lib/cart.svelte';

	let {
		monthlyUsd,
		opsPackUsd,
		pipelineMode = false
	}: { monthlyUsd: number; opsPackUsd: number; pipelineMode?: boolean } = $props();

	let server = $state('');
	let selected = $state<string[]>([]);
	let justAdded = $state(false);

	// page grouping order; the ops group is the only one that adds to the price
	const GROUPS: { key: BotCategory; label: string }[] = [
		{ key: 'community', label: 'Community' },
		{ key: 'automation', label: 'Automation & Integrations' },
		{ key: 'ops', label: 'Ops Pack' },
		{ key: 'custom', label: 'Custom Commands' }
	];
	// In pipeline mode the configurator sells only the live Proven Pack; non-live
	// features stay defined (wire-ID safety) but are hidden.
	const featuresByCat = (c: BotCategory) =>
		BOT_FEATURES.filter((f) => f.category === c && (!pipelineMode || LIVE_FEATURES.has(f.id)));

	// a bot carrying any ops feature pays the flat +$9 pack on top of the $5 base
	const hasOps = $derived(selected.some((id) => OPS_FEATURES.has(id)));
	const price = $derived(monthlyUsd + (hasOps ? opsPackUsd : 0));

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

	{#each GROUPS as g (g.key)}
		{#if featuresByCat(g.key).length > 0}
			<fieldset class:ops={g.key === 'ops'}>
				<legend class="eyebrow">
					{g.label}
					{#if g.key === 'ops'}<span class="opsbadge">+${opsPackUsd}/mo</span>{/if}
				</legend>
				{#each featuresByCat(g.key) as f (f.id)}
					<label class="feature">
						<input type="checkbox" checked={selected.includes(f.id)} onchange={() => toggle(f.id)} />
						<span><strong>{f.name}</strong> — {f.blurb}</span>
					</label>
				{/each}
			</fieldset>
		{/if}
	{/each}

	<button class="btn btn-primary" disabled={selected.length === 0} onclick={add}>
		Add to cart — ${price}/mo{#if hasOps}<span class="opshint"> (${monthlyUsd} base + ${opsPackUsd} Ops Pack)</span>{/if}
	</button>
	{#if justAdded}
		<p class="added">Added. <a href="/cart">Go to cart →</a></p>
	{/if}
</div>

<style>
	.configurator { display: grid; gap: var(--sp-4); margin-top: var(--sp-5); max-width: 560px; }
	.field { display: grid; gap: var(--sp-2); }
	.field em { text-transform: none; letter-spacing: 0; }
	.field input {
		background: var(--bg); border: 1px solid var(--border); color: var(--text);
		padding: var(--sp-2); border-radius: var(--radius-sm); font-family: inherit; font-size: var(--fs-1);
	}
	fieldset { border: 1px solid var(--border); border-radius: var(--radius-sm); display: grid; gap: var(--sp-2); padding: var(--sp-3); }
	fieldset.ops { border-color: var(--accent); }
	.opsbadge { color: var(--accent); margin-left: var(--sp-2); }
	.opshint { color: var(--accent-ink); font-weight: 400; }
	.feature { display: flex; gap: var(--sp-3); align-items: baseline; font-size: var(--fs-1); cursor: pointer; }
	.feature span { color: var(--text-muted); }
	.feature strong { color: var(--text); }
	.btn:disabled { opacity: 0.45; cursor: not-allowed; }
	.added { font-size: var(--fs-0); color: var(--text-muted); }
	.added a { color: var(--accent); }
</style>
