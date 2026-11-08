# SdmApk — সেটআপ গাইড

SdmApk হলো আপনার নিজের অ্যাপ দেখানোর ওয়েবসাইট। যে কেউ অ্যাপ দেখে ডাউনলোড করতে পারবে, আর শুধু আপনি অ্যাডমিন প্যানেল থেকে সবকিছু বদলাতে পারবেন।

## ১. Cloudflare-এ তিনটি Variable দিন
Cloudflare → Workers & Pages → আপনার Pages প্রজেক্ট → Settings → Variables and Secrets → Add:

| নাম | ধরন | কী দেবেন |
| --- | --- | --- |
| `ADMIN_USERNAME` | Text | যেমন `admin` (নিজের পছন্দের নাম দিতে পারেন) |
| `ADMIN_PASSWORD` | Secret | শক্তিশালী পাসওয়ার্ড, অন্য কোথাও ব্যবহার করবেন না |
| `SESSION_SECRET` | Secret | কমপক্ষে ৩২ অক্ষরের এলোমেলো লেখা |

`SESSION_SECRET` বানাতে পাসওয়ার্ড ম্যানেজারের "generate password" ব্যবহার করুন (৪০+ অক্ষর)।

**গুরুত্বপূর্ণ:** পাসওয়ার্ড বা secret কখনো চ্যাটে, GitHub-এ বা কোডে লিখবেন না। শুধু Cloudflare-এর ঘরে নিজে লিখবেন। Save করার পর নতুন deployment করুন (Deployments → Retry deployment)।

## ২. D1 ডাটাবেস বাইন্ডিং
Settings → Bindings → D1 database bindings-এ:
- Variable name: `DB` (অবশ্যই এটাই)
- Database: `appnook-db`

`wrangler.toml`-এ আগের database ID-ই আছে, বদলানো হয়নি।

## ৩. ডাটাবেসের migration (একবার)
আপনার আগের `apps` টেবিল যেমন আছে তেমনই কাজ করবে, কোনো ডাটা মুছবে না। স্ক্রিনশট আর "লুকিয়ে রাখা (Hide) অ্যাপ" ফিচার চালু করতে একবার এই SQL চালান:

Cloudflare → Storage & Databases → D1 → `appnook-db` → Console-এ পেস্ট করে Execute চাপুন:

```sql
ALTER TABLE apps ADD COLUMN screenshots TEXT NOT NULL DEFAULT '';
ALTER TABLE apps ADD COLUMN published INTEGER NOT NULL DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category);
```

এটা **শুধু একবার** চালাবেন। দ্বিতীয়বার চালালে "duplicate column" এরর আসবে, তাতে ক্ষতি হয় না। না চালালেও সাইট ঠিক চলবে, শুধু স্ক্রিনশট আর Hide কাজ করবে না (অ্যাডমিন প্যানেলে পরিষ্কার মেসেজ দেখাবে)।

টেবিল একেবারে নতুন হলে আগে `migrations/0001_init.sql`-এর SQL চালান।

## ৪. অ্যাপ (APK ফাইল) কোথায় রাখবেন
Cloudflare Pages-এ প্রতিটি ফাইল ২৫ MB-এর বেশি হতে পারে না, তাই APK এই রিপোজিটরিতে রাখবেন না। সবচেয়ে সহজ উপায়:
1. GitHub-এ রিপোজিটরির **Releases** → Create a new release → APK ফাইল upload করুন।
2. APK-র লিংকটা কপি করুন (https দিয়ে শুরু)।
3. অ্যাডমিন প্যানেলে "Download URL"-এ সেই লিংক বসান।

## ৫. ব্যবহার
- পাবলিক সাইট: `https://sdmapk.pages.dev/`
- অ্যাডমিন: `/admin/login.html` (সাইন ইন করার পর `/admin/`)
- অ্যাডমিনে অ্যাপ যোগ, এডিট, লুকানো, ডিলিট, ক্যাটাগরির নাম বদল আর সার্চ করা যায়।
- ডাউনলোড আর আইকনের লিংক অবশ্যই HTTPS হতে হবে।

## ৬. পরে বদলাতে পারেন
- যোগাযোগের তথ্য: `about/index.html`-এ "Contact" অংশে এখন লেখা আছে তথ্য এখনো দেওয়া হয়নি। নিজের আসল ইমেইল বা লিংক বসান।
- GitHub ও Cloudflare অ্যাকাউন্টে 2FA চালু রাখুন।
- এই স্টার্টারে লগইনে অতিরিক্ত rate limit নেই, তাই শক্তিশালী পাসওয়ার্ড দিন।
