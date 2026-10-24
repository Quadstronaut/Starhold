// Dump the inbox as an age-armored bundle: `npm run contact:export > inbox.age`.
// Needs CONTACT_AGE_RECIPIENT. Decrypt elsewhere (quad42 console); never here.
import { openDb, DEFAULT_DB_PATH } from '../src/lib/server/contact-store';
import { buildBundle } from '../src/lib/server/contact-export';

const recipient = process.env.CONTACT_AGE_RECIPIENT;
if (!recipient) {
	console.error('CONTACT_AGE_RECIPIENT is not set');
	process.exit(2);
}
const db = openDb(process.env.CONTACT_DB_PATH || DEFAULT_DB_PATH);
process.stdout.write(await buildBundle(db, recipient));
db.close();
