<script lang="ts">
	import { onMount } from 'svelte';
	import { cart } from '$lib/cart.svelte';
	import { primary, utilityLinks, cartLink, cta } from '$lib/nav';
	import { site } from '$lib/content/copy';

	// Badge only after mount: SSR renders a bare "Cart" (the cart is SSR-empty),
	// so revealing the count pre-hydration would mismatch the server HTML.
	let mounted = $state(false);
	onMount(() => (mounted = true));

	// Hamburger drawer state — only reachable below the 640px breakpoint.
	let menuOpen = $state(false);
	const closeMenu = () => (menuOpen = false);

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && menuOpen) closeMenu();
	}
</script>

<svelte:window onkeydown={onKeydown} />

<header>
	<nav aria-label="Main">
		<a class="brand" href="/">
			<span class="glyph" aria-hidden="true">⬡</span>{site.name}
		</a>

		<!-- primary links: inline on desktop, inside the drawer on mobile -->
		<ul id="nav-primary" class="primary" class:open={menuOpen}>
			{#each primary as item (item.href)}
				<li><a href={item.href} onclick={closeMenu}>{item.label}</a></li>
			{/each}
			<li class="drawer-only drawer-cta">
				<a class="btn btn-primary" href={cta.href} onclick={closeMenu}>{cta.label}</a>
			</li>
			{#each utilityLinks as item (item.href)}
				<li class="drawer-only">
					<a href={item.href} rel="noopener" onclick={closeMenu}>{item.label}</a>
				</li>
			{/each}
		</ul>

		<!-- utility cluster: external proof links, desktop only -->
		<ul class="utility">
			{#each utilityLinks as item (item.href)}
				<li><a href={item.href} rel="noopener">{item.label}</a></li>
			{/each}
		</ul>

		<div class="bar-end">
			<!-- Cart never hides behind the hamburger: AC-4 wants it one click away
			     at 375px, and a drawer makes that two. -->
			<a class="cartlink" data-testid="cart-link" href={cartLink.href}>
				{cartLink.label}{#if mounted && cart.count > 0}&nbsp;({cart.count}){/if}
			</a>

			<a class="btn btn-primary header-cta" href={cta.href}>{cta.label}</a>

			<button
				class="hamburger"
				aria-label={menuOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={menuOpen}
				aria-controls="nav-primary"
				onclick={() => (menuOpen = !menuOpen)}
			>
				<span></span><span></span><span></span>
			</button>
		</div>
	</nav>
</header>

<style>
	header {
		position: sticky;
		top: 0;
		z-index: 20;
		background: var(--bg-raised);
		border-bottom: 1px solid var(--border);
	}

	nav {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--sp-5);
		max-width: var(--page);
		margin: 0 auto;
		padding: var(--sp-3) var(--sp-5);
		width: 100%;
	}

	.brand {
		font-weight: 700;
		font-size: var(--fs-3);
		color: var(--text);
		letter-spacing: -0.01em;
		flex-shrink: 0;
	}
	.brand:hover {
		color: var(--text);
		text-decoration: none;
	}
	.glyph {
		color: var(--accent);
		margin-right: var(--sp-2);
	}

	ul {
		display: flex;
		align-items: center;
		gap: var(--sp-5);
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li {
		margin: 0;
	}

	.primary {
		/* claims the slack so the utility cluster and CTA sit hard right */
		margin-right: auto;
	}
	.primary a {
		color: var(--text);
		font-size: var(--fs-1);
		font-weight: 600;
	}
	.primary a:hover {
		color: var(--accent);
		text-decoration: none;
	}

	.utility {
		gap: var(--sp-4);
		padding-right: var(--sp-5);
		border-right: 1px solid var(--border);
	}
	.utility a {
		color: var(--text-muted);
		font-size: var(--fs-0);
	}
	.utility a:hover {
		color: var(--text);
		text-decoration: none;
	}

	.bar-end {
		display: flex;
		align-items: center;
		gap: var(--sp-4);
	}

	.cartlink {
		color: var(--text);
		font-size: var(--fs-1);
		font-weight: 600;
		white-space: nowrap;
	}
	.cartlink:hover {
		color: var(--accent);
		text-decoration: none;
	}

	.header-cta {
		font-size: var(--fs-0);
		padding: var(--sp-2) var(--sp-4);
	}

	.drawer-only {
		display: none;
	}

	.hamburger {
		display: none;
		flex-direction: column;
		gap: 5px;
		background: none;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		padding: var(--sp-2);
	}
	.hamburger span {
		display: block;
		width: 20px;
		height: 2px;
		background: var(--text);
		border-radius: 1px;
	}

	/* ── mobile drawer (<640px) ────────────────────────────────────────── */
	@media (max-width: 639px) {
		nav {
			padding: var(--sp-3) var(--sp-4);
			gap: var(--sp-3);
		}
		.utility {
			/* folds into the drawer below the breakpoint */
			display: none;
		}
		.hamburger {
			display: flex;
		}
		.bar-end {
			margin-left: auto;
		}
		.header-cta {
			display: none;
		}
		.drawer-only {
			display: block;
		}

		/* Closed means display:none, not a clipped container. A max-height trick
		   still leaves the links focusable and still exposes them to a screen
		   reader — "collapsed" has to mean gone, not merely unpainted. */
		.primary {
			display: none;
			order: 3;
			width: 100%;
			margin-right: 0;
			flex-direction: column;
			align-items: stretch;
			gap: 0;
		}
		.primary.open {
			display: flex;
		}
		.primary li a {
			display: block;
			padding: var(--sp-3) 0;
			border-top: 1px solid var(--border);
		}
		/* The CTA is a button, not a drawer row. `.primary a` outranks
		   `.btn-primary` on specificity, so restate both padding and ink here or
		   the label renders as plain white on amber. */
		.primary .drawer-cta a {
			display: flex;
			justify-content: center;
			padding: var(--sp-3) var(--sp-5);
			margin: var(--sp-3) 0;
			border-top: 0;
			color: var(--accent-ink);
		}
	}
</style>
