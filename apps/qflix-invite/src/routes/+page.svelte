<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { buildLadder } from '$lib/ladder';
	import { payingMembers, betaSeat, tiers } from '$lib/seats';
	import { freshness, formatSize, formatCount, formatDuration } from '$lib/stats';

	let { data, form } = $props();

	const rows = buildLadder(tiers, payingMembers);

	const fresh = $derived(data.stats ? freshness(data.stats.generatedAt) : null);

	/*
	 * Whether the proof wall has anything to actually show.
	 *
	 * parseStats only guarantees generatedAt, so a collector that resolved zero
	 * libraries — say a Plex library got renamed — still yields a valid, fresh
	 * payload with every counter absent. Gating the section on `data.stats`
	 * alone rendered a heading, an empty grid and a timestamp: the page's
	 * strongest section reduced to an assertion with nothing behind it.
	 */
	const hasProof = $derived(
		!!data.stats &&
			[
				data.stats.diskBytes,
				data.stats.episodes,
				data.stats.films,
				data.stats.series,
				data.stats.requestsFulfilled,
				data.stats.medianFillMinutes,
				data.stats.monitorsTotal,
				data.stats.canaries,
				data.stats.tests,
				data.stats.apps
			].some((v) => v !== undefined)
	);

	let showDemo = $state(false);
	let sending = $state(false);

	/** Reveal the demo field and put the cursor in it. Toggles back off. */
	async function toggleDemo() {
		showDemo = !showDemo;
		if (!showDemo) return;
		await tick(); // the title field does not exist until this resolves
		const el = document.getElementById('email-closer');
		el?.focus({ preventScroll: true });
		el?.scrollIntoView({ block: 'center' });
	}
</script>

{#snippet signupForm(id: string, cta: string)}
	<form
		method="POST"
		use:enhance={() => {
			sending = true;
			return async ({ update }) => {
				await update({ reset: false });
				sending = false;
				// Without this the error paints below the fold and the page looks
				// dead: the user taps submit, nothing visibly happens.
				await tick();
				document.getElementById(id)?.scrollIntoView({ block: 'center' });
			};
		}}
	>
		<label class="sr-only" for={id}>The email you want on Plex</label>
		<input
			{id}
			name="email"
			type="email"
			inputmode="email"
			autocomplete="email"
			required
			placeholder="the email you want on Plex"
			aria-invalid={form?.error ? 'true' : undefined}
			aria-describedby={form?.error ? `${id}-err` : undefined}
		/>

		<!-- Honeypot. Named so no password manager recognises it: a field called
		     "website" gets autofilled by 1Password and Chrome, which would drop a
		     real signup and tell the visitor it succeeded. -->
		<input
			class="hp"
			name="hp_ref_2"
			type="text"
			tabindex="-1"
			autocomplete="new-password"
			aria-hidden="true"
		/>

		<!-- Carries intent explicitly so the server never has to guess it. -->
		<input type="hidden" name="kind" value={showDemo ? 'demo' : 'member'} />

		{#if showDemo}
			<label class="sr-only" for="{id}-title">One title to test with</label>
			<input
				id="{id}-title"
				name="title"
				type="text"
				required
				maxlength="120"
				placeholder="one title to test with"
			/>
		{/if}

		{#if form?.error}
			<p class="err" role="alert" id="{id}-err">{form.error}</p>
		{/if}

		<button type="submit" disabled={sending}>
			{sending ? 'Sending…' : showDemo ? 'Send me the test title' : cta}
		</button>
	</form>
{/snippet}

{#snippet thanks(kind: string)}
	<div class="done" role="status">
		{#if kind === 'demo'}
			<h2>Test library incoming.</h2>
			<p>Watch for the Plex invitation — that title will be in it.</p>
			<p>Nothing to pay. Try it on your own TV and your own internet first.</p>
		{:else}
			<h2>You're in the queue.</h2>
			<p>Watch for the Plex invitation email — accept it and you're live.</p>
			<p>I'll message you payment details.</p>
		{/if}
		<p><a href="https://qflix.quadstronix.dev">Your dashboard lives here →</a></p>
	</div>
{/snippet}

<main>
	<!-- ── Screen 1 ── everything needed to convert, above the fold ── -->
	<section class="hero">
		<h1>No ads.<br />No price hikes.<br />No selling your data.<br /><em>Ever.</em></h1>

		<p class="sub">Not a catalog. A request line. If it exists, you ask and it appears.</p>

		<!-- No confirmation here: the form lives at the close, so that is where
		     the reader is standing when it succeeds. Rendering it twice collided
		     with the headline and announced itself twice to screen readers. -->

		{#if data.stats?.diskBytes}
			<p class="glance tabular">
				{formatSize(data.stats.diskBytes)} on the shelf right now.
			</p>
		{/if}

		<!--
		  A 100svh hero with nothing below the fold reads as the whole page.
		  This is the affordance that says "keep going" — and the ask waits
		  until the evidence below has actually argued for it.
		-->
		<a class="cue" href="#proof">
			<span>{hasProof ? "See what's actually running" : 'How it actually works'}</span>
			<svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
				<path
					d="M12 4v14m0 0l-6-6m6 6l6-6"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</a>
	</section>

	<!-- ── 2 ── coverage: the argument the price can't make ── -->
	<!-- Owns the scroll-cue anchor whenever the proof wall has no data. -->
	<section class="coverage" id={hasProof ? undefined : 'proof'} tabindex="-1">
		<p>
			Netflix's catalog is different in Canada. Max drops titles on the 30th. QFlix isn't a
			catalog — <strong>you ask, it appears.</strong>
		</p>
	</section>

	<!-- ── 3 ── proof: real numbers, never rounded for effect ── -->
	{#if hasProof && data.stats}
		<section class="proof" id="proof" tabindex="-1">
			<h2>It's already running.</h2>
			<!-- Every tile is conditional. A metric that could not be measured is
			     omitted rather than shown as zero. -->
			<dl class="tabular">
				{#if data.stats.diskBytes}
					<div><dt>On disk</dt><dd>{formatSize(data.stats.diskBytes)}</dd></div>
				{/if}
				{#if data.stats.episodes}
					<div><dt>Episodes</dt><dd>{formatCount(data.stats.episodes)}</dd></div>
				{/if}
				{#if data.stats.films}
					<div><dt>Films</dt><dd>{formatCount(data.stats.films)}</dd></div>
				{/if}
				{#if data.stats.series}
					<div><dt>Series</dt><dd>{formatCount(data.stats.series)}</dd></div>
				{/if}
				{#if data.stats.requestsFulfilled}
					<div>
						<dt>Requests filled</dt>
						<dd>{formatCount(data.stats.requestsFulfilled)}</dd>
					</div>
				{/if}
				{#if data.stats.medianFillMinutes}
					<div>
						<dt>Typical wait</dt>
						<dd>{formatDuration(data.stats.medianFillMinutes)}</dd>
					</div>
				{/if}
				<!-- Presence, not truthiness: "0 of 57 up" is a real measurement and
				     the one worth showing most. Hiding it would be the only
				     dishonest omission on a page about measured honesty. -->
				{#if data.stats.monitorsUp !== undefined && data.stats.monitorsTotal}
					<div>
						<dt>Monitors up</dt>
						<dd>{data.stats.monitorsUp}/{data.stats.monitorsTotal}</dd>
					</div>
				{/if}
				<!-- "Canaries" is in-house jargon; nobody being handed a phone knows
				     what one is. Same reasoning for labelling the test count. -->
				{#if data.stats.canaries}
					<div><dt>Live checks</dt><dd>{data.stats.canaries}</dd></div>
				{/if}
				{#if data.stats.apps}
					<div><dt>Apps behind it</dt><dd>{formatCount(data.stats.apps)}</dd></div>
				{/if}
				{#if data.stats.tests}
					<div><dt>Tests passing</dt><dd>{formatCount(data.stats.tests)}</dd></div>
				{/if}
			</dl>

			<p class="wall-note">
				<strong>Apps behind it</strong> is how many moving pieces it takes to make Plex feel this
				simple — finding things, fetching them, naming them, subtitling them, keeping them tidy.
				<strong>Live checks</strong> run around the clock and prove a real request still makes it
				all the way to something you can press play on. <strong>Tests passing</strong> have to go
				green before I'm allowed to change any of it.
			</p>
			{#if fresh}
				<p class="stamp" class:stale={fresh.stale}>{fresh.label}</p>
			{/if}
		</section>
	{/if}

	<!-- ── 4 ── the operator: what the $50 actually buys ── -->
	<section class="operator">
		<h2>You're not renting a folder.</h2>
		<ul role="list">
			<!-- No number here on purpose — the live canary count in the proof wall
			     carries it, so it can never drift out of date. -->
			<li>
				<strong>Always closing gaps.</strong> Automated checks watch this thing around the clock,
				and I keep adding them.
			</li>
			<li><strong>Audited on a schedule — and at random.</strong> I go looking for breakage.</li>
			<li>
				<strong>Self-healing.</strong> If an app dies, the watchdog restarts it — three tries, backing
				off each time — and pages me either way. What it can't fix itself, I fix by hand.
			</li>
			<li>
				<strong>It gets better every week.</strong> A weekly email covers what got added, plus a
				plain-English note on what I fixed.
			</li>
			<li>
				<strong>Encrypted in transit</strong> — the same TLS your bank uses.
			</li>
		</ul>
	</section>

	<!-- ── 5 ── the ladder ── -->
	<section class="ladder">
		<!-- "filled" alone reads as "you're too late" to anyone scanning. -->
		<p class="beta">Beta seat: {betaSeat} · regular seats open</p>

		<h2>Every member unlocks the next thing.</h2>

		<!-- role=list: WebKit strips list semantics when the marker is removed,
		     and the ladder's whole effect depends on hearing "list, 5 items". -->
		<ol role="list">
			{#each rows as r (r.id)}
				<li class={r.state}>
					<span class="mark" aria-hidden="true">
						{r.state === 'achieved' ? '✓' : r.state === 'next' ? '◆' : '🔒'}
					</span>
					<!-- The glyph is hidden from assistive tech, so state has to be
					     said in words or a locked tier reads as an available one. -->
					<span class="sr-only"
						>{r.state === 'achieved' ? 'Unlocked.' : r.state === 'next' ? 'Next up.' : 'Locked.'}</span
					>
					<div>
						<h3>{r.title}</h3>
						<p>{r.detail}</p>
						{#if r.state === 'achieved' && r.reason}
							<!-- Naming what earned the rung is what makes it read as momentum. -->
							<p class="reason">{r.reason}</p>
						{/if}
						{#if r.state === 'next'}
							<p class="away">
								{r.membersAway === 1
									? 'One more member unlocks this.'
									: `${r.membersAway} more members unlock this.`}
							</p>
						{/if}
					</div>
				</li>
			{/each}
		</ol>

		<p class="always">
			Support requests are open to everyone from day one. That's not a tier and never will be.
		</p>
	</section>

	<!-- ── 6 ── demo, one honest limit ── -->
	<section class="demo">
		<h2>Not sure it'll play on your TV?</h2>
		<p>
			Name one title. I'll stand up a private library with it in it, invite you, and you can prove
			it works on your own hardware and your own internet before you pay a cent.
		</p>
		{#if !form?.ok}
			<button type="button" class="ghost" onclick={toggleDemo}>
				{showDemo ? 'Never mind — claim a seat' : 'Try one title first'}
			</button>
		{/if}

		<p class="limit">
			Occasionally something rare or same-day-new isn't findable yet. I'll tell you straight when
			that happens.
		</p>
	</section>

	<!-- ── 7 ── straight answers ── -->
	<section class="faq">
		<h2>Straight answers.</h2>

		<details>
			<summary>Which app do I use?</summary>
			<p>
				Plex — the same app everyone else uses. It's already on your TV, phone, tablet, console
				and browser, and it costs you nothing to install. You sign in with your own Plex account,
				so your watch history and your resume points are yours, on every device you own.
			</p>
		</details>

		<details>
			<summary>What if it breaks?</summary>
			<p>
				Hit <em>Report Issue</em> in the app, or just text me — either one reaches me directly,
				and there's no support org to get lost in. That's open to everyone from day one and it is
				never locked behind a tier. A lot of failures you'll never see: the watchdog restarts the
				app and pages me whether or not anyone noticed.
			</p>
		</details>

		<details>
			<summary>Is this safe?</summary>
			<p>
				Every connection is encrypted in transit — the same TLS your bank uses. You sign in
				through Plex itself, so <strong>I never see your password</strong>, and I can't: it's
				never typed into anything of mine.
			</p>
			<p>
				Your email does two things: it sends you the library invitation, and it puts you on the
				QFlix newsletter — a short weekly note on what got added and what got fixed. One click
				unsubscribes, and nothing else about your account changes.
			</p>
			<p>
				That's the whole list. It is never sold, never rented, and nothing here tracks what you
				watch in order to advertise at you — which is the easiest promise on this page to keep,
				because there's no business model here that would want it broken.
			</p>
		</details>
	</section>

	<!-- ── the close ── same ask, now that everything above has argued for it ── -->
	<section class="closer">
		{#if form?.ok}
			{@render thanks(form.kind ?? 'member')}
		{:else if showDemo}
			<h2>Try it first.</h2>
			<p class="closer-sub">
				One title, a private library, your own hardware. Nothing to pay and nothing to cancel.
			</p>
			{@render signupForm('email-closer', 'Send me the test title')}
		{:else}
			<h2>Want in?</h2>
			<!-- Price stated BEFORE the button. Reading "no card", tapping, and
			     only then learning it is $50 has the shape of a bait-and-switch
			     even though it isn't one.
			     Autopay line updated 2026-07-31: it is now a stated near-term
			     plan rather than an absence. Still "no card" TODAY, which is the
			     part that governs what a visitor is agreeing to right now. -->
			<p class="closer-sub">
				<strong>$50/month, flat.</strong> Drop the email you want on Plex — no card today,
				autopay coming this weekend.
			</p>
			{@render signupForm('email-closer', 'Claim a seat')}
			<p class="price">Cancel by telling me.</p>
		{/if}
	</section>

	<footer>
		<p>QFlix · unlisted · invitation only</p>
	</footer>
</main>

<style>
	main {
		max-width: 34rem;
		margin: 0 auto;
		padding: 0 1.15rem 3rem;
	}

	section {
		padding: 2.4rem 0;
		border-bottom: 1px solid var(--line);
	}

	/* ── hero ── sized so the field and button clear a 390x844 viewport ── */
	/* Deliberately NOT full-height. A 100svh hero buys a dramatic first
	   screen and pays for it with a page that looks like it ends. Letting the
	   proof wall break the fold is the stronger signal — the evidence is the
	   pitch, so it should be visible without being asked for. */
	.hero {
		padding: 2.6rem 0 1.9rem;
		border-bottom: 1px solid var(--line);
	}

	h1 {
		font-size: var(--step-3);
		letter-spacing: -0.035em;
	}

	h1 em {
		font-style: normal;
		color: var(--amber);
	}

	.sub {
		margin-top: 0.9rem;
		color: var(--ink-dim);
		font-size: var(--step-1);
	}

	form {
		margin-top: 1.6rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	input {
		min-height: var(--tap);
		padding: 0 0.95rem;
		font-size: 16px; /* < 16px makes iOS zoom on focus */
		color: var(--ink);
		background: var(--surface);
		/* --line is only 1.37:1 here and fails WCAG 1.4.11 — under rink glare
		   the box you need people to tap barely exists. This is 3.06:1. */
		border: 1px solid #3d5f80;
		border-radius: var(--radius);
		font-family: inherit;
	}

	input::placeholder {
		color: var(--ink-faint);
	}

	button {
		min-height: var(--tap);
		font-size: var(--step-0);
		font-weight: 700;
		font-family: inherit;
		color: #24160a;
		background: var(--amber);
		border: 0;
		border-radius: var(--radius);
		cursor: pointer;
	}

	button:hover:not(:disabled) {
		background: var(--amber-hot);
	}

	button:disabled {
		opacity: 0.6;
		cursor: default;
	}

	.ghost {
		color: var(--amber);
		background: transparent;
		border: 1px solid var(--amber);
		padding: 0 1.1rem;
		margin-top: 1rem;
	}

	.ghost:hover {
		background: rgba(255, 140, 66, 0.1);
	}

	.hp {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		opacity: 0;
	}

	.price {
		margin-top: 1.1rem;
		color: var(--ink-dim);
	}

	.price strong {
		color: var(--ink);
		font-size: var(--step-1);
	}

	.glance {
		margin-top: 1.4rem;
		color: var(--ink-faint);
		font-size: var(--step--1);
	}

	/* Scroll affordance. Sits at the bottom of the hero so the fold never
	   reads as the end of the document. */
	/* This is the primary affordance on the first screen and it was a 22px tap
	   target — below the WCAG 2.5.8 floor, aimed at cold thumbs. */
	.cue {
		margin-top: 1rem;
		min-height: var(--tap);
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding-right: 0.6rem;
		color: var(--amber);
		text-decoration: none;
		font-size: var(--step--1);
		font-weight: 600;
	}

	.cue svg {
		width: 22px;
		height: 22px;
		animation: nudge 1.8s ease-in-out infinite;
	}

	@keyframes nudge {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(7px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cue svg {
			animation: none;
		}
	}

	.err {
		color: #ff9d9d;
		font-size: var(--step--1);
	}

	.done h2 {
		font-size: var(--step-2);
		color: var(--green);
	}

	.done p {
		margin-top: 0.7rem;
		color: var(--ink-dim);
	}

	/* ── proof ── */
	h2 {
		font-size: var(--step-2);
	}

	dl {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.1rem 1rem;
		margin: 1.4rem 0 0;
	}

	dt {
		color: var(--ink-faint);
		font-size: var(--step--1);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	dd {
		margin: 0.15rem 0 0;
		font-size: var(--step-1);
		font-weight: 700;
		color: var(--sky);
	}

	.wall-note {
		margin-top: 1.4rem;
		color: var(--ink-dim);
		font-size: var(--step--1);
	}

	.wall-note strong {
		color: var(--ink);
	}

	.stamp {
		margin-top: 1.3rem;
		color: var(--ink-faint);
		font-size: var(--step--1);
	}

	.stamp.stale {
		color: var(--gold);
	}

	/* ── coverage ── */
	.coverage p {
		font-size: var(--step-1);
		color: var(--ink-dim);
	}

	.coverage strong {
		color: var(--ink);
	}

	/* ── ladder ── */
	.beta {
		color: var(--green);
		font-size: var(--step--1);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-bottom: 0.8rem;
	}

	ol {
		list-style: none;
		margin: 1.4rem 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}

	li {
		display: flex;
		gap: 0.8rem;
		padding: 0.95rem 1rem;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: var(--surface);
	}

	li.achieved {
		border-color: rgba(69, 212, 131, 0.45);
	}

	li.next {
		border-color: var(--amber);
		background: var(--surface-2);
	}

	/* Blanket opacity dropped the detail text to 4.23:1. Dim explicitly instead,
	   which keeps it legible and still clearly secondary. */
	li.locked h3,
	li.locked p {
		color: var(--ink-dim);
	}

	.mark {
		flex: none;
		width: 1.5rem;
		font-size: var(--step-0);
	}

	li.achieved .mark {
		color: var(--green);
	}

	li.next .mark {
		color: var(--amber);
	}

	li h3 {
		font-size: var(--step-0);
	}

	li p {
		margin-top: 0.25rem;
		color: var(--ink-dim);
		font-size: var(--step--1);
	}

	.reason {
		color: var(--green) !important;
	}

	.away {
		color: var(--amber) !important;
		font-weight: 600;
	}

	.always {
		margin-top: 1.3rem;
		color: var(--ink-dim);
		font-size: var(--step--1);
	}

	/* ── operator ── */
	ul {
		margin: 1.3rem 0 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	ul li {
		display: block;
		border: 0;
		background: none;
		padding: 0 0 0 1rem;
		border-left: 2px solid var(--line);
		color: var(--ink-dim);
		font-size: var(--step--1);
		border-radius: 0;
	}

	ul li strong {
		color: var(--ink);
	}

	/* ── demo + faq ── */
	.demo p {
		margin-top: 0.8rem;
		color: var(--ink-dim);
	}

	.limit {
		margin-top: 1.4rem;
		color: var(--ink-faint);
		font-size: var(--step--1);
	}

	.faq details {
		border-bottom: 1px solid var(--line);
		padding: 0.9rem 0;
	}

	/* The trailing rule read as an empty row above the section divider. */
	.faq details:last-of-type {
		border-bottom: 0;
		padding-bottom: 0;
	}

	.faq details:first-of-type {
		margin-top: 1.1rem;
		border-top: 1px solid var(--line);
	}

	summary {
		cursor: pointer;
		font-weight: 600;
		list-style-position: outside;
		/* ~48px tap target, matching --tap, at no visual cost */
		padding: 0.7rem 0;
	}

	summary::marker {
		color: var(--amber);
	}

	details p {
		margin-top: 0.6rem;
		color: var(--ink-dim);
		font-size: var(--step--1);
	}

	details p + p {
		margin-top: 0.75rem;
	}

	details strong {
		color: var(--ink);
	}

	.closer {
		border-bottom: 0;
	}

	.closer-sub {
		margin-top: 0.7rem;
		color: var(--ink-dim);
	}

	footer {
		padding-top: 2rem;
		color: var(--ink-faint);
		font-size: var(--step--1);
		text-align: center;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}
</style>
