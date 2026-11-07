# AppNook website

This is a responsive static app directory website.

## Publish with GitHub Pages
1. Open the `AppNook` repository on GitHub.
2. Choose **Add file → Upload files**.
3. Upload `index.html` from this folder and commit to `main`.
4. Open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select branch `main`, folder `/(root)`, then press **Save**.
7. Wait for the Pages deployment to finish. The site address will be shown in Settings → Pages.

## Add more apps
Open `index.html` in a text editor and add another object inside the `apps` list in the `<script>` section. Each app needs:
- `name`
- `category` (Tools, Browsers, or Creative; add a matching category button if needed)
- `icon` (emoji)
- `platform`
- `description`
- `url` (prefer the official download page)

Only add apps and links that you have checked and trust.
