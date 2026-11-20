<script lang="ts">
	import { primary, cta, accountLinks } from '#lib/nav.js';
	import Brand from '#lib/components/Brand.svelte';

	// Hamburger drawer state — only reachable below the 900px breakpoint.
	let menuOpen = $state(false);
	const closeMenu = () => (menuOpen = false);

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && menuOpen) closeMenu();
	}
</script>

<svelte:window onkeydown={onKeydown} />

<header>
	<nav aria-label="Main">
		<Brand />

		<!-- One link per audience, then Pricing · Products · Docs: inline on desktop,
		     inside the drawer below 900px. -->
		<ul id="nav-primary" class="primary" class:open={menuOpen}>
			{#each primary as item (item.href)}
				<li>
					<a href={item.href} rel={item.external ? 'noopener' : undefined} onclick={closeMenu}>{item.label}</a>
				</li>
			{/each}
		</ul>

		<button
			class="hamburger"
			aria-label={menuOpen ? 'Close menu' : 'Open menu'}
			aria-expanded={menuOpen}
			aria-controls="nav-primary"
			onclick={() => (menuOpen = !menuOpen)}
		>
			<span></span><span></span><span></span>
		</button>

		<!-- STAR-299: the two entry buttons are always on screen, never behind the menu.
		     Beside the links on desktop; their own full-width row on phones and tablets.
		     Before launch there is no sign-in, so the one invite button takes their place. -->
		<div class="entry" class:pair={!!accountLinks} data-testid="header-entry">
			{#if accountLinks}
				<a class="btn btn-primary" href={accountLinks.create.href} rel="noopener">{accountLinks.create.label}</a>
				<a class="btn btn-secondary" href={accountLinks.signIn.href} rel="noopener">{accountLinks.signIn.label}</a>
			{:else}
				<a class="btn btn-primary" href={cta.href}>{cta.label}</a>
			{/if}
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
		gap: var(--sp-3) var(--sp-5);
		max-width: var(--page);
		margin: 0 auto;
		padding: var(--sp-3) var(--sp-5);
		width: 100%;
	}

	ul {
		display: flex;
		align-items: center;
		gap: var(--sp-4);
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li {
		margin: 0;
	}

	.primary {
		/* claims the slack so the entry buttons sit hard right */
		margin-right: auto;
	}
	.primary a {
		color: var(--text);
		font-size: var(--fs-1);
		font-weight: 600;
		white-space: nowrap;
	}
	.primary a:hover {
		color: var(--accent);
		text-decoration: none;
	}

	.entry {
		display: flex;
		align-items: center;
		gap: var(--sp-2);
	}
	.entry .btn {
		font-size: var(--fs-0);
		padding: var(--sp-2) var(--sp-4);
		white-space: nowrap;
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

	/* ── phones and tablets (<900px): menu button, entry row, drawer ───── */
	@media (max-width: 899px) {
		nav {
			padding: var(--sp-3) var(--sp-4);
		}
		.hamburger {
			display: flex;
			margin-left: auto;
		}
		/* The entry buttons get the full width under the logo, one column each. */
		.entry {
			order: 3;
			width: 100%;
		}
		.entry.pair {
			display: grid;
			grid-template-columns: 1fr 1fr;
		}
		.entry .btn {
			width: 100%;
			font-size: var(--fs-1);
		}

		/* Closed means display:none, not a clipped container. A max-height trick
		   still leaves the links focusable and still exposes them to a screen
		   reader — "collapsed" has to mean gone, not merely unpainted. */
		.primary {
			display: none;
			order: 4;
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
	}
</style>
