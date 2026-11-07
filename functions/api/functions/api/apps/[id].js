import { requireAdmin } from "../_auth.js";

export async function onRequestPut({ request, env, params }) {
  const auth = await requireAdmin(request, env);
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  await env.DB.prepare(
    `UPDATE apps
     SET name = ?, description = ?, category = ?, version = ?,
         download_url = ?, icon_url = ?
     WHERE id = ?`
  ).bind(
    data.name,
    data.description || "",
    data.category || "",
    data.version || "",
    data.download_url,
    data.icon_url || "",
    params.id
  ).run();

  return Response.json({ success: true });
}

export async function onRequestDelete({ request, env, params }) {
  const auth = await requireAdmin(request, env);
  if (!auth) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await env.DB.prepare(
    "DELETE FROM apps WHERE id = ?"
  ).bind(params.id).run();

  return Response.json({ success: true });
}
