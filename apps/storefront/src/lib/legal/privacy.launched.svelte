<svelte:head><title>Privacy Policy · Starhold</title></svelte:head>

<section class="section legal">
	<div class="label">Last updated 2026-11-19</div>
	<h1>Privacy Policy</h1>

	<p>This policy says what personal data Starhold collects, why, on what legal basis, who receives it, how long we keep it, and how to use your rights. It covers the Starhold Account, our websites (starhold.dev, starhold.fyi, starhold.app), the contact form and our Discord server. Each product (Umbermark, Zenithmark, Heliostat and Solatype) has its own privacy notice for what it adds. Peridot has its own privacy policy.</p>

	<h2>1. Who is responsible</h2>
	<p>Starhold is the trade name of <strong>Copper Jerky LLC</strong>, an Arizona limited liability company ("Starhold", "we", "us"). We are the controller of the data described here.</p>
	<ul>
		<li>Postal address: Copper Jerky LLC, 6917 W. Hedge Rose Dr, Tucson, AZ 85757, USA.</li>
		<li>Email for any privacy question or request: <a href="mailto:hello@starhold.dev">hello@starhold.dev</a></li>
	</ul>

	<h2>2. Our approach</h2>
	<p>We keep only what each service needs, for a stated period, and delete it automatically after that. We never sell your data, and we are not authorized to. We use no third-party tracking and no per-person behaviour analytics. We keep a limited set of first-party operational counts, described below.</p>
	<p>Two words we use carefully:</p>
	<ul>
		<li><strong>Anonymous</strong> means we cannot tie it to a person, even by looking it up. Our daily visit tallies are anonymous.</li>
		<li><strong>Pseudonymous</strong> means it is tied to a code, such as a keyed hash of an IP address, instead of your name. We still treat it as personal data.</li>
	</ul>
	<p>The Starhold websites (starhold.dev, starhold.fyi and starhold.app) set no cookies. The Starhold Account and our products set cookies only to keep you signed in, to protect forms, and to remember a scan, a report or an unlocked status page in your browser. None lasts longer than 90 days, and none is used for advertising or tracking. We keep no request logs. Error logs can contain your IP for up to 30 days. Sign-in abuse limiting uses a keyed hash of your IP for 7 days. Admin access to account data through our tools is logged; that log is about us, not you.</p>

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
			<tr><td>Email for the DysonSphere notice.</td><td>Send one email when DysonSphere opens.</td><td>Consent</td></tr>
			<tr><td>Starhold Account details: your sign-in (through Google), your plan, and your email address only if you choose to share it at sign-in.</td><td>Run your account.</td><td>Contract</td></tr>
			<tr><td>Purchase record: amount, date, provider reference. No content.</td><td>Keep the books and meet tax law.</td><td>Legitimate interests (keeping the business records that United States tax law requires)</td></tr>
			<tr><td>If you back our work on Patreon: your Patreon user id, name, email, membership status, tier, pledge amount, last charge status, next charge date and, if you linked it, your Discord id.</td><td>Know who has backed the work and at which tier.</td><td>Consent</td></tr>
			<tr><td>Backups of the above.</td><td>Recover from disk or host loss.</td><td>Legitimate interests</td></tr>
		</tbody>
	</table>
		<h3>Shush as built today, and Starbot from the day it opens</h3>
	<p>These two services are not written up in full yet. The Shush row is what it holds as built today, not a promise about how it will work. The Starbot row describes the shared bot and applies from the day Starbot opens.</p>
	<table>
		<thead>
			<tr><th>Service</th><th>What it holds today</th><th>Kept for</th></tr>
		</thead>
		<tbody>
			<tr><td>Shush</td><td>Your Discord id, the words you type in the arena (including words read from images you post there), counted per day, banned words you triggered, death times and points. Message ids are kept for reference for thirty days; we store word counts, never the messages themselves. The public list shows a display name, the word and the date, for thirty days, then it drops off. A climb board shows your display name and lifetime XP.</td><td>Erased 30 days after you use /hide-me in Discord, or after 12 months without playing. /hide-me takes you off every list we show at once, and we also edit the bot's own recent messages. We keep only a record that you opted out, so it stays honoured. Copies kept by Discord or other players, and older bot messages, can't be changed.</td></tr>
			<tr><td>Shush</td><td>Help-desk tickets: your Discord id, subject and open and close times. The messages live in a private Discord thread.</td><td>No fixed period yet. Ask and we delete it by hand.</td></tr>
			<tr><td>Starbot</td><td>This row applies from the day Starbot opens; Starbot is not available yet. Starbot is one bot run by Starhold, which you add to your Discord server. It holds your Starbot account: your Discord id, name and avatar, and each plan you hold (Free, Plus, Pro or Suite) and the servers it covers, up to two for each paid subscription. One account can hold several subscriptions. If you buy a plan inside Discord, Discord takes the payment and we receive only a record of the purchase: its id, which plan it is, your Discord user id and its start and end dates. We receive no payment details from Discord. Your server's settings and the data the modules you turn on need, for example XP counts, tickets, giveaway entries, scheduled posts and webhook settings, in a separate database file for each server. Discord user, channel and role ids where a module needs them. Secrets you give modules (webhook keys, API keys), stored encrypted, and the data a module sends to those services for you. Web addresses you ask Starbot to check or watch. Starbot holds no message text. Starbot never asks for a bot token and stores none. Starbot does not store your email address. If a paid plan is on no server, the dashboard says so, and your Starhold Account, if you have one, emails you a service message about it: once each time that happens and, where we know the renewal date, once shortly before each renewal. It is not marketing. If you bought in Discord and have no Starhold Account, you get the dashboard notice only. We never sell this data, use it for ads or use it to train AI.</td><td>Your server's settings and module data: kept while Starbot is on your server. If Starbot is removed from your server, that server's data is deleted right away, with no grace period. You can also delete it yourself and export it at any time in the Starbot dashboard. When a paid plan ends, paid modules switch off at the end of the paid period and their data is deleted when the payment grace period ends; free modules keep working. The server's backup copy is deleted with it; small control backups (server id, nickname, avatar link) expire within 15 days. Your Starbot account and purchase records: kept until you ask us to delete them; backups drop them within 15 days after that. Deleting your Starhold Account removes only its link to Starbot, and ends a Starbot plan your Starhold Suite paid for. Polar keeps its own payment records as merchant of record. Server logs (ids, events and errors; we do not log message text or tokens): 30 days.</td></tr>
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
			<tr><td>Discord</td><td>Our Discord server and apps. It receives the ticket notice for a contact message, and whatever you post in Discord. If you buy a Starbot plan inside Discord, Discord takes the payment. All of this is under <a href="https://discord.com/privacy" target="_blank" rel="noopener">Discord's Privacy Policy</a>.</td><td>Its own controller, under its own privacy policy</td></tr>
			<tr><td>Polar</td><td>Payment provider and merchant of record for sales. It takes your payment and keeps its own records, under <a href="https://polar.sh/legal/privacy" target="_blank" rel="noopener">its privacy policy</a>. Polar is the seller (merchant of record) and uses Stripe to process card payments. Starhold never sees your card number. We keep only the order reference and plan.</td><td>Its own controller, under its own privacy policy</td></tr>
			<tr><td>Google</td><td>Sign-in provider for the Starhold Account. Google learns that you signed in to Starhold, under <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google's Privacy Policy</a>. We ask Google only to confirm who you are, and we receive Google's account identifier for you. We receive your Google account email address only if you tick the optional box to share it, and we keep it only if Google confirms it is verified. We do not request your name, and we never receive your password. Google also provides the mailbox and voicemail that receive messages you send us, under its own privacy policy.</td><td>Its own controller, under its own privacy policy</td></tr>
			<tr><td>Porkbun</td><td>Forwards email sent to our starhold addresses, under its own privacy policy.</td><td>Its own controller, under its own privacy policy</td></tr>
			<tr><td>Patreon</td><td>Payment platform for people who choose to back our work. We receive from it the membership details listed in section 3. If you connect Discord to Patreon, Patreon gives you a role in the Starhold Discord named after your tier. Backing buys nothing else: no product access, no discounts and no special support.</td><td>Its own controller, under its own privacy policy</td></tr>
			<tr><td>Postmark</td><td>Email delivery. It sends the email our products send you, including the service messages your Starhold Account sends about a Starbot plan, and receives your email address and the message to do so, under <a href="https://postmarkapp.com/privacy-policy" target="_blank" rel="noopener">its privacy policy</a>.</td><td>Processor's standard contractual terms (see section 5)</td></tr>
			<tr><td>Cloudflare (Turnstile)</td><td>Bot check on the Umbermark and Zenithmark scan forms. When you start a scan, your browser loads Cloudflare's check, and Cloudflare receives your IP address and browser details to decide whether you are a person, under <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">Cloudflare's Privacy Policy</a>.</td><td>Processor's standard contractual terms (see section 5)</td></tr>
			<tr><td>Cloudflare (R2)</td><td>Off-site storage of backups.</td><td>Processor's standard contractual terms (see section 5)</td></tr>
			<tr><td>Cloudflare (website delivery)</td><td>Delivers shushgame.com. It sees your IP address and browser details when you visit that site, under <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">Cloudflare's Privacy Policy</a>.</td><td>Processor's standard contractual terms (see section 5)</td></tr>
			<tr><td>OVH</td><td>Hosting. We rent the servers our services run on and administer them ourselves.</td><td>Processor's standard contractual terms (see section 5)</td></tr>
		</tbody>
	</table>
	<p>Our products send email through Postmark, from no-reply@starhold.app; replies go to hello@starhold.dev. We send only the email that is required to operate the service and maintain your account: sign-in and account notices, billing and refund notices, and alerts and updates you turned on, such as status-page subscriptions, monitoring alerts and score-drop alerts. We send no marketing email, upsells or newsletters unless you tick the Product updates box, which allows at most one email a month about Starhold products. If you tick the Product updates box, we store the email address you enter, the time you confirmed it and the wording you saw, and use them only to send you at most one email a month about Starhold products. You can stop at any time with the unsubscribe link in every email or by unticking the box on your account page, and the address is then deleted from our list at once. Our email provider, Postmark, keeps its own delivery record of each message for about 45 days. If you asked to be told when DysonSphere opens, we will email you once.</p>
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
			<tr><td>Abuse-prevention records</td><td>24 hours to 1 year, depending on the product</td><td>Record created</td></tr>
			<tr><td>Error logs</td><td>30 days</td><td>Log line written</td></tr>
			<tr><td>Backups</td><td>Deleted data leaves backups within 30 days</td><td>Deletion from live data</td></tr>
			<tr><td>Free scan reports</td><td>30 days</td><td>Report created</td></tr>
			<tr><td>Paid reports, unclaimed</td><td>3 months, or until you delete it</td><td>Payment. A report claimed into an account lives with the account.</td></tr>
			<tr><td>Starhold Account details</td><td>Until you delete the account</td><td>Account created</td></tr>
			<tr><td>Contact messages</td><td>90 days after we close the conversation, and never more than 12 months from receipt</td><td>Conversation closed; message received</td></tr>
			<tr><td>DysonSphere notice list</td><td>Until the one notice is sent, or 24 months if DysonSphere has not opened</td><td>Form submitted</td></tr>
			<tr><td>Voicemails</td><td>90 days</td><td>Time of the call</td></tr>
			<tr><td>Purchase record</td><td>As tax law requires, up to 7 years</td><td>Payment</td></tr>
			<tr><td>Patreon membership details</td><td>While you are a patron, then deleted within 30 days</td><td>The day we see you are no longer an active patron</td></tr>
		</tbody>
	</table>
	<p>Spam-control IP addresses are held in memory for 10 minutes and are lost on restart.</p>

	<h2>7. Deleting your data</h2>
	<p>Deletion works in three layers.</p>
	<ol>
		<li>Live data is gone when the delete runs: at once, after 24 hours if you have a paid plan, or at the end of your period if you chose that. Keys and sessions stop working.</li>
		<li>Backups drop it within 30 days.</li>
		<li>Only the bare purchase record (amount, date, provider reference, no content) is kept, as tax law requires, for up to 7 years.</li>
	</ol>
	<p>You can export and delete your data yourself from the account page. If you cannot, write to <a href="mailto:privacy@starhold.dev">privacy@starhold.dev</a> and we will do it within one month. Every destructive action asks you to confirm first.</p>

	<h2>8. The contact form and DysonSphere notice</h2>
	<p>Your message is encrypted with a public key before it is stored; only an offline key held by the operator can read it. Discord receives only the ticket number, in a short notice reading "New message #id", with no message body and no email address. We delete the stored message 90 days after we close the conversation, and never later than 12 months after we received it. Our backups drop it within 30 days after that. Discord keeps its own copy of the short notice under its policy. Please do not send passwords or secrets in a message.</p>
	<p>If you ask to be told when DysonSphere opens, we store your email address encrypted. We send you one notice, then delete the address. If DysonSphere has not opened after 24 months, we delete it anyway.</p>
	<p>Voicemail: if you call our public number, Google Voice records your message and number and emails it to us. We reply by email and delete the voicemail within 90 days.</p>

	<h2>9. Our access to your account</h2>
	<p>We never ask for your password, never send sign-in links by hand, and never look at your account unless you ask us to or the law requires it. Any access is logged. That log is about us, not you (see section 2).</p>

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
	<p>Write to <a href="mailto:hello@starhold.dev">hello@starhold.dev</a>, or to <a href="mailto:privacy@starhold.dev">privacy@starhold.dev</a> for export and delete if you cannot do them from the account page. We answer within one month. We may need to confirm it is you, and we will not ask for more than we need. We make no decisions about you by automated means that have legal or similar effects.</p>
	<p>If you are unhappy with our answer, you can complain to your local data protection authority, or in the United States to the Arizona Attorney General. We would like the chance to fix it first.</p>

	<h2>11. Children</h2>
	<p>You must be at least 16 to use our services, and 18 (or old enough to make a binding purchase where you live) to buy. We do not knowingly collect data from children under 16. If you think a child has given us data, tell us and we will delete it.</p>

	<h2>12. Security</h2>
	<p>Our services run on servers we administer, behind access controls, with data encrypted in transit. Payment details go to the payment provider and never to us. No system is perfectly secure, so we also collect little, which leaves little to expose.</p>

	<h2>13. Changes to this policy</h2>
	<p>If we change this policy in a material way, we will tell you before the change takes effect and update the date above.</p>

	<h2>14. Contact</h2>
	<p>Copper Jerky LLC, doing business as Starhold — <a href="mailto:hello@starhold.dev">hello@starhold.dev</a>.</p>

	<p class="label">Last updated 2026-11-19.</p>
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
