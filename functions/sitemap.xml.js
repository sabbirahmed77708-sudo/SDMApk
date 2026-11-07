import { getColumns } from "./api/_apps.js";

// GET /sitemap.xml — the main pages plus one entry for every published app.
export async function onRequestGet({ request, env }) {
  const origin = new URL(request.url).origin;
  const urls = [
    { loc: `${origin}/` },
    { loc: `${origin}/about/` },
    { loc: `${origin}/privacy/` },
    { loc: `${origin}/terms/` },
  ];

  if (env.DB) {
    try {
      const cols = await getColumns(env);
      const where = cols.has("published") ? " WHERE published = 1" : "";
      const { results = [] } = await env.DB.prepare(
        `SELECT id, created_at FROM apps${where} ORDER BY id DESC LIMIT 5000`
      ).all();
      for (const row of results) {
        urls.push({ loc: `${origin}/app/?id=${row.id}`, lastmod: String(row.created_at || "").slice(0, 10) });
      }
    } catch {
      // Serve the static pages even if the database is not ready.
    }
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map((u) => `  <url><loc>${u.loc}</loc>${/^\d{4}-\d{2}-\d{2}$/.test(u.lastmod || "") ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`)
      .join("\n") +
    "\n</urlset>\n";
  return new Response(xml, {
    headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
