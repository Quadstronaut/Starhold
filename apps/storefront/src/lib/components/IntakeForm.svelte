<script lang="ts">
	let { kind, cta = 'Send' }: { kind: 'contact' | 'quote' | 'qnix'; cta?: string } = $props();

	let name = $state('');
	let email = $state('');
	let message = $state('');
	let website = $state(''); // honeypot — visually hidden, humans never fill it
	let status = $state<'idle' | 'busy' | 'sent' | 'error'>('idle');
	let errorMsg = $state('');

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		status = 'busy';
		errorMsg = '';
		try {
			const res = await fetch('/api/intake', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ kind, name, email, message, website })
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
	<p class="card sent">Got it. I will reply to <strong>{email}</strong>.</p>
{:else}
	<form onsubmit={submit}>
		<label>
			<span class="eyebrow">Name</span>
			<input bind:value={name} maxlength="100" autocomplete="name" />
		</label>
		<label>
			<span class="eyebrow">Email</span>
			<input type="email" bind:value={email} required autocomplete="email" />
		</label>
		<label>
			<span class="eyebrow">Message</span>
			<textarea bind:value={message} required minlength="10" maxlength="4000" rows="6"></textarea>
		</label>
		<input
			class="hp"
			type="text"
			bind:value={website}
			name="website"
			tabindex="-1"
			autocomplete="off"
			aria-hidden="true"
		/>
		<button class="btn btn-primary" disabled={status === 'busy'}>
			{status === 'busy' ? 'Sending…' : cta}
		</button>
		{#if status === 'error'}<p class="err">{errorMsg}</p>{/if}
	</form>
{/if}

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
