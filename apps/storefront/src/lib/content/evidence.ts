// Typed access to the evidence registry.
//
// The contract: a marketing string that asserts a fact about the world carries
// data-evidence="<id>". `ev()` is the only way to produce that attribute value,
// and it throws on an unknown or still-pending id — so a claim whose proof has
// not been confirmed cannot reach a page by accident. It fails the build, loudly.
import registry from './evidence.json';

export type EvidenceStatus = 'verified' | 'pending';

export type EvidenceItem = {
	id: string;
	claim: string;
	status: EvidenceStatus;
	verifier: string;
	sources?: string[];
	note?: string;
};

export const EVIDENCE: EvidenceItem[] = (registry.items as EvidenceItem[]).slice();

const BY_ID = new Map(EVIDENCE.map((e) => [e.id, e]));

export function evidence(id: string): EvidenceItem {
	const item = BY_ID.get(id);
	if (!item) throw new Error(`unknown evidence id: ${id}`);
	return item;
}

/** Attribute value for a claim. Pending evidence never ships. */
export function ev(id: string): string {
	const item = evidence(id);
	if (item.status !== 'verified')
		throw new Error(`evidence ${id} is ${item.status} — it must not render`);
	return id;
}

export const verified = EVIDENCE.filter((e) => e.status === 'verified');
