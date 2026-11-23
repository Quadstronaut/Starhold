<script lang="ts">
	// PERI-15. Rendered only while PERIDOT_DOWNLOAD_ENABLED is true. Values come from page-content.ts.
	// Wording on privacy and health matches the Google Play listing (docs/play/listing/full-description.txt
	// in the Peridot repo). No images here: the launcher icon is being replaced (PERI-10).
	import {
		PERIDOT_CERT_SHA256,
		PERIDOT_PLAY_URL,
		PERIDOT_RELEASE,
		PERIDOT_OTHER_SOURCES
	} from '#lib/peridot/page-content.js';
</script>

<h2>Download</h2>
{#if PERIDOT_RELEASE}
	<p><a href={PERIDOT_RELEASE.apkUrl}>Download Peridot {PERIDOT_RELEASE.version} for Android ({PERIDOT_RELEASE.apkFileName})</a></p>
	<p>SHA-256 of the file: <code>{PERIDOT_RELEASE.apkSha256}</code></p>
	<p>This is the same app as the Google Play version, signed with the same key, so each one can update the other without uninstalling.</p>
{:else}
	<p>The direct download is not available yet.</p>
{/if}
<p>Peridot is free, with no ads and no account with us. Starhold has no analytics and no crash reporting. If you never join a circle and never turn on Google Drive backup, your cycle data never leaves your phone.</p>
<p>Peridot is not a medical device and does not give medical advice, diagnosis or treatment. Predictions are statistical estimates based on the data you log; cycles vary, and many do not follow a pattern. Do not rely on Peridot for contraception. Talk to a clinician about anything that concerns you.</p>

<h2>Official sources</h2>
<p>These are the only places Starhold publishes Peridot. A copy from anywhere else, including sites that mirror apps, is not ours. Check the file before you install it.</p>
<ul>
	<li>This page, <strong>starhold.dev/peridot</strong></li>
	{#if PERIDOT_PLAY_URL}<li><a href={PERIDOT_PLAY_URL}>Google Play</a></li>{/if}
	{#if PERIDOT_OTHER_SOURCES.githubRelease}<li><a href={PERIDOT_OTHER_SOURCES.githubRelease}>GitHub release</a></li>{/if}
	{#if PERIDOT_OTHER_SOURCES.zapstore}<li><a href={PERIDOT_OTHER_SOURCES.zapstore}>Zapstore</a></li>{/if}
	{#if PERIDOT_OTHER_SOURCES.obtainium}<li><a href={PERIDOT_OTHER_SOURCES.obtainium}>Obtainium</a></li>{/if}
</ul>

<h3>Signing certificate</h3>
<p>Every official copy is signed by Starhold (COPPER JERKY LLC) with one certificate. Its SHA-256 fingerprint:</p>
<p><code>{PERIDOT_CERT_SHA256}</code></p>

<h3>How to check a download</h3>
<ol>
	<li>File checksum. On Windows, in PowerShell: <code>Get-FileHash peridot-*.apk</code>. On Linux or Mac: <code>sha256sum peridot-*.apk</code>. The result must equal the SHA-256 shown above.</li>
	<li>Signer. With the Android SDK build tools: <code>apksigner verify --print-certs peridot-*.apk</code>. The signer SHA-256 must equal the certificate fingerprint above.</li>
	<li>If either does not match, do not install the file, and tell us at hello@starhold.dev.</li>
</ol>
