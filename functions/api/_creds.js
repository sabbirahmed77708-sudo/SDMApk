// Admin password checks: a password saved from the admin panel (PBKDF2, in the database)
// wins over the ADMIN_PASSWORD secret. Exports no onRequest* handlers.

const enc = new TextEncoder();
const ITER = 100000; // Cloudflare Workers allows up to 100000 PBKDF2 iterations.

const digest = async (s) => new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(s)));

function equalBytes(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

const hex = (b) => [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
const unhex = (s) => Uint8Array.from(s.match(/../g) || [], (h) => parseInt(h, 16));

async function pbkdf2(password, salt, iterations) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return new Uint8Array(
    await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256)
  );
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return `pbkdf2$${ITER}$${hex(salt)}$${hex(await pbkdf2(password, salt, ITER))}`;
}

async function savedHash(env) {
  try {
    const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'admin_pass'").first();
    return row && row.value ? String(row.value) : "";
  } catch {
    return "";
  }
}

export async function verifyPassword(env, password) {
  const saved = env.DB ? await savedHash(env) : "";
  if (saved) {
    const [kind, iter, salt, hash] = saved.split("$");
    if (kind !== "pbkdf2" || !salt || !hash) return false;
    return equalBytes(await pbkdf2(password, unhex(salt), Number(iter) || ITER), unhex(hash));
  }
  const [a, b] = await Promise.all([digest(password), digest(env.ADMIN_PASSWORD || "")]);
  return equalBytes(a, b);
}

export async function sameText(a, b) {
  const [x, y] = await Promise.all([digest(a), digest(b)]);
  return equalBytes(x, y);
}
