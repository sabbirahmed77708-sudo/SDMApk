import { reply, isSameOrigin, requireAdmin } from "../../_auth.js";
import { getColumns, parseId } from "../../_apps.js";

// GET /api/apps/:id/versions — older versions of a published app (newest first).
export async function onRequestGet({ request, env, params }) {
  const id = parseId(params.id);
  if (!id) return reply({ error: "Invalid app id" }, 400);
  if (!env.DB) return reply({ versions: [] });
  try {
    const cols = await getColumns(env);
    const admin = await requireAdmin(request, env);
    const app = await env.DB.prepare(
      `SELECT id${cols.has("published") ? ", published" : ""} FROM apps WHERE id = ?`
    )
      .bind(id)
      .first();
    if (!app || (cols.has("published") && !app.published && !admin)) {
      return reply({ error: "App not found" }, 404);
    }
    let versions = [];
    try {
      versions =
        (
          await env.DB.prepare(
            "SELECT id, version, download_url, created_at FROM app_versions WHERE app_id = ? ORDER BY id DESC LIMIT 50"
          )
            .bind(id)
            .all()
        ).results || [];
    } catch {
      // Table not created yet: no older versions.
    }
    return reply({ versions });
  } catch {
    return reply({ error: "Could not load older versions" }, 500);
  }
}

// DELETE /api/apps/:id/versions?v=7 — remove one older version (admin only).
export async function onRequestDelete({ request, env, params }) {
  if (!isSameOrigin(request)) return reply({ error: "Invalid request origin" }, 403);
  if (!(await requireAdmin(request, env))) return reply({ error: "Unauthorized" }, 401);
  const id = parseId(params.id);
  const vid = parseId(new URL(request.url).searchParams.get("v") || "");
  if (!id || !vid) return reply({ error: "Invalid id" }, 400);
  if (!env.DB) return reply({ error: "Database is not connected" }, 503);
  try {
    const r = await env.DB.prepare("DELETE FROM app_versions WHERE id = ? AND app_id = ?").bind(vid, id).run();
    if (!r.meta.changes) return reply({ error: "Version not found" }, 404);
    return reply({ ok: true });
  } catch {
    return reply({ error: "Could not remove the version" }, 500);
  }
}
