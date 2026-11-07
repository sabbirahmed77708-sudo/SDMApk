# AppNook পূর্ণাঙ্গ সেটআপ (Cloudflare Pages + D1)

এই সংস্করণে Public visitor শুধু অ্যাপ দেখবে/ডাউনলোড করবে। Admin login ছাড়া API-তে Add/Edit/Delete সম্ভব নয়। Admin password ও session secret কখনো HTML/JavaScript-এ রাখা হয়নি।

## ১) GitHub-এ ফাইল আপলোড
এই ZIP-এর সব ফাইল ও ফোল্ডার `AppNook` repository-র root-এ আপলোড করে `main` branch-এ commit করুন। পুরোনো `index.html` replace হবে; `admin/`, `functions/`, `migrations/`, `wrangler.toml` নতুন ফাইল।

## ২) D1 database তৈরি
Cloudflare Dashboard → Workers & Pages → D1 SQL Database → Create database → নাম `appnook-db` দিন।
Database-এর UUID কপি করুন। `wrangler.toml`-এর `REPLACE_WITH_YOUR_D1_DATABASE_ID` জায়গায় বসিয়ে commit করুন।

## ৩) টেবিল তৈরি
D1 database → Console-এ `migrations/0001_create_apps.sql` ফাইলের SQL চালান।

## ৪) Pages Function binding
Cloudflare Dashboard → Workers & Pages → appnook → Settings → Functions → D1 database bindings → Add binding:
Variable name: `DB`
D1 database: `appnook-db`
Save করুন।

## ৫) Admin secrets যোগ
Settings → Variables and Secrets → Add:
- `ADMIN_PASSWORD` (Secret): নিজের শক্তিশালী, অন্য কোথাও ব্যবহার না করা password
- `SESSION_SECRET` (Secret): কমপক্ষে 32 random characters-এর আলাদা secret
Save করে redeploy করুন। Password/secret কাউকে দেবেন না, এখানে চ্যাটেও পাঠাবেন না।

## ৬) Admin ব্যবহার
Public site: `https://appnook.pages.dev/`
Admin: `https://appnook.pages.dev/admin/login.html`
শুধু নিজের ডিভাইসে লগইন করুন; কাজ শেষে Log out করুন।

## গুরুত্বপূর্ণ নিরাপত্তা ও সীমা
- GitHub repository-তে collaborator access কাউকে দেবেন না। Public repo-তে source code সবাই দেখতে পারে; কিন্তু Cloudflare secrets ও D1 write API access পাবে না।
- Admin password website source-এ নেই; API write endpoints HMAC-signed HttpOnly Secure cookie যাচাই করে।
- HTTPS বাধ্যতামূলক cookie-এর জন্য।
- প্রথমে public app list খালি থাকবে। Admin login করে অ্যাপ যোগ করুন।
- এটি single-admin password login। Cloudflare account/GitHub account-এ 2FA চালু রাখুন।
- D1 binding ও secrets configure না করলে admin/API কাজ করবে না; শুধু static site দেখা যাবে।
