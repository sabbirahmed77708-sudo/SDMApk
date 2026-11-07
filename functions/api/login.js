import { reply, isSameOrigin, readJson, createSession, sessionCookie } from "./_auth.js";

const digest = async (s) =>
  new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));

function equalBytes(a, b) {
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return reply({ error: "Invalid request origin" }, 403);
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) {
    return reply({ error: "Admin login is not configured yet" }, 503);
  }

  const body = await readJson(request, 2000);
  if (body.error) return reply({ error: body.error }, 400);

  const expectedUser = env.ADMIN_USERNAME || "admin";
  const user = String(body.data.username || "").slice(0, 200);
  const pass = String(body.data.password || "").slice(0, 500);

  // Compare fixed-length hashes so the check takes the same time for any input.
  const [u1, u2, p1, p2] = await Promise.all([
    digest(user),
    digest(expectedUser),
    digest(pass),
    digest(env.ADMIN_PASSWORD),
  ]);
  const userOk = equalBytes(u1, u2);
  const passOk = equalBytes(p1, p2);
  if (!userOk || !passOk) {
    return reply({ error: "Username or password is incorrect" }, 401);
  }

  const token = await createSession(env.SESSION_SECRET, expectedUser);
  return reply({ ok: true }, 200, { "set-cookie": sessionCookie(token, request) });
}
