import { reply, isSameOrigin, readJson, requireAdmin } from "./_auth.js";
import { ensureTables, readContact, CONTACT_KEYS } from "./_db.js";
import { httpsUrl } from "./_apps.js";

// GET /api/settings — public contact details for the About page.
export async function onRequestGet({ env }) {
  if (!env.DB) return reply({ contact: {} });
  return reply({ contact: await readContact(env) });
}

const EMAIL = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/;

// PUT /api/settings — save contact details (admin only). Empty value removes a field.
export async function onRequestPut({ request, env }) {
  if (!isSameOrigin(request)) return reply({ error: "Invalid request origin" }, 403);
  if (!(await requireAdmin(request, env))) return reply({ error: "Unauthorized" }, 401);
  if (!env.DB) return reply({ error: "Database is not connected" }, 503);
  const body = await readJson(request, 5000);
  if (body.error) return reply({ error: body.error }, 400);

  const clean = {};
  const text = (k, max) => String(body.data[k] ?? "").trim().slice(0, max);
  const email = text("contact_email", 120);
  if (email && !EMAIL.test(email)) return reply({ error: "That email address does not look right" }, 400);
  clean.contact_email = email;
  const tg = text("contact_telegram", 200);
  if (tg && !httpsUrl(tg)) return reply({ error: "The Telegram link must start with https://" }, 400);
  clean.contact_telegram = tg ? httpsUrl(tg) : "";
  const site = text("contact_website", 200);
  if (site && !httpsUrl(site)) return reply({ error: "The website link must start with https://" }, 400);
  clean.contact_website = site ? httpsUrl(site) : "";
  clean.contact_note = text("contact_note", 300);

  try {
    await ensureTables(env);
    for (const k of CONTACT_KEYS) {
      if (clean[k]) {
        await env.DB.prepare(
          "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
        )
          .bind(k, clean[k])
          .run();
      } else {
        await env.DB.prepare("DELETE FROM settings WHERE key = ?").bind(k).run();
      }
    }
    return reply({ ok: true, contact: await readContact(env) });
  } catch {
    return reply({ error: "Could not save the contact details" }, 500);
  }
}
