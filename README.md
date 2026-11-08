# SdmApk

Discover. Download. Enjoy.

Live site: https://sdmapk.pages.dev/

SdmApk is an Android app directory built on Cloudflare Pages Functions and a D1 database.

- Public site: browse, search, filter by category, open an app page and download.
- Admin: `/admin/` (sign in at `/admin/login.html`) to add, edit, hide and delete apps and manage categories.
- No build step. Pages are plain HTML, CSS and JavaScript.

## Layout

```
index.html                public homepage
app/index.html            app details (/app/?id=1)
about/ privacy/ terms/    text pages
admin/                    login + dashboard (noindex)
assets/                   shared CSS and JS, favicon
functions/api/            _auth.js, _apps.js (helpers), login, logout, me, apps, apps/[id], categories
functions/robots.txt.js   robots.txt built from the request URL
functions/sitemap.xml.js  sitemap with every published app
migrations/               D1 SQL (0001 base table, 0002 screenshots + published flag)
_headers                  security headers and CSP
```

## API

| Method | Path | Access |
| --- | --- | --- |
| GET | `/api/apps` | public, published apps (`?all=1` for admins) |
| GET | `/api/apps/:id` | public |
| POST | `/api/apps` | admin |
| PUT / DELETE | `/api/apps/:id` | admin |
| GET | `/api/categories` | public |
| PUT / DELETE | `/api/categories` | admin (rename / move to Other) |
| POST | `/api/login`, `/api/logout` | open / same-origin |
| GET | `/api/me` | admin session check |

Responses are JSON, for example `{ "apps": [] }`. Errors are `{ "error": "message" }`.

## Configuration

Cloudflare Pages needs the D1 binding `DB` (database `appnook-db`) and these variables:

- `ADMIN_USERNAME` (text, defaults to `admin` if unset)
- `ADMIN_PASSWORD` (secret)
- `SESSION_SECRET` (secret, 32+ random characters)

See `SETUP_BN.md` for the step-by-step guide in Bengali.
