import { getColumns, selectList, shapeApp, parseId } from "../api/_apps.js";

// GET /app/?id=3
// The page is built in the browser, but Facebook, WhatsApp and Google read the
// raw HTML. This fills in the title, description and image for that app so
// shared links show a proper preview. If anything fails, the plain page is served.

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function loadPage(env, url) {
  let res = await env.ASSETS.fetch(new Request(new URL("/app/", url)));
  if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
    res = await env.ASSETS.fetch(new Request(new URL(res.headers.get("location"), url)));
  }
  return res;
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const page = await loadPage(env, url);
  try {
    const id = parseId(url.searchParams.get("id") || "");
    if (!id || !page.ok || !env.DB) return page;

    const cols = await getColumns(env);
    const row = await env.DB.prepare(`SELECT ${selectList(cols)} FROM apps WHERE id = ?`).bind(id).first();
    if (!row) return page;
    const app = shapeApp(row);
    if (!app.published) return page;

    const name = esc(app.name);
    const text = (app.description || "").replace(/\s+/g, " ").trim();
    const desc = esc((text || `Download ${app.name} from SdmApk.`).slice(0, 155));
    const icon = /^https:\/\//i.test(app.icon_url) ? app.icon_url : `${url.origin}/assets/logo-512.png`;
    const canonical = `${url.origin}/app/?id=${id}`;

    let html = await page.text();
    html = html
      .replace("<title>App details · SdmApk</title>", `<title>${name} · SdmApk</title>`)
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${desc}">`)
      .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${name} · SdmApk">`)
      .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${desc}">`)
      .replace(
        "</head>",
        `<meta property="og:image" content="${esc(icon)}">\n<meta property="og:url" content="${esc(canonical)}">\n<link rel="canonical" href="${esc(canonical)}">\n</head>`
      );

    const headers = new Headers(page.headers);
    headers.delete("content-length");
    headers.delete("etag");
    headers.set("content-type", "text/html; charset=utf-8");
    headers.set("cache-control", "public, max-age=60");
    return new Response(html, { status: 200, headers });
  } catch {
    return page;
  }
}
