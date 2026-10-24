// Mark a message closed: `npm run contact:close -- <id> [reason]`.
// Closing starts the 90-day deletion clock (see src/lib/server/retention.ts).
import { openDb, closeMessage, DEFAULT_DB_PATH } from '../src/lib/server/contact-store';

const [idArg, ...reason] = process.argv.slice(2);
const id = Number(idArg);
if (!Number.isInteger(id) || id < 1) {
	console.error('usage: contact-close <id> [reason]');
	process.exit(2);
}
const db = openDb(process.env.CONTACT_DB_PATH || DEFAULT_DB_PATH);
const ok = closeMessage(db, id, reason.join(' '));
console.log(ok ? `closed #${id}` : `no open message #${id}`);
db.close();
process.exit(ok ? 0 : 1);
