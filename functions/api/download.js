import { reply, isSameOrigin, readJson } from "./_auth.js";
import { ensureColumns, parseId } from "./_apps.js";

// POST /api/download  { "id": 3 }
// Counts one download click for a published app. The number is approximate:
// the browser sends at most one count per app per day, and anyone can call this.
export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return reply({ error: "Invalid request origin" }, 403);
  if (!env.DB) return reply({ error: "Database is not connected" }, 503);
  const body = await readJson(request, 200);
  if (body.error) return reply({ error: body.error }, 400);
  const id = parseId(String(body.data.id));
  if (!id) return reply({ error: "Invalid app id" }, 400);
  try {
    const cols = await ensureColumns(env);
    const published = cols.has("published") ? " AND published = 1" : "";
    await env.DB.prepare(`UPDATE apps SET downloads = downloads + 1 WHERE id = ?${published}`)
      .bind(id)
      .run();
    return reply({ ok: true });
  } catch {
    return reply({ error: "Could not record the download" }, 500);
  }
}
