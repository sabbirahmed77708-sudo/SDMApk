// Shared helpers for the apps API: column detection, validation and row shaping.
// Exports no onRequest* handlers, so it is not a route.

const BASE_COLUMNS = [
  "id",
  "name",
  "description",
  "category",
  "version",
  "download_url",
  "icon_url",
  "created_at",
];

export const MAX_SCREENSHOTS = 8;

// The optional columns (screenshots, published) come from migration 0002.
// Detect them so the API keeps working before and after that migration.
export async function getColumns(env) {
  const { results = [] } = await env.DB.prepare("PRAGMA table_info(apps)").all();
  return new Set(results.map((r) => r.name));
}

export function selectList(cols) {
  const list = [...BASE_COLUMNS];
  if (cols.has("screenshots")) list.push("screenshots");
  if (cols.has("published")) list.push("published");
  return list.join(",");
}

export function shapeApp(row) {
  let screenshots = [];
  if (row.screenshots) {
    try {
      const parsed = JSON.parse(row.screenshots);
      if (Array.isArray(parsed)) screenshots = parsed.filter((x) => typeof x === "string");
    } catch {
      screenshots = [];
    }
  }
  return {
    id: row.id,
    name: row.name,
    description: row.description || "",
    category: row.category || "Other",
    version: row.version || "",
    download_url: row.download_url,
    icon_url: row.icon_url || "",
    screenshots,
    published: row.published === undefined ? true : Number(row.published) !== 0,
    created_at: row.created_at,
  };
}

export function httpsUrl(value, max = 2000) {
  const s = String(value ?? "").trim();
  if (!s || s.length > max) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== "https:" || u.username || u.password) return null;
    return u.href;
  } catch {
    return null;
  }
}

function text(value) {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return null;
}

export function cleanCategory(value) {
  const c = text(value);
  if (c === null) return { error: "Category must be text" };
  const name = c || "Other";
  if (name.length > 40) return { error: "Category must be 40 characters or fewer" };
  if (!/^[\p{L}\p{N} &+\-/]+$/u.test(name)) {
    return { error: "Category can only contain letters, numbers, spaces and & + - /" };
  }
  return { value: name };
}

// Returns { error } or { value } where value holds the columns to store.
export function normalizeApp(d, cols) {
  const name = text(d.name);
  if (!name) return { error: "App name is required" };
  if (name.length > 100) return { error: "App name must be 100 characters or fewer" };

  const description = text(d.description);
  if (description === null) return { error: "Description must be text" };
  if (description.length > 1000) return { error: "Description must be 1000 characters or fewer" };

  const category = cleanCategory(d.category);
  if (category.error) return { error: category.error };

  const version = text(d.version);
  if (version === null) return { error: "Version must be text" };
  if (version.length > 40) return { error: "Version must be 40 characters or fewer" };

  const download = httpsUrl(d.download_url);
  if (!download) return { error: "Download URL must be a valid HTTPS link" };

  let icon = "";
  if (d.icon_url !== undefined && d.icon_url !== null && String(d.icon_url).trim() !== "") {
    icon = httpsUrl(d.icon_url);
    if (!icon) return { error: "Icon URL must be a valid HTTPS link" };
  }

  let rawShots = d.screenshots;
  if (typeof rawShots === "string") rawShots = rawShots.split(/\r?\n/);
  if (rawShots === undefined || rawShots === null) rawShots = [];
  if (!Array.isArray(rawShots)) return { error: "Screenshots must be a list of links" };
  const screenshots = [];
  for (const item of rawShots) {
    if (String(item ?? "").trim() === "") continue;
    const url = httpsUrl(item);
    if (!url) return { error: "Every screenshot must be a valid HTTPS link" };
    if (!screenshots.includes(url)) screenshots.push(url);
  }
  if (screenshots.length > MAX_SCREENSHOTS) {
    return { error: `Add at most ${MAX_SCREENSHOTS} screenshots` };
  }

  let published = true;
  if (d.published !== undefined && d.published !== null) {
    if (d.published === true || d.published === 1) published = true;
    else if (d.published === false || d.published === 0) published = false;
    else return { error: "Published must be true or false" };
  }

  if ((screenshots.length || !published) && !(cols.has("screenshots") && cols.has("published"))) {
    return {
      error:
        "The database needs migration 0002 before it can store screenshots or hide apps. Run it, then try again.",
      status: 409,
    };
  }

  const value = {
    name,
    description,
    category: category.value,
    version,
    download_url: download,
    icon_url: icon,
  };
  if (cols.has("screenshots")) value.screenshots = JSON.stringify(screenshots);
  if (cols.has("published")) value.published = published ? 1 : 0;
  return { value };
}

export function parseId(raw) {
  const s = String(raw ?? "");
  if (!/^[1-9]\d{0,12}$/.test(s)) return null;
  return Number(s);
}
