<script lang="ts">
	import CapabilityIcon from '$lib/components/CapabilityIcon.svelte';
	import CtaBand from '$lib/components/CtaBand.svelte';
	import { capabilities } from '$lib/content/copy';
</script>

<svelte:head>
	<title>{capabilities.title}</title>
	<meta name="description" content={capabilities.description} />
</svelte:head>

<section class="section">
	<p class="eyebrow">{capabilities.eyebrow}</p>
	<h1>{capabilities.h1}</h1>
	<p class="lede">{capabilities.intro}</p>
</section>

{#each capabilities.items as c (c.id)}
	<section class="section section-divided reveal" id={c.id}>
		<span class="chip-lg"><CapabilityIcon name={c.id as 'automation' | 'platform' | 'bots' | 'fullstack'} /></span>
		<h2>{c.name}</h2>
		<p class="lede">{c.summary}</p>
		<div class="cols">
			<div>
				<h3>What you get</h3>
				<ul>
					{#each c.deliverables as d (d)}
						<li>{d}</li>
					{/each}
				</ul>
			</div>
			<div>
				<h3>How to start</h3>
				<p>{c.start}</p>
				<div class="btn-row">
					<a class="btn btn-secondary" href={c.href}>Details and intake →</a>
				</div>
			</div>
		</div>
	</section>
{/each}

<CtaBand {...capabilities.cta} />

<style>
	.cols {
		display: grid;
		gap: var(--sp-6);
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		margin-top: var(--sp-5);
		max-width: 900px;
	}
	.cols ul,
	.cols p {
		color: var(--text-muted);
		font-size: var(--fs-1);
	}
</style>
