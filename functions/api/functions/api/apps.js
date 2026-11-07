import { requireAdmin } from "./_auth.js";

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM apps ORDER BY created_at DESC"
  ).all();

  return Response.json(results);
}

export async function onRequestPost({ request, env }) {
  const auth = await requireAdmin(request, env);
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  if (!data.name || !data.download_url) {
    return Response.json(
      { error: "Name and download URL are required" },
      { status: 400 }
    );
  }

  const result = await env.DB.prepare(
    `INSERT INTO apps (name, description, category, version, download_url, icon_url)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(
    data.name,
    data.description || "",
    data.category || "",
    data.version || "",
    data.download_url,
    data.icon_url || ""
  ).run();

  return Response.json({ success: true, id: result.meta.last_row_id });
}
