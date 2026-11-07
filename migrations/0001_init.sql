-- SdmApk: base apps table. Safe to run on a database that already has it.
CREATE TABLE IF NOT EXISTS apps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Other',
  version TEXT NOT NULL DEFAULT '',
  download_url TEXT NOT NULL,
  icon_url TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (
    strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
  )
);

CREATE INDEX IF NOT EXISTS idx_apps_created_at
ON apps(created_at DESC);
