# AppNook Admin Upgrade — সেটআপ

## এই প্যাকেজে কী আছে
- আগের AppNook-এর মতোই Public homepage, তবে অ্যাপগুলো D1 database থেকে আসবে
- `/admin/login.html` — Admin login
- `/admin/` — App add, edit, delete
- `/api/apps` — Public read; write করতে valid Admin session লাগে
- Session cookie: HttpOnly, Secure, SameSite=Strict, 8 ঘণ্টা মেয়াদ
- Download এবং icon URL-এ HTTPS বাধ্যতামূলক

## GitHub-এ আপলোড
1. `AppNook` repository-এর `main` branch খুলুন।
2. এই ZIP extract করে এর ভেতরের ফাইল/ফোল্ডারগুলো repository root-এ upload করুন।
3. `index.html` ও `wrangler.toml` replace হবে; `admin/` এবং `functions/` নতুন যোগ হবে।
4. Commit changes করুন। Cloudflare Pages auto deployment চালাবে।

## Cloudflare Secrets
Cloudflare → Workers & Pages → appnook → Settings → Variables and Secrets → Add:
- `ADMIN_USERNAME` — Text variable; যেমন `admin`
- `ADMIN_PASSWORD` — Secret; নিজের জন্য শক্তিশালী ও অন্য কোথাও ব্যবহার না করা password
- `SESSION_SECRET` — Secret; অন্তত 32 অক্ষরের আলাদা random secret

কোনো password বা secret চ্যাটে পাঠাবেন না। এগুলো শুধু Cloudflare-এ নিজে লিখবেন। Save করার পর নতুন deployment নিশ্চিত করুন।

## Database
`wrangler.toml`-এ বর্তমান D1 database ID বসানো আছে। Cloudflare Pages Settings → Bindings-এ D1 binding-এর Variable name অবশ্যই `DB` এবং database `appnook-db` হতে হবে।
আগে তৈরি করা `apps` টেবিলের schema এই API-র সঙ্গে মিলে যায়:
`id, name, description, category, version, download_url, icon_url, created_at`

## ব্যবহার
- Public site: `https://appnook.pages.dev/`
- Admin login: `https://appnook.pages.dev/admin/login.html`

প্রথমে Admin login দিয়ে প্রবেশ করে একটি test app যোগ করে public site-এ দেখা যাচ্ছে কি না পরীক্ষা করুন।
GitHub ও Cloudflare account-এ 2FA চালু রাখুন; repository-তে কাউকে collaborator করবেন না যদি তাদের code access দিতে না চান।

## গুরুত্বপূর্ণ
GitHub repository public হলে source code দেখা যাবে, কিন্তু Admin password/secret source code-এ রাখা হয়নি। Visitor API দিয়ে শুধু app list পড়তে পারে; add/edit/delete-এর জন্য signed admin session আবশ্যক। এই starter-এ rate limiting অন্তর্ভুক্ত নয়, তাই শক্তিশালী password ব্যবহার করুন এবং account 2FA চালু রাখুন।
