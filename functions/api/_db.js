// Extra tables (settings, login attempts, older versions) created on demand.
// Exports no onRequest* handlers, so it is not a route.

const TABLES = [
  "CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '')",
  "CREATE TABLE IF NOT EXISTS login_attempts (ip TEXT PRIMARY KEY, fails INTEGER NOT NULL DEFAULT 0, first_at INTEGER NOT NULL DEFAULT 0, locked_until INTEGER NOT NULL DEFAULT 0)",
  "CREATE TABLE IF NOT EXISTS app_versions (id INTEGER PRIMARY KEY AUTOINCREMENT, app_id INTEGER NOT NULL, version TEXT NOT NULL DEFAULT '', download_url TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE INDEX IF NOT EXISTS idx_versions_app ON app_versions(app_id)",
];

export async function ensureTables(env) {
  for (const sql of TABLES) await env.DB.prepare(sql).run();
}

// Public contact fields. Anything else in `settings` (like the password hash) is never exposed.
export const CONTACT_KEYS = ["contact_email", "contact_telegram", "contact_website", "contact_note"];

export async function readContact(env) {
  const out = {};
  try {
    const marks = CONTACT_KEYS.map(() => "?").join(",");
    const { results = [] } = await env.DB.prepare(
      `SELECT key, value FROM settings WHERE key IN (${marks})`
    )
      .bind(...CONTACT_KEYS)
      .all();
    for (const r of results) out[r.key] = r.value;
  } catch {
    // Table not created yet: no contact details.
  }
  return out;
}
