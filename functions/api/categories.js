import { reply, isSameOrigin, readJson, requireAdmin } from "./_auth.js";
import { getColumns, cleanCategory } from "./_apps.js";

// GET /api/categories — categories that exist in the database, with app counts.
// Public callers only count published apps; admins can add ?all=1 to count everything.
export async function onRequestGet({ request, env }) {
  if (!env.DB) return reply({ error: "Database is not connected" }, 503);
  try {
    const cols = await getColumns(env);
    if (!cols.has("category")) return reply({ error: "Database is not set up yet" }, 503);
    const wantAll = new URL(request.url).searchParams.get("all") === "1";
    const includeHidden = wantAll && (await requireAdmin(request, env));
    const where = cols.has("published") && !includeHidden ? " WHERE published = 1" : "";
    const { results = [] } = await env.DB.prepare(
      `SELECT category AS name, COUNT(*) AS count FROM apps${where} GROUP BY category ORDER BY count DESC, name ASC`
    ).all();
    return reply({ categories: results.map((r) => ({ name: r.name || "Other", count: r.count })) });
  } catch {
    return reply({ error: "Could not load categories" }, 500);
  }
}

// PUT /api/categories — rename a category across all apps (admin only). Body: { from, to }
export async function onRequestPut({ request, env }) {
  if (!isSameOrigin(request)) return reply({ error: "Invalid request origin" }, 403);
  if (!(await requireAdmin(request, env))) return reply({ error: "Unauthorized" }, 401);
  if (!env.DB) return reply({ error: "Database is not connected" }, 503);

  const body = await readJson(request, 2000);
  if (body.error) return reply({ error: body.error }, 400);
  const from = String(body.data.from ?? "").trim();
  if (!from) return reply({ error: "Choose the category to rename" }, 400);
  const to = cleanCategory(body.data.to);
  if (to.error) return reply({ error: to.error }, 400);

  try {
    const result = await env.DB.prepare("UPDATE apps SET category = ? WHERE category = ?")
      .bind(to.value, from)
      .run();
    if (!result.meta.changes) return reply({ error: "Category not found" }, 404);
    return reply({ ok: true, updated: result.meta.changes });
  } catch {
    return reply({ error: "Could not rename the category" }, 500);
  }
}

// DELETE /api/categories — move every app in a category to "Other" (admin only). Body: { name }
export async function onRequestDelete({ request, env }) {
  if (!isSameOrigin(request)) return reply({ error: "Invalid request origin" }, 403);
  if (!(await requireAdmin(request, env))) return reply({ error: "Unauthorized" }, 401);
  if (!env.DB) return reply({ error: "Database is not connected" }, 503);

  const body = await readJson(request, 2000);
  if (body.error) return reply({ error: body.error }, 400);
  const name = String(body.data.name ?? "").trim();
  if (!name) return reply({ error: "Choose the category to remove" }, 400);
  if (name === "Other") return reply({ error: "The Other category cannot be removed" }, 400);

  try {
    const result = await env.DB.prepare("UPDATE apps SET category = 'Other' WHERE category = ?")
      .bind(name)
      .run();
    if (!result.meta.changes) return reply({ error: "Category not found" }, 404);
    return reply({ ok: true, updated: result.meta.changes });
  } catch {
    return reply({ error: "Could not remove the category" }, 500);
  }
}
