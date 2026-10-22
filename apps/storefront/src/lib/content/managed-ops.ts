// Managed Ops content: what the $99/server/month product includes and the rules of engagement.
// Rule texts are spec §3.2 verbatim, with ONE substitution: "anything we build" -> "anything Starhold builds".
// Naming the LLC (not "I", not "we") keeps the obligation on Copper Jerky LLC d/b/a Starhold on the
// Services Terms page while staying legal on marketing routes (acceptance A2.4 bans "we" there).
// The Services Terms page imports ENGAGEMENT_RULES, so this text is binding copy, not just marketing.

export const INCLUDED: readonly string[] = [
	'Umbermark rescan',
	'Pending-update report',
	'Backup verification',
	'Service health on status.starhold.fyi',
	'One-page monthly report',
	'Discord support role'
];

export const ENGAGEMENT_RULES: readonly { id: string; text: string }[] = [
	{
		id: 'intake',
		text: "Intake captures the customer's existing procedures first; root access is required for system updates."
	},
	{
		id: 'gated-deploy',
		text: 'Nothing is deployed without the customer testing it, or observing it working in their test environment. The customer physically gates every deployment of anything Starhold builds.'
	},
	{
		id: 'liability',
		text: 'Liability stays with the customer by written agreement; Starhold is not liable for customer-gated deployments.'
	},
	{
		id: 'no-databases',
		text: 'No databases. Starhold does not touch *SQL or represent DBA skills. Scope is systems and applications only; database work is referred out.'
	},
	{
		id: 'sla',
		text: 'SLA: best-effort, business days; no 24/7.'
	}
];

/** Upper bound on servers per order. Interface for the deferred self-serve checkout; unused by the page today. */
export const MAX_SERVERS = 50;
