import { reply, isSameOrigin, readJson, createSession, sessionCookie } from "./_auth.js";
import { verifyPassword, sameText } from "./_creds.js";
import { ensureTables } from "./_db.js";

const MAX_FAILS = 5; // wrong tries allowed...
const WINDOW_MS = 15 * 60 * 1000; // ...within this time, then locked for the same time

function clientKey(request) {
  return (request.headers.get("cf-connecting-ip") || "local").slice(0, 64);
}

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return reply({ error: "Invalid request origin" }, 403);
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return reply({ error: "Admin login is not configured yet" }, 503);
  }

  const body = await readJson(request, 2000);
  if (body.error) return reply({ error: body.error }, 400);

  const key = clientKey(request);
  const now = Date.now();
  let tracked = false;
  if (env.DB) {
    try {
      await ensureTables(env);
      const row = await env.DB.prepare("SELECT fails, first_at, locked_until FROM login_attempts WHERE ip = ?")
        .bind(key)
        .first();
      if (row && row.locked_until > now) {
        const mins = Math.ceil((row.locked_until - now) / 60000);
        return reply(
          { error: `Too many wrong attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.` },
          429,
          { "retry-after": String(Math.ceil((row.locked_until - now) / 1000)) }
        );
      }
      tracked = true;
    } catch {
      // If the database is unavailable the login still works, just without lockout.
    }
  }

  const expectedUser = env.ADMIN_USERNAME || "admin";
  const user = String(body.data.username || "").slice(0, 200);
  const pass = String(body.data.password || "").slice(0, 500);

  const userOk = await sameText(user, expectedUser);
  const passOk = await verifyPassword(env, pass);

  if (!userOk || !passOk) {
    if (tracked) {
      try {
        const row = await env.DB.prepare("SELECT fails, first_at FROM login_attempts WHERE ip = ?")
          .bind(key)
          .first();
        const fresh = !row || now - row.first_at > WINDOW_MS;
        const fails = fresh ? 1 : row.fails + 1;
        const first = fresh ? now : row.first_at;
        const lock = fails >= MAX_FAILS ? now + WINDOW_MS : 0;
        await env.DB.prepare(
          "INSERT INTO login_attempts (ip, fails, first_at, locked_until) VALUES (?, ?, ?, ?) " +
            "ON CONFLICT(ip) DO UPDATE SET fails = excluded.fails, first_at = excluded.first_at, locked_until = excluded.locked_until"
        )
          .bind(key, fails, first, lock)
          .run();
      } catch {}
    }
    return reply({ error: "Username or password is incorrect" }, 401);
  }

  if (tracked) {
    try {
      await env.DB.prepare("DELETE FROM login_attempts WHERE ip = ?").bind(key).run();
    } catch {}
  }
  const token = await createSession(env.SESSION_SECRET, expectedUser);
  return reply({ ok: true }, 200, { "set-cookie": sessionCookie(token, request) });
}
