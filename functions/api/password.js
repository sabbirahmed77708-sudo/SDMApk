import { reply, isSameOrigin, readJson, requireAdmin } from "./_auth.js";
import { verifyPassword, hashPassword } from "./_creds.js";
import { ensureTables } from "./_db.js";

// POST /api/password { current, next } — change the admin password (admin only).
export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return reply({ error: "Invalid request origin" }, 403);
  if (!(await requireAdmin(request, env))) return reply({ error: "Unauthorized" }, 401);
  if (!env.DB) return reply({ error: "Database is not connected" }, 503);
  const body = await readJson(request, 2000);
  if (body.error) return reply({ error: body.error }, 400);
  const current = String(body.data.current || "").slice(0, 500);
  const next = String(body.data.next || "");
  if (next.length < 10) return reply({ error: "The new password must be at least 10 characters" }, 400);
  if (next.length > 200) return reply({ error: "The new password is too long (200 characters at most)" }, 400);
  if (!(await verifyPassword(env, current))) {
    return reply({ error: "The current password is not correct" }, 403);
  }
  try {
    await ensureTables(env);
    await env.DB.prepare(
      "INSERT INTO settings (key, value) VALUES ('admin_pass', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
    )
      .bind(await hashPassword(next))
      .run();
    return reply({ ok: true });
  } catch {
    return reply({ error: "Could not save the new password" }, 500);
  }
}
