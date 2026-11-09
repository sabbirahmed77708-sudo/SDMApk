// Bengali / English switch. English is the written language of every page.
// In Bengali mode this file swaps visible English text for Bengali, including text
// the other scripts add later. App names and descriptions are never changed.
(function () {
  "use strict";
  var KEY = "sdmapk-lang";
  var lang = "en";
  try {
    var saved = localStorage.getItem(KEY);
    if (saved === "bn" || saved === "en") lang = saved;
    else if (/^bn/i.test(navigator.language || "")) lang = "bn";
  } catch (e) {}
  document.documentElement.lang = lang;

  var D = {
    "Skip to content": "মূল অংশে যান",
    "Home": "হোম", "Explore Apps": "অ্যাপ দেখুন", "Categories": "ক্যাটাগরি", "About": "পরিচিতি",
    "Apps": "অ্যাপ",
    "Discover. Download. Enjoy.": "খুঁজুন। ডাউনলোড করুন। উপভোগ করুন।",
    "Find Your Next Favorite App.": "আপনার পরবর্তী প্রিয় অ্যাপটি খুঁজে নিন।",
    "Discover amazing Android apps, explore useful categories, and find your next favorite APK in one simple place.": "দারুণ সব অ্যান্ড্রয়েড অ্যাপ খুঁজুন, দরকারি ক্যাটাগরি ঘুরে দেখুন, আর এক জায়গা থেকেই আপনার পছন্দের APK বেছে নিন।",
    "Search apps by name or description": "নাম বা বিবরণ দিয়ে অ্যাপ খুঁজুন",
    "Search": "খুঁজুন",
    "Featured apps": "বাছাই করা অ্যাপ",
    "The newest additions to SdmApk.": "SdmApk-এ সবচেয়ে নতুন যোগ হওয়া অ্যাপ।",
    "Pick a category to filter the list below.": "নিচের তালিকা ছাঁটতে একটি ক্যাটাগরি বেছে নিন।",
    "All apps": "সব অ্যাপ", "Category": "ক্যাটাগরি", "All categories": "সব ক্যাটাগরি", "Sort by": "সাজান",
    "Newest first": "নতুন আগে", "Oldest first": "পুরোনো আগে", "Name A to Z": "নাম A থেকে Z", "Name Z to A": "নাম Z থেকে A",
    "Contact": "যোগাযোগ", "Privacy Policy": "গোপনীয়তা নীতি", "Terms": "শর্তাবলি",
    "© 2026 SdmApk. All rights reserved.": "© ২০২৬ SdmApk। সর্বস্বত্ব সংরক্ষিত।",
    "Tools": "টুলস", "Productivity": "প্রোডাক্টিভিটি", "Education": "শিক্ষা", "Entertainment": "বিনোদন",
    "Communication": "কমিউনিকেশন", "Photography": "ফটোগ্রাফি", "Personalization": "পার্সোনালাইজেশন", "Games": "গেমস", "Other": "অন্যান্য",
    // attributes
    "SdmApk home": "SdmApk হোম", "Main": "প্রধান মেনু", "Search apps": "অ্যাপ খুঁজুন",
    "Switch between light and dark theme": "আলো ও অন্ধকার থিম বদলান", "Open menu": "মেনু খুলুন",
    "Browse by category": "ক্যাটাগরি দেখুন", "Apps on SdmApk": "SdmApk-এর অ্যাপ", "Name or description": "নাম বা বিবরণ",
    "Footer": "ফুটার", "Close": "বন্ধ করুন", "Previous screenshot": "আগের স্ক্রিনশট", "Next screenshot": "পরের স্ক্রিনশট",
    // home
    "Loading apps…": "অ্যাপ লোড হচ্ছে…", "No apps yet": "এখনো কোনো অ্যাপ নেই",
    "Apps will show up here as soon as they are published. Check back soon.": "অ্যাপ প্রকাশ হলেই এখানে দেখা যাবে। একটু পরে আবার দেখুন।",
    "No apps match your search": "আপনার খোঁজের সাথে কোনো অ্যাপ মেলেনি",
    "Try a different word, or clear the filters to see every app.": "অন্য শব্দ দিয়ে চেষ্টা করুন, অথবা ফিল্টার মুছে সব অ্যাপ দেখুন।",
    "Clear filters": "ফিল্টার মুছুন", "Apps did not load": "অ্যাপ লোড হয়নি",
    "The app catalogue is not set up yet. Please check back soon.": "অ্যাপের তালিকা এখনো চালু হয়নি। একটু পরে আবার দেখুন।",
    "We could not load the apps. Check your connection and try again.": "অ্যাপ লোড করা গেল না। ইন্টারনেট দেখে আবার চেষ্টা করুন।",
    "Try again": "আবার চেষ্টা করুন",
    // cards + app page
    "Download": "ডাউনলোড", "No description yet.": "এখনো কোনো বিবরণ নেই।",
    "Screenshots": "স্ক্রিনশট", "About this app": "অ্যাপ সম্পর্কে",
    "No description has been added yet.": "এখনো কোনো বিবরণ যোগ করা হয়নি।",
    "Share": "শেয়ার", "Link copied": "লিংক কপি হয়েছে", "Version": "ভার্সন", "Downloads": "ডাউনলোড", "Added": "যোগ হয়েছে",
    "Older versions": "পুরোনো ভার্সন", "Earlier version": "আগের ভার্সন",
    "Need an earlier release? Older versions may not work on every phone.": "আগের ভার্সন লাগবে? পুরোনো ভার্সন সব ফোনে চলে না-ও পারে।",
    "Only install apps from sources you trust.": "শুধু বিশ্বস্ত উৎস থেকে অ্যাপ ইনস্টল করুন।",
    "If Play Protect shows a warning for an app you trust, tap More details, then Install anyway.": "বিশ্বস্ত অ্যাপে Play Protect সতর্কতা দেখালে More details চাপুন, তারপর Install anyway চাপুন।",
    "No download link is available for this app yet.": "এই অ্যাপের ডাউনলোড লিংক এখনো নেই।",
    "App not found": "অ্যাপ পাওয়া যায়নি",
    "That link does not point to an app. Browse the list to find what you need.": "এই লিংকে কোনো অ্যাপ নেই। তালিকা ঘেঁটে যা লাগে খুঁজে নিন।",
    "Browse all apps": "সব অ্যাপ দেখুন",
    "This app was removed or is not published. Browse the list to find something else.": "এই অ্যাপ সরানো হয়েছে বা প্রকাশিত নয়। তালিকা থেকে অন্য কিছু বেছে নিন।",
    "App did not load": "অ্যাপ লোড হয়নি",
    "We could not load this app. Check your connection and refresh the page.": "এই অ্যাপ লোড করা গেল না। ইন্টারনেট দেখে পেজ রিফ্রেশ করুন।",
    // about
    "About SdmApk": "SdmApk পরিচিতি",
    "SdmApk is a simple place to find and download Android apps. Discover. Download. Enjoy.": "SdmApk হলো অ্যান্ড্রয়েড অ্যাপ খুঁজে পাওয়া ও ডাউনলোড করার একটি সহজ জায়গা। খুঁজুন। ডাউনলোড করুন। উপভোগ করুন।",
    "What you will find here": "এখানে কী পাবেন",
    "Each app has its own page with a description, category, version and a download link. You can search by name or description and filter by category.": "প্রতিটি অ্যাপের নিজস্ব পেজ আছে, যেখানে বিবরণ, ক্যাটাগরি, ভার্সন আর ডাউনলোড লিংক পাবেন। নাম বা বিবরণ দিয়ে খুঁজতে এবং ক্যাটাগরি অনুযায়ী ছাঁটতে পারবেন।",
    "How downloads work": "ডাউনলোড কীভাবে কাজ করে",
    "The download button opens the app file on the service where it is stored. That service is separate from SdmApk and has its own rules.": "ডাউনলোড বোতাম অ্যাপ ফাইলটি যে সার্ভিসে রাখা আছে সেখানে খোলে। সেই সার্ভিস SdmApk থেকে আলাদা এবং তাদের নিজস্ব নিয়ম আছে।",
    "Staying safe": "নিরাপদ থাকুন",
    "SdmApk does not claim that any file is verified or free of malware. Only install apps from sources you trust, check what permissions an app asks for, and keep Google Play Protect turned on.": "SdmApk দাবি করে না যে কোনো ফাইল যাচাই করা বা ম্যালওয়্যারমুক্ত। শুধু বিশ্বস্ত উৎস থেকে অ্যাপ ইনস্টল করুন, অ্যাপ কী কী পারমিশন চায় দেখে নিন, আর Google Play Protect চালু রাখুন।",
    "Contact details have not been published yet. Please check back soon.": "যোগাযোগের তথ্য এখনো দেওয়া হয়নি। একটু পরে আবার দেখুন।",
    "Email:": "ইমেইল:", "Telegram or social:": "টেলিগ্রাম বা সোশ্যাল:", "Link:": "লিংক:",
    // privacy
    "Last updated 8 November 2026.": "সর্বশেষ হালনাগাদ: ৮ নভেম্বর ২০২৬।",
    "What SdmApk collects": "SdmApk কী তথ্য সংগ্রহ করে",
    "Visitors do not need an account, and SdmApk does not ask you for personal details. The site does not include advertising or analytics trackers.": "দর্শকদের অ্যাকাউন্ট লাগে না, আর SdmApk আপনার ব্যক্তিগত তথ্য চায় না। সাইটে বিজ্ঞাপন বা অ্যানালিটিক্স ট্র্যাকার নেই।",
    "Hosting and logs": "হোস্টিং ও লগ",
    "SdmApk runs on Cloudflare. Like any host, Cloudflare processes technical request data such as your IP address to deliver the site and keep it secure.": "SdmApk চলে Cloudflare-এ। অন্য যেকোনো হোস্টের মতো Cloudflare সাইট পৌঁছে দিতে ও নিরাপদ রাখতে আপনার IP ঠিকানার মতো প্রযুক্তিগত তথ্য প্রক্রিয়া করে।",
    "Fonts": "ফন্ট",
    "Pages load fonts from Google Fonts, so your browser contacts Google when a page opens.": "পেজগুলো Google Fonts থেকে ফন্ট লোড করে, তাই পেজ খুললে আপনার ব্রাউজার Google-এর সাথে যোগাযোগ করে।",
    "What is stored in your browser": "আপনার ব্রাউজারে কী জমা থাকে",
    "If you switch between the light and dark theme, your choice is saved in your browser so it can be remembered. The admin area uses a sign-in cookie, which is only set for the site owner.": "আলো ও অন্ধকার থিম বদলালে আপনার পছন্দ ব্রাউজারে সংরক্ষিত থাকে, যাতে মনে রাখা যায়। ভাষার পছন্দও একইভাবে সংরক্ষিত হয়। অ্যাডমিন অংশে সাইন-ইন কুকি ব্যবহার হয়, যা শুধু সাইটের মালিকের জন্য বসে।",
    "Download links": "ডাউনলোড লিংক",
    "App files are hosted on other services. When you open a download link, that service's own privacy policy applies.": "অ্যাপ ফাইল অন্য সার্ভিসে রাখা থাকে। ডাউনলোড লিংক খুললে সেই সার্ভিসের নিজস্ব গোপনীয়তা নীতি প্রযোজ্য হয়।",
    "Changes": "পরিবর্তন",
    "If this policy changes, the date above will change with it.": "এই নীতি বদলালে উপরের তারিখও বদলে যাবে।",
    // terms
    "Last updated 8 November 2026. By using SdmApk you agree to these terms.": "সর্বশেষ হালনাগাদ: ৮ নভেম্বর ২০২৬। SdmApk ব্যবহার করলে আপনি এই শর্তগুলো মেনে নিচ্ছেন।",
    "Using the site": "সাইট ব্যবহার",
    "You may browse the site and download apps for your own use. Do not misuse the site, try to break it, or try to get into the admin area.": "আপনি সাইট ঘুরে দেখতে এবং নিজের ব্যবহারের জন্য অ্যাপ ডাউনলোড করতে পারেন। সাইটের অপব্যবহার, ভেঙে ফেলার চেষ্টা বা অ্যাডমিন অংশে ঢোকার চেষ্টা করবেন না।",
    "Apps and downloads": "অ্যাপ ও ডাউনলোড",
    "Apps are provided as they are, without any warranty. App files are hosted on separate services, and SdmApk does not guarantee that a file is safe, verified or free of malware. You install apps at your own risk.": "অ্যাপ যেমন আছে তেমনই দেওয়া হয়, কোনো ওয়ারেন্টি ছাড়া। অ্যাপ ফাইল আলাদা সার্ভিসে রাখা হয়, এবং কোনো ফাইল নিরাপদ, যাচাই করা বা ম্যালওয়্যারমুক্ত — SdmApk এর নিশ্চয়তা দেয় না। অ্যাপ ইনস্টল করা আপনার নিজের ঝুঁকিতে।",
    "Changes and removal": "পরিবর্তন ও সরানো",
    "Apps and information on this site can be changed or removed at any time without notice.": "এই সাইটের অ্যাপ ও তথ্য যেকোনো সময় নোটিশ ছাড়াই বদলানো বা সরানো যেতে পারে।",
    "Limits of responsibility": "দায়ের সীমা",
    "To the extent the law allows, SdmApk and its owner are not responsible for loss or damage caused by using the site or the apps listed on it.": "আইন যতটুকু অনুমতি দেয়, সাইট বা তালিকাভুক্ত অ্যাপ ব্যবহারে হওয়া ক্ষতির জন্য SdmApk ও এর মালিক দায়ী নন।",
    "Changes to these terms": "এই শর্তের পরিবর্তন",
    "If these terms change, the date above will change with it.": "এই শর্ত বদলালে উপরের তারিখও বদলে যাবে।"
  };

  // Text with numbers or names inside.
  var P = [
    [/^(\d+) apps? (?:is|are) available to download\.$/, function (m) { return m[1] + " টি অ্যাপ ডাউনলোডের জন্য আছে।"; }],
    [/^Showing (\d+) of (\d+) apps?$/, function (m) { return "মোট " + m[2] + " টির মধ্যে " + m[1] + " টি দেখাচ্ছে"; }],
    [/^(\d+) of (\d+) apps?$/, function (m) { return "মোট " + m[2] + " টির মধ্যে " + m[1] + " টি"; }],
    [/^(\d+) apps?$/, function (m) { return m[1] + " টি অ্যাপ"; }],
    [/^Version (.+)$/, function (m) { return "ভার্সন " + m[1]; }],
    [/^Replaced (.+)$/, function (m) { return "বদলানো হয়েছে " + m[1]; }],
    [/^Download (.+)$/, function (m) { return m[1] + " ডাউনলোড করুন"; }],
    [/^(.+) screenshots$/, function (m) { return m[1] + "-এর স্ক্রিনশট"; }],
    [/^View screenshot (\d+) of (\d+) larger$/, function (m) { return m[2] + " টির মধ্যে " + m[1] + " নম্বর স্ক্রিনশট বড় করে দেখুন"; }],
    [/^Screenshots of (.+)$/, function (m) { return m[1] + "-এর স্ক্রিনশট"; }]
  ];

  function tr(text) {
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(text);
    var core = m[2];
    if (!core) return text;
    var out = D[core];
    if (out === undefined) {
      for (var i = 0; i < P.length && out === undefined; i++) {
        var r = P[i][0].exec(core);
        if (r) out = P[i][1](r);
      }
    }
    if (out === undefined && core.indexOf(" · ") > 0) {
      var changed = false;
      out = core.split(" · ").map(function (part) {
        var t = tr(part);
        if (t !== part) changed = true;
        return t;
      }).join(" · ");
      if (!changed) out = undefined;
    }
    return out === undefined ? text : m[1] + out + m[3];
  }

  var ATTRS = ["aria-label", "placeholder", "title"];

  function walk(node) {
    if (node.nodeType === 3) {
      var p = node.parentNode;
      if (p && /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.nodeName)) return;
      var t = tr(node.nodeValue);
      if (t !== node.nodeValue) node.nodeValue = t;
      return;
    }
    if (node.nodeType !== 1 || /^(SCRIPT|STYLE)$/.test(node.nodeName)) return;
    ATTRS.forEach(function (a) {
      if (node.hasAttribute(a)) {
        var v = node.getAttribute(a), t = tr(v);
        if (t !== v) node.setAttribute(a, t);
      }
    });
    for (var c = node.firstChild; c; c = c.nextSibling) walk(c);
  }

  function setTitle() {
    var t = tr(document.title);
    if (t !== document.title) document.title = t;
  }

  function addButton() {
    var tools = document.querySelector(".tools");
    if (!tools || document.getElementById("lang-btn")) return;
    var b = document.createElement("button");
    b.type = "button";
    b.id = "lang-btn";
    b.className = "icon-btn lang-btn";
    b.textContent = lang === "bn" ? "EN" : "বাং";
    b.setAttribute("aria-label", lang === "bn" ? "Switch to English" : "বাংলায় দেখুন");
    b.setAttribute("lang", lang === "bn" ? "en" : "bn");
    b.addEventListener("click", function () {
      try { localStorage.setItem(KEY, lang === "bn" ? "en" : "bn"); } catch (e) {}
      location.reload();
    });
    tools.insertBefore(b, tools.firstChild);
  }

  function start() {
    addButton();
    if (lang !== "bn") return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    walk(document.body);
    setTitle();
    new MutationObserver(function (list) {
      list.forEach(function (rec) {
        if (rec.type === "characterData") walk(rec.target);
        else rec.addedNodes.forEach(walk);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
    var titleEl = document.querySelector("title");
    if (titleEl) new MutationObserver(setTitle).observe(titleEl, { childList: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
