/* ==========================================================================
   Index Option — main.js (vanilla JS, no dependencies)
   ========================================================================== */

/* --------------------------------------------------------------------------
   CONFIG — EDIT YOUR PLACEHOLDERS HERE (the only place you need to touch)
   Leave a value as "[...]" and the site shows it as a visible placeholder.
   -------------------------------------------------------------------------- */
const CONFIG = {
  instructorName: "Yogi",
  pricing: {
    originalPrice: 1199,
    offerPrice: 599,
    offerActive: true,          // set to false after Diwali
    offerLabel: "Diwali Offer",
    offerEndDate: ""            // optional, e.g. "2026-11-15". Leave empty to hide the end date
  },
  enrollLink: "[ENROLL LINK]",                // e.g. "https://pages.razorpay.com/your-course"
  videoEmbedUrl: "[INTRO VIDEO EMBED URL]",   // e.g. "https://www.youtube.com/embed/VIDEO_ID"
  contactEmail: "yogi.indexoption@gmail.com",
  telegramChannel: "https://t.me/trade_index_option",   // free public Telegram channel
  whatsappChannel: "https://whatsapp.com/channel/0029VaA5Sg5Fi8xhPflS9w2s", // free public WhatsApp channel
  telegramBot: "https://t.me/Index_Option_bot",          // public bot for questions (anyone, enrolled or not)
  instagram: "https://www.instagram.com/the.disciplined__trader/",   // Instagram profile
  youtube: "https://www.youtube.com/@csPoint"   // YouTube channel
};

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const isPlaceholder = (v) => !v || /^\[.*\]$/.test(v.trim());
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- 1. Apply CONFIG to the page ------------------------------------- */
  function applyConfig() {
    // Visible text values
    $$("[data-config-text]").forEach((el) => {
      const val = CONFIG[el.dataset.configText];
      if (val === "") { el.hidden = true; return; }
      if (val != null) el.textContent = val;
    });

    // Enroll buttons: real link opens in a new tab; placeholder falls back to the pricing section
    $$("[data-enroll]").forEach((a) => {
      if (isPlaceholder(CONFIG.enrollLink)) return; // keep default in-page href
      a.href = CONFIG.enrollLink;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    });

    // Social links: only link when a real URL is set
    $$("[data-config-link]").forEach((a) => {
      const val = CONFIG[a.dataset.configLink];
      if (isPlaceholder(val)) { a.removeAttribute("href"); a.setAttribute("aria-disabled", "true"); }
      else a.href = val;
    });

    // Email
    $$("[data-config-mail]").forEach((a) => {
      const val = CONFIG[a.dataset.configMail];
      if (isPlaceholder(val)) a.removeAttribute("href");
      else a.href = "mailto:" + val;
    });
  }

  /* ---- 1b. Pricing — everything is generated from CONFIG.pricing -------- */
  function applyPricing() {
    const P = CONFIG.pricing;
    const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");
    let end = null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(P.offerEndDate || "");
    if (m) end = new Date(+m[1], +m[2] - 1, +m[3], 23, 59, 59);
    // Offer is active only if enabled, sensible, and not past its end date
    const active = !!P.offerActive && P.offerPrice < P.originalPrice && !(end && Date.now() > end.getTime());
    const current = active ? P.offerPrice : P.originalPrice;
    const save = P.originalPrice - P.offerPrice;
    const percent = Math.round((save / P.originalPrice) * 100);
    const endText = end ? end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
    const vals = { current: fmt(current), offer: fmt(P.offerPrice), original: fmt(P.originalPrice), save: fmt(save), percent: String(percent), label: P.offerLabel };

    $$("[data-price]").forEach((el) => { el.textContent = vals[el.dataset.price] || ""; });
    $$("[data-offer-only]").forEach((el) => { el.hidden = !active; });
    const valid = $("#price-valid");
    if (valid) { valid.hidden = !(active && endText); valid.textContent = endText ? "Offer valid till " + endText : ""; }

    const faq = $("#faq-fee");
    if (faq) faq.textContent = active
      ? "The course fee is " + fmt(P.originalPrice) + ". For " + P.offerLabel.replace(/\s*Offer$/i, "") + ", it's available at a special price of " + fmt(P.offerPrice) + " (" + percent + "% OFF)."
      : "The course fee is " + fmt(P.originalPrice) + ".";

    // Announcement bar: dismissible, closed state remembered for the session
    const bar = $("#offer-bar");
    let closed = false;
    try { closed = sessionStorage.getItem("offerBarClosed") === "1"; } catch (e) {}
    const showBar = !!bar && active && !closed;
    if (bar) bar.hidden = !showBar;
    document.documentElement.classList.toggle("has-bar", showBar);
    const close = $("#offer-close");
    if (close) close.addEventListener("click", () => {
      try { sessionStorage.setItem("offerBarClosed", "1"); } catch (e) {}
      bar.hidden = true;
      document.documentElement.classList.remove("has-bar");
    });

    // Course structured data (SEO), built from the same CONFIG
    if ($("#pricing")) {
      const ld = document.createElement("script");
      ld.type = "application/ld+json";
      ld.textContent = JSON.stringify({
        "@context": "https://schema.org", "@type": "Course",
        name: "Index Option Buying Course",
        description: "Learn index option buying in two focused videos: a complete trading setup plus discipline, risk and money management.",
        provider: { "@type": "Organization", name: "Index Option" },
        offers: { "@type": "Offer", price: current, priceCurrency: "INR", availability: "https://schema.org/InStock" }
      });
      document.head.appendChild(ld);
    }
  }

  /* ---- 2. Navbar: solid on scroll, mobile menu, active link ------------- */
  const navbar = $("#navbar");
  const hamburger = $("#hamburger");
  const navLinks = $$(".nav-link");

  function setMenu(open) {
    navbar.classList.toggle("is-open", open);
    hamburger.setAttribute("aria-expanded", String(open));
    hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  hamburger.addEventListener("click", () => setMenu(hamburger.getAttribute("aria-expanded") !== "true"));
  $$("#nav-panel a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navbar.classList.contains("is-open")) { setMenu(false); hamburger.focus(); }
  });
  window.matchMedia("(min-width: 1024px)").addEventListener("change", () => setMenu(false));

  // Active link based on the section crossing the upper-middle of the viewport
  const spySections = navLinks
    .map((l) => (l.getAttribute("href").startsWith("#") ? $(l.getAttribute("href")) : null))
    .filter(Boolean);
  function updateActiveLink() {
    const line = window.innerHeight * 0.35;
    let current = spySections[0] || null;
    spySections.forEach((s) => { if (s.getBoundingClientRect().top <= line) current = s; });
    navLinks.forEach((l) => {
      const on = current && l.getAttribute("href") === "#" + current.id;
      l.classList.toggle("is-active", on);
      if (on) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current");
    });
  }

  /* ---- 3. Scroll-driven UI (progress, navbar, sticky CTA, back-to-top) -- */
  const progress = $("#progress");
  const stickyCta = $("#sticky-cta");
  const toTop = $("#to-top");
  const hero = $("#home");
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    navbar.classList.toggle("is-scrolled", y > 20);
    if (stickyCta && hero) stickyCta.classList.toggle("is-visible", y > hero.offsetHeight - 120);
    if (toTop) toTop.classList.toggle("is-visible", y > 600);
    updateActiveLink();
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  /* ---- 4. Reveal on scroll --------------------------------------------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el, i) => {
      // small stagger for siblings that appear together
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---- 5. FAQ accordion (one open at a time) ---------------------------- */
  const accItems = $$(".acc-item");
  accItems.forEach((item) => {
    const btn = $(".acc-btn", item);
    btn.addEventListener("click", () => {
      const willOpen = btn.getAttribute("aria-expanded") !== "true";
      accItems.forEach((other) => {
        const b = $(".acc-btn", other);
        const open = other === item && willOpen;
        other.classList.toggle("is-open", open);
        b.setAttribute("aria-expanded", String(open));
      });
    });
  });

  /* ---- 6. Video modal with lazy iframe + focus trap --------------------- */
  const modal = $("#video-modal");
  const frame = $("#video-frame");
  const openBtn = $("#open-video");
  let lastFocus = null;

  function focusables() {
    return $$("button, [href], iframe, [tabindex]:not([tabindex='-1'])", modal).filter((el) => !el.hidden);
  }
  function openModal() {
    lastFocus = document.activeElement;
    frame.innerHTML = "";
    if (isPlaceholder(CONFIG.videoEmbedUrl)) {
      const msg = document.createElement("p");
      msg.className = "modal__msg";
      msg.textContent = "Intro video coming soon.";
      frame.appendChild(msg);
    } else {
      // iframe is created only now (lazy) and removed on close so playback stops
      const iframe = document.createElement("iframe");
      const sep = CONFIG.videoEmbedUrl.includes("?") ? "&" : "?";
      // privacy-enhanced mode: youtube-nocookie.com avoids setting cookies until playback
      const embed = CONFIG.videoEmbedUrl.replace("://www.youtube.com/embed/", "://www.youtube-nocookie.com/embed/");
      iframe.src = embed + sep + "autoplay=1&rel=0";
      iframe.title = "Index Option intro video";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;
      frame.appendChild(iframe);
    }
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    $("#close-video").focus();
  }
  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    frame.innerHTML = ""; // removing the iframe stops the video
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  if (openBtn && modal) openBtn.addEventListener("click", openModal);
  if (modal) $$("[data-close-modal]", modal).forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => {
    if (!modal || modal.hidden) return;
    if (e.key === "Escape") { closeModal(); return; }
    if (e.key === "Tab") {
      const items = focusables();
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---- 7. Footer year --------------------------------------------------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- 8. Legal pages: highlight the active "On this page" link --------- */
  const tocLinks = $$(".toc a");
  if (tocLinks.length) {
    const targets = tocLinks.map((a) => $(a.getAttribute("href")));
    const setToc = () => {
      let cur = 0;
      targets.forEach((t, i) => { if (t && t.getBoundingClientRect().top <= window.innerHeight * 0.3) cur = i; });
      tocLinks.forEach((a, i) => { a.classList.toggle("is-active", i === cur); if (i === cur) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
    };
    window.addEventListener("scroll", setToc, { passive: true });
    setToc();
  }

  /* ---- init ------------------------------------------------------------- */
  applyConfig();
  applyPricing();
  onScroll();
})();
