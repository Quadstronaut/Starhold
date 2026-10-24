// Daily retention job: `npm run contact:purge`. Logs counts only, never content.
// Rules live in src/lib/server/retention.ts.
import { openDb, DEFAULT_DB_PATH } from '../src/lib/server/contact-store';
import { purge } from '../src/lib/server/retention';

const db = openDb(process.env.CONTACT_DB_PATH || DEFAULT_DB_PATH);
const { messages, qnix } = purge(db);
console.log(`contact-purge ${new Date().toISOString()} deleted messages=${messages} qnix_interest=${qnix}`);
db.close();
