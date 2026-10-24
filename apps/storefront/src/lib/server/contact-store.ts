// Encrypted contact inbox (STAR-145, ledger Q23/Q47/Q65/Q66).
//
// Rule: the storefront can WRITE messages but never READ them. Everything
// personal (name, email, body) is encrypted with `age` to a public recipient
// before it touches the SQLite file; the private key lives on the operator's
// machine / quad42 console, never here. Only non-personal routing columns
// (product, kind, status, timestamps) are plaintext.
//
// Relative imports only: scripts/*.ts run this under tsx, without SvelteKit aliases.
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { Encrypter } from 'age-encryption';

export type Db = InstanceType<typeof Database>;

export const DEFAULT_DB_PATH = 'data/contact.sqlite';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS messages (
	id           INTEGER PRIMARY KEY,
	created_at   TEXT NOT NULL,
	product      TEXT NOT NULL DEFAULT '',
	kind         TEXT NOT NULL,
	ciphertext   BLOB NOT NULL,
	status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
	closed_at    TEXT,
	close_reason TEXT
);
CREATE TABLE IF NOT EXISTS qnix_interest (
	id         INTEGER PRIMARY KEY,
	created_at TEXT NOT NULL,
	ciphertext BLOB NOT NULL
);
`;

/** Open (and create if needed) the inbox DB in WAL mode. */
export function openDb(path: string = DEFAULT_DB_PATH): Db {
	if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
	const db = new Database(path);
	db.pragma('journal_mode = WAL');
	db.exec(SCHEMA);
	return db;
}

// One handle per path for the life of the server process.
const handles = new Map<string, Db>();
export function getDb(path: string = DEFAULT_DB_PATH): Db {
	let db = handles.get(path);
	if (!db) handles.set(path, (db = openDb(path)));
	return db;
}

/** Encrypt bytes or text to one age recipient (`age1...`). Throws on a bad key. */
export async function encryptTo(recipient: string, plaintext: string | Uint8Array): Promise<Uint8Array> {
	const e = new Encrypter();
	e.addRecipient(recipient);
	return e.encrypt(plaintext);
}

export type MessageInput = { product: string; kind: string; name: string; email: string; message: string };

/** Encrypt and store one contact/invite message. Returns the new row id. */
export async function saveMessage(db: Db, recipient: string, m: MessageInput, now = new Date()): Promise<number> {
	const ciphertext = await encryptTo(
		recipient,
		JSON.stringify({ name: m.name, email: m.email, message: m.message })
	);
	const r = db
		.prepare('INSERT INTO messages (created_at, product, kind, ciphertext) VALUES (?, ?, ?, ?)')
		.run(now.toISOString(), m.product, m.kind, Buffer.from(ciphertext));
	return Number(r.lastInsertRowid);
}

/** Encrypt and store one QNix interest address. Returns the new row id. */
export async function saveQnixInterest(db: Db, recipient: string, email: string, now = new Date()): Promise<number> {
	const ciphertext = await encryptTo(recipient, JSON.stringify({ email }));
	const r = db
		.prepare('INSERT INTO qnix_interest (created_at, ciphertext) VALUES (?, ?)')
		.run(now.toISOString(), Buffer.from(ciphertext));
	return Number(r.lastInsertRowid);
}

/** Mark a message closed; starts its 90-day deletion clock. False if no such open row. */
export function closeMessage(db: Db, id: number, reason = '', now = new Date()): boolean {
	const r = db
		.prepare("UPDATE messages SET status='closed', closed_at=?, close_reason=? WHERE id=? AND status='open'")
		.run(now.toISOString(), reason, id);
	return r.changes > 0;
}
