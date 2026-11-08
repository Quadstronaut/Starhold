import { defineEnvVars } from '@sveltejs/kit/env';

// Runtime (dynamic) private variables. Unset ones read as '' so the existing
// falsy checks (503 when CONTACT_AGE_RECIPIENT is missing, default DB path, no
// Discord relay) behave as they did with the old dynamic env module.
export const variables = defineEnvVars({
	CONTACT_AGE_RECIPIENT: { schema: (input) => input ?? '' },
	CONTACT_DB_PATH: { schema: (input) => input ?? '' },
	DISCORD_WEBHOOK_INTAKE: { schema: (input) => input ?? '' }
});
