<script lang="ts">
	import { home } from '#lib/content/copy.js';

	// STAR-310: "type a domain, get a grade", in the home hero. A plain GET form, no script: pressing the
	// button loads Zenithmark's landing page with ?domain=<what was typed>, and Zenithmark fills its own scan
	// form in. The browser only checks the shape (one dot, no spaces); Zenithmark does the real validation,
	// so a pasted URL is fine here and it strips the scheme and path. Nothing is loaded from Zenithmark until
	// the visitor presses the button.
	const c = home.heroCheck;
</script>

<form class="hero-check" method="get" action={c.action} data-testid="hero-check" data-evidence={c.evidence}>
	<label for="hero-domain">{c.label}</label>
	<div class="hero-check-row">
		<input
			id="hero-domain"
			name={c.field}
			type="text"
			inputmode="url"
			autocapitalize="off"
			autocomplete="off"
			spellcheck="false"
			required
			maxlength="253"
			pattern={'\\s*\\S+\\.\\S+\\s*'}
			title="A domain name, such as example.com"
			placeholder={c.example}
			aria-describedby="hero-domain-note"
		/>
		<button class="btn btn-primary" type="submit">{c.button}</button>
	</div>
	<p id="hero-domain-note" class="hero-check-note">{c.note}</p>
</form>

<style>
	/* Same parts as the rest of the site: app.css inputs, .btn-primary, the muted note size of the proof
	   strip. Fixed sizes only, so nothing moves when it renders (no layout shift). */
	.hero-check {
		margin: var(--sp-5) 0 0;
		max-width: 34rem;
	}
	.hero-check label {
		display: block;
		margin-bottom: var(--sp-2);
		font-weight: 600;
		color: var(--text);
	}
	.hero-check-row {
		display: flex;
		gap: var(--sp-2);
	}
	.hero-check-row input {
		flex: 1 1 auto;
		min-width: 0;
		background: var(--surface);
		border-color: var(--border-strong);
	}
	.hero-check-row .btn {
		flex: 0 0 auto;
	}
	.hero-check-note {
		margin: var(--sp-2) 0 0;
		color: var(--text-muted);
		font-size: var(--fs-1);
	}
	@media (max-width: 420px) {
		.hero-check-row {
			flex-direction: column;
		}
	}
</style>
