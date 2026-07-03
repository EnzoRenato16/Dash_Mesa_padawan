// Backend client for the app.
//
// This used to be the Base44 SDK client that connected to Base44's hosted
// backend. For a static GitHub Pages deployment it is replaced by a
// self-contained, browser-local backend (see ./backend) that implements the
// same API surface: db.auth, db.entities and db.integrations.

import { db } from './backend';

export { db };
export const base44 = db;
export default db;
