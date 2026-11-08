import { reply, isSameOrigin, readJson, requireAdmin } from "./_auth.js";
import { getColumns, ensureColumns, selectList, shapeApp, normalizeApp } from "./_apps.js";

// GET /api/apps — public list of published apps.
// Admins can add ?all=1 to also receive hidden (unpublished) apps.
export async function onRequestGet({ request, env }) {
  if (!env.DB) return reply({ error: "Database is not connected" }, 503);
  try {
    const cols = await getColumns(env);
    if (!cols.has("name")) return reply({ error: "Database is not set up yet" }, 503);

    const wantAll = new URL(request.url).searchParams.get("all") === "1";
    const includeHidden = wantAll && (await requireAdmin(request, env));
    const where = cols.has("published") && !includeHidden ? " WHERE published = 1" : "";

    const { results = [] } = await env.DB.prepare(
      `SELECT ${selectList(cols)} FROM apps${where} ORDER BY created_at DESC, id DESC LIMIT 500`
    ).all();
    return reply({ apps: results.map(shapeApp) });
  } catch {
    return reply({ error: "Could not load apps" }, 500);
  }
}

// POST /api/apps — create an app (admin only).
export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return reply({ error: "Invalid request origin" }, 403);
  if (!(await requireAdmin(request, env))) return reply({ error: "Unauthorized" }, 401);
  if (!env.DB) return reply({ error: "Database is not connected" }, 503);

  const body = await readJson(request);
  if (body.error) return reply({ error: body.error }, 400);

  try {
    const cols = await ensureColumns(env);
    const checked = normalizeApp(body.data, cols);
    if (checked.error) return reply({ error: checked.error }, checked.status || 400);

    const names = Object.keys(checked.value);
    const result = await env.DB.prepare(
      `INSERT INTO apps (${names.join(",")}) VALUES (${names.map(() => "?").join(",")})`
    )
      .bind(...names.map((n) => checked.value[n]))
      .run();
    return reply({ ok: true, id: result.meta.last_row_id }, 201);
  } catch {
    return reply({ error: "Could not save the app" }, 500);
  }
}
