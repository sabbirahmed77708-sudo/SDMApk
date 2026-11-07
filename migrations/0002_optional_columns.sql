-- SdmApk: optional screenshots and a published flag. Existing rows stay published.
-- Apply once with: npx wrangler d1 migrations apply appnook-db --remote
-- (wrangler records applied migrations, so it will not run this twice.)
ALTER TABLE apps ADD COLUMN screenshots TEXT NOT NULL DEFAULT '';
ALTER TABLE apps ADD COLUMN published INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category);
