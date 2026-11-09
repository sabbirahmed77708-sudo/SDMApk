import { requireAdmin } from "./_auth.js";
import { reply } from "./_auth.js";
import { readContact } from "./_db.js";

// GET /api/backup — download every app, older version and contact detail as one JSON file (admin only).
export async function onRequestGet({ request, env }) {
  if (!(await requireAdmin(request, env))) return reply({ error: "Unauthorized" }, 401);
  if (!env.DB) return reply({ error: "Database is not connected" }, 503);
  try {
    const { results: apps = [] } = await env.DB.prepare("SELECT * FROM apps ORDER BY id").all();
    let versions = [];
    try {
      versions = (await env.DB.prepare("SELECT * FROM app_versions ORDER BY id").all()).results || [];
    } catch {}
    const data = {
      site: "SdmApk",
      exported_at: new Date().toISOString(),
      apps,
      versions,
      contact: await readContact(env),
    };
    const day = data.exported_at.slice(0, 10);
    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="sdmapk-backup-${day}.json"`,
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return reply({ error: "Could not create the backup" }, 500);
  }
}
