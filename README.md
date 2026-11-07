# AppNook

A responsive static app directory hosted with Cloudflare Pages.

## What is included
- Responsive layout for phones, tablets and computers
- Live app search
- Automatically generated category filters
- App cards with platform details and official download links
- Safe text rendering for app data

## Add a new app
1. Open `index.html` in GitHub and choose the pencil (Edit) icon.
2. Find the `const apps = [` section.
3. Add a new object before the closing `];`, with the same fields as this example:

```js
{name:"Example App",category:"Tools",icon:"🧰",platform:"Windows · Android",description:"A short description of the app.",url:"https://official-app-website.example/download"}
```

4. Use the app publisher's official download page for `url`.
5. Commit the change to the `main` branch. Cloudflare Pages should automatically redeploy.

You do not need to add a category button manually; the site creates category filters from the app list.

## Important
This is a static directory. Visitors can browse and search, but they cannot submit apps themselves. A public submission/admin system would need a backend and spam/security controls.
