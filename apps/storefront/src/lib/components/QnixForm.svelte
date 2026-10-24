<script lang="ts">
	// QNix "notify me" form: email only, posts to /api/qnix (STAR-145, Q48/Q66).
	import { formNotices } from '$lib/content/copy';
	import FormNotice from './FormNotice.svelte';

	let email = $state('');
	let website = $state(''); // honeypot — humans never fill it
	let status = $state<'idle' | 'busy' | 'sent' | 'error'>('idle');
	let errorMsg = $state('');

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		status = 'busy';
		errorMsg = '';
		try {
			const res = await fetch('/api/qnix', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ email, website })
			});
			if (!res.ok) {
				const body = await res.json().catch(() => null);
				throw new Error(body?.message ?? `could not send that (${res.status})`);
			}
			status = 'sent';
		} catch (err) {
			status = 'error';
			errorMsg = err instanceof Error ? err.message : 'could not send that';
		}
	}
</script>

{#if status === 'sent'}
	<p class="card sent">Got it. We will email <strong>{email}</strong> once, when QNix opens.</p>
{:else}
	<form onsubmit={submit}>
		<label>
			<span class="eyebrow">Email</span>
			<input type="email" bind:value={email} required maxlength="254" autocomplete="email" />
		</label>
		<input class="hp" type="text" bind:value={website} name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />
		<button class="btn btn-primary" disabled={status === 'busy'}>
			{status === 'busy' ? 'Sending…' : formNotices.qnix.cta}
		</button>
		{#if status === 'error'}<p class="err">{errorMsg}</p>{/if}
	</form>
{/if}
<FormNotice lines={[formNotices.qnix.notice]} />

<style>
	form {
		display: grid;
		gap: var(--sp-4);
		max-width: 520px;
		margin-top: var(--sp-5);
	}
	label {
		display: grid;
		gap: var(--sp-1);
	}
	.hp {
		position: absolute;
		left: -9999px;
	}
	.btn {
		justify-self: start;
	}
	.sent {
		max-width: 520px;
	}
</style>
