import { reply, isSameOrigin, readJson, requireAdmin } from "../_auth.js";
import { ensureTables } from "../_db.js";
import { getColumns, ensureColumns, selectList, shapeApp, normalizeApp, parseId } from "../_apps.js";

// GET /api/apps/:id — public details for one published app (admins also see hidden ones).
export async function onRequestGet({ request, env, params }) {
  const id = parseId(params.id);
  if (!id) return reply({ error: "Invalid app id" }, 400);
  if (!env.DB) return reply({ error: "Database is not connected" }, 503);
  try {
    const cols = await getColumns(env);
    const row = await env.DB.prepare(`SELECT ${selectList(cols)} FROM apps WHERE id = ?`)
      .bind(id)
      .first();
    if (!row) return reply({ error: "App not found" }, 404);
    const app = shapeApp(row);
    const admin = await requireAdmin(request, env);
    if (!app.published && !admin) return reply({ error: "App not found" }, 404);
    if (!admin) delete app.downloads; // download counts are for the owner only
    return reply({ app });
  } catch {
    return reply({ error: "Could not load the app" }, 500);
  }
}

// PUT /api/apps/:id — replace an app's details (admin only).
export async function onRequestPut({ request, env, params }) {
  if (!isSameOrigin(request)) return reply({ error: "Invalid request origin" }, 403);
  if (!(await requireAdmin(request, env))) return reply({ error: "Unauthorized" }, 401);
  const id = parseId(params.id);
  if (!id) return reply({ error: "Invalid app id" }, 400);
  if (!env.DB) return reply({ error: "Database is not connected" }, 503);

  const body = await readJson(request);
  if (body.error) return reply({ error: body.error }, 400);

  try {
    const cols = await ensureColumns(env);
    const checked = normalizeApp(body.data, cols);
    if (checked.error) return reply({ error: checked.error }, checked.status || 400);

    // When the download link changes, keep the old version in the "older versions" list.
    const old = await env.DB.prepare("SELECT version, download_url FROM apps WHERE id = ?").bind(id).first();
    if (!old) return reply({ error: "App not found" }, 404);
    if (old.download_url && checked.value.download_url && old.download_url !== checked.value.download_url) {
      try {
        await ensureTables(env);
        const dup = await env.DB.prepare("SELECT id FROM app_versions WHERE app_id = ? AND download_url = ?")
          .bind(id, old.download_url)
          .first();
        if (!dup) {
          await env.DB.prepare("INSERT INTO app_versions (app_id, version, download_url) VALUES (?, ?, ?)")
            .bind(id, old.version || "", old.download_url)
            .run();
        }
      } catch {
        // Archiving is a bonus; never block the update because of it.
      }
    }

    const names = Object.keys(checked.value);
    const result = await env.DB.prepare(
      `UPDATE apps SET ${names.map((n) => n + " = ?").join(", ")} WHERE id = ?`
    )
      .bind(...names.map((n) => checked.value[n]), id)
      .run();
    if (!result.meta.changes) return reply({ error: "App not found" }, 404);
    return reply({ ok: true });
  } catch {
    return reply({ error: "Could not update the app" }, 500);
  }
}

// DELETE /api/apps/:id — remove an app (admin only).
export async function onRequestDelete({ request, env, params }) {
  if (!isSameOrigin(request)) return reply({ error: "Invalid request origin" }, 403);
  if (!(await requireAdmin(request, env))) return reply({ error: "Unauthorized" }, 401);
  const id = parseId(params.id);
  if (!id) return reply({ error: "Invalid app id" }, 400);
  if (!env.DB) return reply({ error: "Database is not connected" }, 503);

  try {
    const result = await env.DB.prepare("DELETE FROM apps WHERE id = ?").bind(id).run();
    if (!result.meta.changes) return reply({ error: "App not found" }, 404);
    try {
      await env.DB.prepare("DELETE FROM app_versions WHERE app_id = ?").bind(id).run();
    } catch {}
    return reply({ ok: true });
  } catch {
    return reply({ error: "Could not delete the app" }, 500);
  }
}
