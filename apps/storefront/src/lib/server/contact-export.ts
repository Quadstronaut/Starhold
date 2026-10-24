// Admin read path (STAR-145): bundle ciphertext rows as an age-armored file.
// The storefront never decrypts. The quad42 console, holding the private key,
// armor-decodes the bundle, decrypts it, then decrypts each row's `ciphertext` (base64).
import type { Db } from './contact-store';
import { encryptTo } from './contact-store';
import { armor } from 'age-encryption';

export async function buildBundle(db: Db, recipient: string, now = new Date()): Promise<string> {
	const rows = (sql: string) =>
		(db.prepare(sql).all() as any[]).map((r) => ({ ...r, ciphertext: Buffer.from(r.ciphertext).toString('base64') }));
	const bundle = JSON.stringify({
		format: 1,
		exported_at: now.toISOString(),
		messages: rows('SELECT * FROM messages ORDER BY id'),
		qnix_interest: rows('SELECT * FROM qnix_interest ORDER BY id')
	});
	return armor.encode(await encryptTo(recipient, bundle));
}
