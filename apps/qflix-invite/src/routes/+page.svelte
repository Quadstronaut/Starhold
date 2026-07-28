<script lang="ts">
	import { enhance } from '$app/forms';
	import { buildLadder } from '$lib/ladder';
	import { payingMembers, betaSeat, tiers } from '$lib/seats';
	import { freshness, formatSize, formatCount, formatDuration } from '$lib/stats';

	let { data, form } = $props();

	const rows = buildLadder(tiers, payingMembers);
	const nextTier = rows.find((r) => r.state === 'next');

	const fresh = $derived(data.stats ? freshness(data.stats.generatedAt) : null);

	let showDemo = $state(false);
	let sending = $state(false);

	/** Focus the closing form — used by the demo button. */
	function focusCloser() {
		showDemo = true;
		const el = document.getElementById('email-closer');
		el?.scrollIntoView({ block: 'center' });
		el?.focus();
	}
</script>

<!--
  The form appears twice: once above the fold for people who arrive already
  sold (they scanned a QR after being pitched in person — they are not cold
  traffic), and once at the close for people who needed the proof first.
-->
{#snippet signupForm(id: string, cta: string)}
	<form
		method="POST"
		use:enhance={() => {
			sending = true;
			return async ({ update }) => {
				await update();
				sending = false;
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
		/>

		<!-- honeypot: off-screen, no label, never tabbable -->
		<input class="hp" name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" />

		{#if showDemo}
			<label class="sr-only" for="{id}-title">One title to test with</label>
			<input id="{id}-title" name="title" type="text" placeholder="one title to test with" />
		{/if}

		<button type="submit" disabled={sending}>
			{sending ? 'Sending…' : showDemo ? 'Send me the test title' : cta}
		</button>

		{#if form?.error}
			<p class="err" role="alert">{form.error}</p>
		{/if}
	</form>
{/snippet}

{#snippet thanks()}
	<div class="done" role="status">
		<h2>You're in the queue.</h2>
		<p>Watch for the Plex invitation email — accept it and you're live.</p>
		<p>I'll message you payment details.</p>
		<p><a href="https://qflix.quadstronix.dev">Your dashboard lives here →</a></p>
	</div>
{/snippet}

<main>
	<!-- ── Screen 1 ── everything needed to convert, above the fold ── -->
	<section class="hero">
		<h1>No ads.<br />No price hikes.<br />No selling your data.<br /><em>Ever.</em></h1>

		<p class="sub">Not a catalog. A request line. Everything on demand.</p>

		{#if form?.ok}
			{@render thanks()}
		{/if}

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
			<span>See what's actually running</span>
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
	<section class="coverage" id={data.stats ? undefined : 'proof'}>
		<p>
			Netflix's catalog is different in Canada. Max drops titles on the 30th. QFlix isn't a
			catalog — <strong>you ask, it appears.</strong>
		</p>
	</section>

	<!-- ── 3 ── proof: real numbers, never rounded for effect ── -->
	{#if data.stats}
		<section class="proof" id="proof">
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
				{#if data.stats.monitorsUp && data.stats.monitorsTotal}
					<div>
						<dt>Monitors up</dt>
						<dd>{data.stats.monitorsUp}/{data.stats.monitorsTotal}</dd>
					</div>
				{/if}
				{#if data.stats.canaries}
					<div><dt>Canaries</dt><dd>{data.stats.canaries}</dd></div>
				{/if}
			</dl>
			{#if fresh}
				<p class="stamp" class:stale={fresh.stale}>{fresh.label}</p>
			{/if}
		</section>
	{/if}

	<!-- ── 4 ── the operator: what the $50 actually buys ── -->
	<section class="operator">
		<h2>You're not renting a folder.</h2>
		<ul>
			<li><strong>Always closing gaps.</strong> I added another canary this week.</li>
			<li><strong>Audited on a schedule — and at random.</strong> I go looking for breakage.</li>
			<li>
				<strong>Self-healing.</strong> Monitors catch a failure, recovery fires, my phone buzzes.
				Most breaks are fixed before anyone notices.
			</li>
			<li>
				<strong>It gets better every week.</strong> There's a newsletter that says exactly what
				changed.
			</li>
			<li>
				<strong>Encrypted end to end in transit</strong> — the same TLS your bank uses.
			</li>
		</ul>
	</section>

	<!-- ── 5 ── the ladder ── -->
	<section class="ladder">
		<p class="beta">Beta seat: {betaSeat}</p>

		<h2>Every member unlocks the next thing.</h2>

		<ol>
			{#each rows as r (r.id)}
				<li class={r.state}>
					<span class="mark" aria-hidden="true">
						{r.state === 'achieved' ? '✓' : r.state === 'next' ? '◆' : '🔒'}
					</span>
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
			<button type="button" class="ghost" onclick={focusCloser}>Try one title first</button>
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
				Open a support request and it comes straight to me — no ticket queue, no bot. That's open
				to everyone from day one and it is never locked behind a tier. Most failures never reach
				you anyway: monitors catch them, recovery fires on its own, and my phone buzzes whether
				or not anyone noticed.
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
			{@render thanks()}
		{:else}
			<h2>Want in?</h2>
			<p class="closer-sub">
				Drop the email you want on Plex. No card, no autopay — that isn't even built yet.
			</p>
			{@render signupForm('email-closer', 'Claim a seat')}
			<p class="price"><strong>$50</strong>/month. Flat. Cancel by telling me.</p>
		{/if}
	</section>

	<footer>
		<p>QFlix · private · invitation only</p>
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
		border: 1px solid var(--line);
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
	.cue {
		margin-top: 1.5rem;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
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

	li.locked {
		opacity: 0.62;
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
