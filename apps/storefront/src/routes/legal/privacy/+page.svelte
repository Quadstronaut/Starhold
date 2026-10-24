<svelte:head><title>Privacy Policy · Starhold</title></svelte:head>

<section class="section legal">
	<div class="label">Last updated 2026-10-24</div>
	<h1>Privacy Policy</h1>

	<p>This policy says what personal data Starhold collects, why, on what legal basis, who receives it, how long we keep it, and how to use your rights. It covers the Starhold Account, our websites (starhold.dev, starhold.fyi, starhold.app), the contact form and our Discord server. Each product has its own privacy notice for what it adds. Umbermark, in early access with paid plans through Polar, is one of them.</p>

	<h2>1. Who is responsible</h2>
	<p>Starhold is the trade name of <strong>Copper Jerky LLC</strong>, an Arizona limited liability company ("Starhold", "we", "us"). We are the controller of the data described here.</p>
	<ul>
		<li>Postal address: available on request at <a href="mailto:legal@starhold.dev">legal@starhold.dev</a> until our registered business address is published.</li>
		<li>Email for any privacy question or request: <a href="mailto:hello@starhold.dev">hello@starhold.dev</a></li>
	</ul>

	<h2>2. Our approach</h2>
	<p>We keep only what each service needs, for a stated period, and delete it automatically after that. We never sell your data, and we are not authorized to. We use no third-party tracking and no per-person behaviour analytics. We keep a limited set of first-party operational counts, described below.</p>
	<p>Two words we use carefully:</p>
	<ul>
		<li><strong>Anonymous</strong> means we cannot tie it to a person, even by looking it up. Our daily visit tallies are anonymous.</li>
		<li><strong>Pseudonymous</strong> means it is tied to a code, such as a keyed hash of an IP address, instead of your name. We still treat it as personal data.</li>
	</ul>
	<p>Our sites set no cookies. We keep no request logs. Error logs can contain your IP for up to 30 days. Sign-in abuse limiting uses a keyed hash of your IP for 7 days. Admin access to account data through our tools is logged; that log is about us, not you.</p>

	<h2>3. What we collect, why, and our legal basis</h2>
	<table>
		<thead>
			<tr><th>What</th><th>Why</th><th>Legal basis</th></tr>
		</thead>
		<tbody>
			<tr><td>Anonymous per-day tallies of page path and status code. The query string is removed and paths are normalized. No IP address, no browser details.</td><td>Count visits for operations and debugging.</td><td>Legitimate interests (running and fixing the service)</td></tr>
			<tr><td>Error logs, which may include your IP address.</td><td>Find and fix failures.</td><td>Legitimate interests</td></tr>
			<tr><td>Abuse-prevention records: a keyed hash of your IP address (pseudonymous).</td><td>Stop abuse of free tools.</td><td>Legitimate interests</td></tr>
			<tr><td>Your IP address, held in memory only.</td><td>Spam control on forms.</td><td>Legitimate interests</td></tr>
			<tr><td>Contact messages: your name, email and message.</td><td>Answer you.</td><td>Legitimate interests (replying to you)</td></tr>
			<tr><td>Invite requests.</td><td>Handle your request for an invitation.</td><td>Consent</td></tr>
			<tr><td>Email for the QNix notice.</td><td>Send one email when QNix opens.</td><td>Consent</td></tr>
			<tr><td>Starhold Account details (email, sign-in, plan), once the Account opens.</td><td>Run your account.</td><td>Contract</td></tr>
			<tr><td>Purchase record: amount, date, provider reference. No content.</td><td>Keep the books and meet tax law.</td><td>Legal obligation</td></tr>
			<tr><td>Patreon membership status, if you back our work.</td><td>Know who has backed the work.</td><td>Consent</td></tr>
			<tr><td>Backups of the above.</td><td>Recover from disk or host loss.</td><td>Legitimate interests</td></tr>
		</tbody>
	</table>
		<h3>Shush and Starbot, as built today</h3>
	<p>These two services are not written up in full yet. This is what they hold as built today, not a promise about how they will work.</p>
	<table>
		<thead>
			<tr><th>Service</th><th>What it holds today</th><th>Kept for</th></tr>
		</thead>
		<tbody>
			<tr><td>Shush</td><td>Your Discord id, banned words you triggered, death times, word counts and points. Message ids are kept for reference, never message content. Your Discord display name and dates appear on the public list.</td><td>Game data rolls per round. Names stay on the public list until you ask us to remove them (hello@starhold.dev or /hide-me when it ships). A 30-day automatic expiry is in development.</td></tr>
			<tr><td>Shush</td><td>Help-desk tickets: your Discord id, subject and open and close times. The messages live in a private Discord thread.</td><td>No fixed period yet. Ask and we delete it by hand.</td></tr>
			<tr><td>Starbot</td><td>Server settings and Discord ids the bot features need to work. Contact notices in intake channels.</td><td>No fixed period yet. A 12-month automatic purge of contact notices is not built. Ask and we delete it by hand.</td></tr>
		</tbody>
	</table>
	<p>Where the basis is consent, you can withdraw it at any time. Withdrawing does not affect what we did before. You do not have to give us any of this, but without it we cannot do the thing it is for.</p>

	<h2>4. Who receives data</h2>
	<p>We do not sell or rent data, and we do not share it for advertising. These are the outside services we use today. We list only services that are actually in use.</p>
	<table>
		<thead>
			<tr><th>Recipient</th><th>Role and data</th><th>Transfer mechanism</th></tr>
		</thead>
		<tbody>
			<tr><td>Discord</td><td>Our Discord server and apps. It receives the ticket notice for a contact message, and whatever you post in Discord, under <a href="https://discord.com/privacy" target="_blank" rel="noopener">Discord's Privacy Policy</a>.</td><td>Processor's standard contractual terms (see section 5)</td></tr>
			<tr><td>Polar</td><td>Payment provider and merchant of record for sales. It takes your payment and keeps its own records, under <a href="https://polar.sh/legal/privacy" target="_blank" rel="noopener">its privacy policy</a>. We keep only the order reference and plan.</td><td>Processor's standard contractual terms (see section 5)</td></tr>
			<tr><td>Patreon</td><td>Payment platform for people who choose to back our work. We receive your membership status from it. Backing buys no perks.</td><td>Processor's standard contractual terms (see section 5)</td></tr>
			<tr><td>Backblaze B2</td><td>Off-site storage of backups.</td><td>Processor's standard contractual terms (see section 5)</td></tr>
			<tr><td>OVH</td><td>Hosting. We rent the servers our services run on and administer them ourselves.</td><td>Processor's standard contractual terms (see section 5)</td></tr>
		</tbody>
	</table>
	<!-- VENDOR-STUB: email provider -->
	<p>We do not send email yet. When QNix opens we will email you once, through a provider we will name on this page first.</p>
	<p>We also share data when the law requires it through valid legal process, or when needed to protect our rights, our users or the public.</p>

	<h2>5. Where data is stored</h2>
	<p>Data is stored in the United States, and we operate from Arizona. If you are outside the United States, your data is transferred there. Transfers to our US processors rely on each processor's standard contractual terms; we are completing our transfer documentation with counsel.</p>

	<h2>6. How long we keep it</h2>
	<p>Each period has a start, shown here.</p>
	<table>
		<thead>
			<tr><th>Data</th><th>Kept for</th><th>Clock starts</th></tr>
		</thead>
		<tbody>
			<tr><td>Usage counts (anonymous)</td><td>90 days</td><td>The day of the tally</td></tr>
			<tr><td>Abuse-prevention records</td><td>1 year</td><td>Record created</td></tr>
			<tr><td>Error logs</td><td>30 days</td><td>Log line written</td></tr>
			<tr><td>Backups</td><td>Deleted data leaves backups within 30 days</td><td>Deletion from live data</td></tr>
			<tr><td>Free scan reports</td><td>30 days</td><td>Report created</td></tr>
			<tr><td>Paid reports, unclaimed</td><td>3 months, or until you delete it</td><td>Payment. A report claimed into an account lives with the account.</td></tr>
			<tr><td>Contact messages</td><td>90 days after we close the conversation, and never more than 12 months from receipt</td><td>Conversation closed; message received</td></tr>
			<tr><td>QNix notice list</td><td>Until the one notice is sent, or 24 months if QNix has not opened</td><td>Form submitted</td></tr>
			<tr><td>Purchase record</td><td>As tax law requires, up to 7 years</td><td>Payment</td></tr>
		</tbody>
	</table>
	<p>Spam-control IP addresses are held in memory for 10 minutes and are lost on restart.</p>

	<h2>7. Deleting your data</h2>
	<p>Deletion works in three layers.</p>
	<ol>
		<li>Live data is gone at once. Keys and sessions stop working.</li>
		<li>Backups drop it within 30 days.</li>
		<li>Only the bare purchase record (amount, date, provider reference, no content) is kept, as tax law requires, for up to 7 years.</li>
	</ol>
	<p>Until Starhold Account exists, export and delete are by request to <a href="mailto:privacy@starhold.dev">privacy@starhold.dev</a>, done by hand within 30 days. Every destructive action asks you to confirm first.</p>

	<h2>8. The contact form and QNix notice</h2>
	<p>Your message is encrypted with a public key before it is stored; only an offline key held by the operator can read it. Discord receives only the ticket number and the service name, in a short notice reading "New invite request #id · product", with no message body and no email address. We delete the stored message 90 days after we close the conversation, and never later than 12 months after we received it. Our backups drop it within 30 days after that. Discord keeps its own copy of the short notice under its policy. Please do not send passwords or secrets in a message.</p>
	<p>If you ask to be told when QNix opens, we store your email address encrypted. We send you one notice, then delete the address. If QNix has not opened after 24 months, we delete it anyway.</p>

	<h2>9. Our access to your account</h2>
	<p>We never ask for your password, never send sign-in links by hand, and never look at your account unless you ask us to or the law requires it. Any access is logged. That log is about us, not you (see section 2). No sign-in is open today.</p>

	<h2>10. Your rights and how to use them</h2>
	<p>Wherever you live, you can ask us to:</p>
	<ul>
		<li>tell you what we hold about you and give you a copy;</li>
		<li>correct it;</li>
		<li>delete it;</li>
		<li>restrict or stop how we use it, or object to a use based on legitimate interests;</li>
		<li>give you your data in a portable format;</li>
		<li>stop relying on your consent.</li>
	</ul>
	<p>Write to <a href="mailto:hello@starhold.dev">hello@starhold.dev</a>, or to <a href="mailto:privacy@starhold.dev">privacy@starhold.dev</a> for export and delete, which we do by hand until Starhold Account exists. We answer within 30 days. We may need to confirm it is you, and we will not ask for more than we need. We make no decisions about you by automated means that have legal or similar effects.</p>
	<p>If you are unhappy with our answer, you can complain to your local data protection authority, or in the United States to the Arizona Attorney General. We would like the chance to fix it first.</p>

	<h2>11. Children</h2>
	<p>You must be at least 13 to use our services, and 18 (or old enough to make a binding purchase where you live) to buy. We do not knowingly collect data from children under 13. If you think a child has given us data, tell us and we will delete it.</p>

	<h2>12. Security</h2>
	<p>Our services run on servers we administer, behind access controls, with data encrypted in transit. Payment details go to the payment provider and never to us. No system is perfectly secure, so we also collect little, which leaves little to expose.</p>

	<h2>13. Changes to this policy</h2>
	<p>If we change this policy in a material way, we will tell you before the change takes effect and update the date above.</p>

	<h2>14. Contact</h2>
	<p>Copper Jerky LLC, doing business as Starhold — <a href="mailto:hello@starhold.dev">hello@starhold.dev</a>.</p>

	<p class="label">Last updated 2026-10-24.</p>
</section>

<style>
	table {
		width: 100%;
		border-collapse: collapse;
		margin: var(--space-4, 1rem) 0;
		font-size: 0.95em;
	}
	th,
	td {
		border: 1px solid var(--border);
		padding: 0.5rem 0.75rem;
		text-align: left;
		vertical-align: top;
	}
	th {
		background: var(--bg-raised);
		color: var(--text-muted);
	}
</style>
