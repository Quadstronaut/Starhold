<script lang="ts">
	import { invite } from '$lib/content/copy';

	// Invite request. Reuses the encrypted intake endpoint (kind "invite"): the
	// email and the service are required, the use line is optional. Success says
	// "requested" because nothing has been granted yet.
	let { service: initialService = '' }: { service?: string } = $props();

	// svelte-ignore state_referenced_locally
	let service = $state(initialService);
	let email = $state('');
	let use = $state('');
	let website = $state(''); // honeypot — humans never fill it
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
				body: JSON.stringify({ kind: 'invite', email, product: service, message: use, website })
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
	<div class="card sent" role="status" data-testid="invite-requested">
		<p>{invite.success} <strong>{email}</strong>.</p>
		<p>{invite.successNote}</p>
	</div>
{:else}
	<form onsubmit={submit}>
		<label>
			<span class="eyebrow">{invite.emailLabel}</span>
			<input type="email" bind:value={email} required autocomplete="email" />
		</label>
		<label>
			<span class="eyebrow">{invite.serviceLabel}</span>
			<select name="service" bind:value={service} required>
				<option value="" disabled>{invite.servicePlaceholder}</option>
				{#each invite.services as s (s.id)}
					<option value={s.id}>{s.label}</option>
				{/each}
			</select>
		</label>
		<label>
			<span class="eyebrow">{invite.useLabel}</span>
			<textarea bind:value={use} maxlength="4000" rows="4"></textarea>
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
			{status === 'busy' ? 'Sending…' : invite.cta}
		</button>
		{#if status === 'error'}<p class="err" role="alert">{errorMsg}</p>{/if}
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
		margin-top: var(--sp-5);
	}
</style>
