// Shared auth + response helpers for SdmApk (Cloudflare Pages Functions).
// This file exports no onRequest* handlers, so it is not a route.

const enc = new TextEncoder();
const COOKIE_NAME = "sdmapk_session";
const SESSION_SECONDS = 8 * 60 * 60;

function b64url(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromB64url(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(s + "=".repeat((4 - (s.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return b64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(value))));
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function reply(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...headers,
    },
  });
}

// Browsers always send Origin on cross-site POST/PUT/DELETE. Reject if it differs.
export function isSameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function readJson(request, maxBytes = 20000) {
  let text;
  try {
    text = await request.text();
  } catch {
    return { error: "Could not read the request body" };
  }
  if (text.length > maxBytes) return { error: "Request body is too large" };
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { error: "Request body must be a JSON object" };
    }
    return { data };
  } catch {
    return { error: "Request body is not valid JSON" };
  }
}

export async function createSession(secret, username) {
  const payload = b64url(
    enc.encode(JSON.stringify({ u: username, exp: Date.now() + SESSION_SECONDS * 1000 }))
  );
  return payload + "." + (await sign(payload, secret));
}

export async function requireAdmin(request, env) {
  if (!env.SESSION_SECRET) return false;
  const cookies = request.headers.get("Cookie") || "";
  const item = cookies
    .split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(COOKIE_NAME + "="));
  if (!item) return false;
  const token = item.slice(COOKIE_NAME.length + 1);
  const dot = token.lastIndexOf(".");
  if (dot < 1) return false;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!safeEqual(signature, await sign(payload, env.SESSION_SECRET))) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    return data.u === (env.ADMIN_USERNAME || "admin") && data.exp > Date.now();
  } catch {
    return false;
  }
}

function isHttps(request) {
  return new URL(request.url).protocol === "https:";
}

export function sessionCookie(token, request) {
  return (
    `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_SECONDS}` +
    (isHttps(request) ? "; Secure" : "")
  );
}

export function clearCookie(request) {
  return (
    `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0` +
    (isHttps(request) ? "; Secure" : "")
  );
}
