<script lang="ts">
	import { onMount } from 'svelte';
	import { home } from '#lib/content/copy.js';
	import { AUDIENCES, audienceHref, productRows } from '#lib/content/catalog.js';
	import ProductCard from '#lib/components/ProductCard.svelte';

	// STAR-299 (operator ruling 2026-11-19): two views of the same product list on the same
	// page, and the visitor chooses.
	//   #by-audience   one section per entry in AUDIENCES
	//   #all-products  one table of every product
	// Both views are in the server HTML, so without JavaScript they simply show one after
	// the other and the two options are plain links that jump to each. With JavaScript the
	// switch shows one at a time, remembers the choice (localStorage, guarded) and puts it in
	// the URL hash, so a link can point at either view. The switch is sticky while this part
	// of the page is on screen.
	const VIEWS = ['by-audience', 'all-products'] as const;
	type View = (typeof VIEWS)[number];
	const KEY = 'starhold-product-view';
	const isView = (v: string | null): v is View => VIEWS.includes(v as View);

	const rows = productRows();
	const labels: Record<View, string> = { 'by-audience': home.work.views.audience, 'all-products': home.work.views.everything };

	let enhanced = $state(false);
	let view = $state<View>('by-audience');
	let root: HTMLElement | undefined = $state();
	const links: Partial<Record<View, HTMLAnchorElement>> = {};

	function headerHeight(): number {
		return document.querySelector('header')?.getBoundingClientRect().height ?? 0;
	}

	function choose(v: View, o: { save?: boolean; hash?: boolean; reveal?: 'always' | 'if-above' } = {}) {
		view = v;
		if (o.save) {
			try {
				localStorage.setItem(KEY, v);
			} catch {
				// private mode or blocked storage: the hash still carries the choice
			}
		}
		if (o.hash) history.replaceState(history.state, '', '#' + v);
		// If the visitor is deep in the old view, bring the top of the new one back under the switch.
		const section = root?.closest('section');
		if (section && (o.reveal === 'always' || (o.reveal === 'if-above' && section.getBoundingClientRect().top < headerHeight())))
			section.scrollIntoView({ behavior: 'instant', block: 'start' });
	}

	function onClick(e: MouseEvent, v: View) {
		e.preventDefault();
		choose(v, { save: true, hash: true, reveal: 'if-above' });
	}

	// Left and right arrows move between the two options, as on any two-way switch.
	function onKeydown(e: KeyboardEvent) {
		const i = VIEWS.indexOf(view);
		const next = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? VIEWS[(i + 1) % VIEWS.length] : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? VIEWS[(i + VIEWS.length - 1) % VIEWS.length] : null;
		if (!next) return;
		e.preventDefault();
		choose(next, { save: true, hash: true, reveal: 'if-above' });
		links[next]?.focus();
	}

	onMount(() => {
		// The switch sticks just under the site header, whatever height that is at this width.
		const measure = () => root?.style.setProperty('--switch-top', Math.round(headerHeight()) + 'px');
		measure();
		window.addEventListener('resize', measure);

		// The link wins over the remembered choice; the remembered choice wins over the default.
		const fromHash = () => {
			const h = location.hash.slice(1);
			if (isView(h)) choose(h, { save: true, reveal: 'always' });
			return isView(h);
		};
		if (!fromHash()) {
			let remembered: string | null = null;
			try {
				remembered = localStorage.getItem(KEY);
			} catch {
				// no storage: keep the default
			}
			if (isView(remembered)) view = remembered;
		}
		enhanced = true;
		window.addEventListener('hashchange', fromHash);
		return () => {
			window.removeEventListener('resize', measure);
			window.removeEventListener('hashchange', fromHash);
		};
	});
</script>

<div class="views" class:enhanced bind:this={root}>
	<div class="switch-wrap">
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div class="switch" role="group" aria-label={home.work.views.label} onkeydown={onKeydown} data-testid="view-switch">
			{#each VIEWS as v (v)}
				<a href={'#' + v} bind:this={links[v]} aria-current={enhanced && view === v ? 'true' : undefined} onclick={(e) => onClick(e, v)}>{labels[v]}</a>
			{/each}
		</div>
	</div>

	<div class="view" id="by-audience" class:off={enhanced && view !== 'by-audience'}>
		<p class="view-title">{labels['by-audience']}</p>
		{#each AUDIENCES as a (a.id)}
			<div class="audience" data-audience={a.id}>
				<p class="who">{a.label}</p>
				<h3>{a.heading}</h3>
				<p class="intro">{a.intro}</p>
				<div class="grid-2">
					{#each a.items as item (item.service)}
						<ProductCard {item} />
					{/each}
				</div>
				<p class="more"><a href={audienceHref(a)}>More for {a.label.toLowerCase()} →</a></p>
			</div>
		{/each}
	</div>

	<div class="view" id="all-products" class:off={enhanced && view !== 'all-products'}>
		<p class="view-title">{labels['all-products']}</p>
		<div class="table-scroll">
			<table class="all">
				<thead>
					<tr>
						<th scope="col">Product</th>
						<th scope="col">What it does</th>
						<th scope="col">Who it’s for</th>
						<th scope="col">Free tier</th>
						<th scope="col">Starts at</th>
						<th scope="col">Link</th>
					</tr>
				</thead>
				<tbody>
					{#each rows as r (r.id)}
						<tr data-product={r.id}>
							<th scope="row">
								{r.name}
								{#if r.status}<span class="tag">{r.status}</span>{/if}
							</th>
							<td data-l="What it does" data-price={r.id === 'suite' ? '' : undefined}>{r.does}</td>
							<td data-l="Who it’s for">
								{#each r.audiences as label (label)}<span class="tag who-tag">{label}</span>{/each}
							</td>
							<td data-l="Free tier" class:yes={r.free === 'Yes'}>{r.free}</td>
							<td data-l="Starts at" class="nowrap" data-price>{r.startsAt}</td>
							<td data-l="Link" class="linkcell">
								{#if r.link}
									<a href={r.link.href} rel={r.link.external ? 'noopener' : undefined}>{r.link.label} →</a>
								{:else}
									{r.closed}
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>

<style>
	.views {
		--switch-top: var(--header-h);
		margin-top: var(--sp-5);
	}
	/* The two-option switch. Sticky under the header for as long as the products
	   section is on screen, so changing view never means scrolling back up. */
	.switch-wrap {
		position: sticky;
		top: var(--switch-top);
		z-index: 10;
		background: var(--bg);
		border-bottom: 1px solid var(--border);
		padding: var(--sp-3) 0;
	}
	.switch {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 3px;
		width: 100%;
		max-width: 420px;
		padding: 3px;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-pill);
		background: var(--surface-2);
	}
	.switch a {
		display: block;
		text-align: center;
		padding: var(--sp-2) var(--sp-3);
		border-radius: var(--radius-pill);
		color: var(--text);
		font-size: var(--fs-1);
		font-weight: 600;
		white-space: nowrap;
	}
	.switch a:hover {
		color: var(--accent-hover);
		text-decoration: none;
	}
	.switch a[aria-current='true'],
	.switch a[aria-current='true']:hover {
		background: var(--accent);
		color: var(--accent-ink);
	}
	.switch a:focus-visible {
		border-radius: var(--radius-pill);
	}

	/* Anchored views must land below the header and the switch. */
	.view {
		margin-top: var(--sp-6);
		scroll-margin-top: calc(var(--switch-top) + var(--sp-8));
	}
	.view + .view {
		margin-top: var(--sp-8);
	}
	.enhanced .view.off {
		display: none;
	}
	.enhanced .view {
		margin-top: var(--sp-5);
	}
	/* With the switch working, the view titles would only repeat its labels. */
	.view-title {
		font-size: var(--fs-4);
		font-weight: 650;
		color: var(--text);
		margin: 0 0 var(--sp-4);
	}
	.enhanced .view-title {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.audience + .audience {
		margin-top: var(--sp-7);
	}
	.who {
		font-family: var(--font-mono);
		font-size: var(--fs-0);
		color: var(--accent);
		margin: 0 0 var(--sp-1);
	}
	.audience h3 {
		font-size: var(--fs-4);
	}
	.intro {
		color: var(--text-muted);
		max-width: var(--measure);
	}
	.more {
		margin: var(--sp-4) 0 0;
		font-size: var(--fs-1);
		font-weight: 600;
	}

	/* The Everything table. From 641 px it scrolls inside its own box if it does not fit;
	   at 640 px and under each row becomes a small stacked block. The page never scrolls sideways. */
	.table-scroll {
		overflow-x: auto;
	}
	.all {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--fs-1);
	}
	.all th,
	.all td {
		text-align: left;
		vertical-align: top;
		padding: var(--sp-3);
		border-bottom: 1px solid var(--border);
	}
	.all thead th {
		font-family: var(--font-mono);
		font-size: var(--fs-0);
		font-weight: 400;
		color: var(--text-muted);
	}
	.all tbody th {
		color: var(--text);
		font-weight: 600;
		white-space: nowrap;
	}
	.all tbody th .tag {
		display: flex;
		width: max-content;
		margin-top: var(--sp-1);
		color: var(--text-muted);
	}
	.all td {
		color: var(--text-muted);
	}
	.all .yes {
		color: var(--ok);
	}
	.all .who-tag {
		margin: 0 var(--sp-1) var(--sp-1) 0;
		color: var(--text-muted);
	}
	.all .linkcell a {
		font-weight: 600;
	}
	@media (min-width: 641px) {
		.all {
			min-width: 820px;
		}
		.all .nowrap {
			white-space: nowrap;
		}
	}
	@media (max-width: 640px) {
		.all thead {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip-path: inset(50%);
		}
		.all,
		.all tbody,
		.all tr,
		.all th,
		.all td {
			display: block;
			width: 100%;
		}
		.all tr {
			padding: var(--sp-3) 0;
			border-bottom: 1px solid var(--border);
		}
		.all th,
		.all td {
			border: 0;
			padding: 2px 0;
		}
		.all tbody th {
			white-space: normal;
			font-size: var(--fs-2);
		}
		.all td[data-l]::before {
			content: attr(data-l) ': ';
			font-family: var(--font-mono);
			font-size: var(--fs-0);
			color: var(--text-muted);
		}
	}
</style>
