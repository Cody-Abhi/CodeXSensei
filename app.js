/* DawaDekho — app.js
   Wires the UI: language, navigation, typed search, photo flow, result card.
   All facts come from the bundled data via match.js. Gemma output is only a
   search key. No framework, no analytics, no cookies. */
(function () {
  "use strict";

  var I18N = window.DawaI18N;
  var M = window.DawaMatch;
  var L = window.DawaLocator;

  var API_ENDPOINT = "/api/read-strip";
  var PHOTO_TIMEOUT_MS = 15000;
  var MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2 MB
  var KENDRA_URL = "https://janaushadhi.gov.in/StoreSearch.aspx";
  var SUGAM_APP_URL = "https://play.google.com/store/apps/details?id=in.gov.janaushadhi.sugam";
  var LANG_KEY = "dawadekho.lang";
  var THEME_KEY = "dawadekho.theme"; // "light" | "dark" | unset (= follow system)

  var state = {
    lang: "en",
    index: null,
    dataDate: "2026-10-01",
    lastPhotoFile: null,
  };

  // ---- helpers ------------------------------------------------------------

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function t(key, vars) { return I18N.t(state.lang, key, vars); }

  var rupeeFmt = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function rupees(n) { return "₹" + rupeeFmt.format(Number(n) || 0); }

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") e.className = attrs[k];
        else if (k === "html") e.innerHTML = attrs[k];
        else if (k === "text") e.textContent = attrs[k];
        else if (k.indexOf("on") === 0 && typeof attrs[k] === "function") e.addEventListener(k.slice(2), attrs[k]);
        else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c == null) return;
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return e;
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  // ---- i18n / language ----------------------------------------------------

  function applyI18n() {
    $all("[data-i18n]").forEach(function (node) {
      node.textContent = t(node.getAttribute("data-i18n"));
    });
    // placeholders & aria that need special handling
    var search = $("#searchInput");
    if (search) search.setAttribute("placeholder", t("search.placeholder"));
    var langGroup = $("#langToggle");
    if (langGroup) langGroup.setAttribute("aria-label", t("lang.toggle.aria"));
    document.documentElement.lang = state.lang;
    $("#aboutDate") && ($("#aboutDate").textContent = state.dataDate);
    if (typeof updateThemeButton === "function") updateThemeButton();
  }

  function setLang(lang) {
    if (I18N.langs.indexOf(lang) === -1) lang = "en";
    state.lang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    $all("#langToggle button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false");
    });
    applyI18n();
    // re-render current result if any
    if (state._lastResult && isResultOpen()) renderResult(state._lastResult);
    if (isStageOpen("kendra")) renderKendraResults();
  }

  function initLang() {
    var saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) {}
    var fromUrl = new URLSearchParams(location.search).get("lang");
    setLang(fromUrl || saved || "en");
  }

  // ---- theme (follows system; manual toggle overrides) --------------------

  function storedTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }

  function systemDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function effectiveTheme() {
    var s = storedTheme();
    if (s === "light" || s === "dark") return s;
    return systemDark() ? "dark" : "light";
  }

  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5z"/></svg>';

  function updateThemeButton() {
    var btn = $("#themeToggle");
    if (!btn) return;
    var eff = effectiveTheme();
    // Show the icon of the mode you'd switch TO.
    btn.innerHTML = eff === "dark" ? SUN : MOON;
    btn.setAttribute("aria-pressed", eff === "dark" ? "true" : "false");
    btn.setAttribute("aria-label", t(eff === "dark" ? "theme.toLight" : "theme.toDark"));
  }

  function applyTheme() {
    var s = storedTheme();
    if (s === "light" || s === "dark") document.documentElement.setAttribute("data-theme", s);
    else document.documentElement.removeAttribute("data-theme");
    updateThemeButton();
    if (state._mapThemeSync) state._mapThemeSync(effectiveTheme());
  }

  function toggleTheme() {
    var next = effectiveTheme() === "dark" ? "light" : "dark";
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    applyTheme();
  }

  function initTheme() {
    applyTheme();
    // If the user hasn't overridden, follow live system changes.
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var handler = function () { if (!storedTheme()) applyTheme(); };
      if (mq.addEventListener) mq.addEventListener("change", handler);
      else if (mq.addListener) mq.addListener(handler);
    }
  }

  // ---- navigation ---------------------------------------------------------
  // The result is independent of the four input views. On desktop (>=1024px)
  // the input column and the result sit side by side; on a phone the result
  // takes over the screen and the input views are hidden until the user goes
  // back.

  var INPUT_VIEWS = ["home", "search", "photo", "confirm"];

  function isResultOpen() {
    var r = document.getElementById("view-result");
    return r && r.classList.contains("active");
  }

  function isWide() { return window.innerWidth >= 1024; }

  // Switch which input view is showing; this always closes any open result.
  function show(view, opts) {
    opts = opts || {};
    INPUT_VIEWS.forEach(function (v) {
      var node = document.getElementById("view-" + v);
      if (!node) return;
      node.classList.toggle("active", v === view);
      node.hidden = v !== view;
    });
    closeResult();
    var bar = $("#bottombar");
    if (bar) bar.classList.toggle("hide", view !== "home");
    if (opts.focus) {
      var f = document.getElementById(opts.focus);
      if (f) f.focus();
    }
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }

  // The result column can show one of two "stages": the result or the Kendra
  // locator. They are mutually exclusive and sit in the right column on desktop.
  var STAGES = ["result", "kendra"];

  function openStage(name) {
    STAGES.forEach(function (s) {
      var n = document.getElementById("view-" + s);
      if (!n) return;
      var on = s === name;
      n.classList.toggle("active", on);
      n.hidden = !on;
    });
    if (!isWide()) {
      // Phone: the stage replaces the input column.
      INPUT_VIEWS.forEach(function (v) {
        var node = document.getElementById("view-" + v);
        node.classList.remove("active");
        node.hidden = true;
      });
      var bar = $("#bottombar");
      if (bar) bar.classList.add("hide");
    }
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }

  function openResult() { openStage("result"); }

  function closeResult() {
    STAGES.forEach(function (s) {
      var n = document.getElementById("view-" + s);
      if (n) { n.hidden = true; n.classList.remove("active"); }
    });
  }

  function isStageOpen(name) {
    var n = document.getElementById("view-" + name);
    return n && n.classList.contains("active");
  }

  // ---- typed search -------------------------------------------------------

  var suggestItems = [];
  var suggestActive = -1;

  function renderSuggestions(q) {
    var list = $("#suggest");
    var wrap = $(".field-wrap");
    list.innerHTML = "";
    suggestItems = state.index ? M.suggest(state.index, q, 6) : [];
    suggestActive = -1;
    if (!suggestItems.length) { wrap.setAttribute("aria-expanded", "false"); return; }
    wrap.setAttribute("aria-expanded", "true");
    suggestItems.forEach(function (s, i) {
      var li = el("li", { role: "option", id: "sg-" + i, "aria-selected": "false" }, [
        el("span", { class: "s-label", text: s.label }),
        el("span", { class: "s-sub", text: s.sub }),
      ]);
      li.addEventListener("click", function () { chooseSuggestion(i); });
      list.appendChild(li);
    });
  }

  function highlightSuggestion(idx) {
    var list = $("#suggest");
    $all("li", list).forEach(function (li, i) {
      li.setAttribute("aria-selected", i === idx ? "true" : "false");
    });
    var input = $("#searchInput");
    input.setAttribute("aria-activedescendant", idx >= 0 ? "sg-" + idx : "");
    suggestActive = idx;
  }

  function chooseSuggestion(i) {
    var s = suggestItems[i];
    if (!s) return;
    $("#searchInput").value = s.label;
    closeSuggestions();
    runSearch(s.label);
  }

  function closeSuggestions() {
    $("#suggest").innerHTML = "";
    $(".field-wrap").setAttribute("aria-expanded", "false");
    suggestItems = []; suggestActive = -1;
    $("#searchInput").setAttribute("aria-activedescendant", "");
  }

  function runSearch(q) {
    if (!state.index) return;
    var res = M.search(state.index, q);
    renderResult(res);
  }

  // ---- photo flow ---------------------------------------------------------

  function resizeImage(file, maxDim, quality) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        var w = img.width, h = img.height;
        var scale = Math.min(1, maxDim / Math.max(w, h));
        var cw = Math.round(w * scale), ch = Math.round(h * scale);
        var canvas = document.createElement("canvas");
        canvas.width = cw; canvas.height = ch;
        canvas.getContext("2d").drawImage(img, 0, 0, cw, ch);
        URL.revokeObjectURL(url);
        canvas.toBlob(function (blob) {
          if (!blob) return reject(new Error("encode-failed"));
          resolve(blob);
        }, "image/jpeg", quality);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("decode-failed")); };
      img.src = url;
    });
  }

  function showPreview(file) {
    var img = $("#photoPreview");
    if (img._url) URL.revokeObjectURL(img._url);
    img._url = URL.createObjectURL(file);
    img.src = img._url;
    img.hidden = false;
    img.alt = t("confirm.title");
  }

  function handlePhoto(file) {
    if (!file) return;
    if (!navigator.onLine) { renderError("photo.needsNet"); return; }
    showPreview(file);
    renderLoading();

    resizeImage(file, 1024, 0.82)
      .then(function (blob) {
        if (blob.size > MAX_UPLOAD_BYTES) throw new Error("too-big");
        return postStrip(blob);
      })
      .then(function (gemma) {
        openConfirm(gemma);
      })
      .catch(function (err) {
        mapPhotoError(err);
      });
  }

  function postStrip(blob) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, PHOTO_TIMEOUT_MS);
    return fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "image/jpeg" },
      body: blob,
      signal: controller.signal,
    })
      .then(function (r) {
        clearTimeout(timer);
        if (r.status === 429) throw new Error("busy");
        if (r.status === 413) throw new Error("too-big");
        if (!r.ok) throw new Error("http-" + r.status);
        return r.json();
      })
      .then(function (data) {
        // Expected: {brand, salts[], strength, form, mrp_printed}
        if (data && data.handwriting) throw new Error("handwriting");
        if (!data || (!data.salts && !data.brand)) throw new Error("unreadable");
        return data;
      })
      .catch(function (err) {
        clearTimeout(timer);
        if (err.name === "AbortError") throw new Error("timeout");
        throw err;
      });
  }

  function mapPhotoError(err) {
    var m = String(err && err.message);
    var key = "err.generic";
    if (m === "busy") key = "err.busy";
    else if (m === "timeout") key = "err.timeout";
    else if (m === "too-big") key = "err.tooBig";
    else if (m === "handwriting") key = "err.handwriting";
    else if (m === "unreadable" || m.indexOf("decode") !== -1 || m.indexOf("encode") !== -1) key = "err.unreadable";
    else if (m.indexOf("Failed to fetch") !== -1 || m.indexOf("NetworkError") !== -1) key = "photo.needsNet";
    renderError(key);
  }

  function openConfirm(gemma) {
    $("#cBrand").value = gemma.brand || "";
    $("#cSalt").value = Array.isArray(gemma.salts) ? gemma.salts.join(", ") : (gemma.salts || "");
    $("#cStrength").value = gemma.strength || "";
    $("#cMrp").value = gemma.mrp_printed != null ? gemma.mrp_printed : "";
    state._gemmaForm = gemma;
    // Show the strip thumbnail beside the fields so the user can cross-check.
    var thumb = $("#confirmThumb");
    if (thumb) {
      var src = $("#photoPreview") && $("#photoPreview")._url;
      if (src) { thumb.src = src; thumb.hidden = false; thumb.alt = t("photo.tip"); }
      else thumb.hidden = true;
    }
    show("confirm", { focus: "cBrand" });
  }

  function confirmAndMatch() {
    var salts = $("#cSalt").value.split(/[,+]/).map(function (s) { return s.trim(); }).filter(Boolean);
    var mrp = parseFloat($("#cMrp").value);
    var gemma = {
      brand: $("#cBrand").value.trim() || null,
      salts: salts,
      strength: $("#cStrength").value.trim(),
      form: (state._gemmaForm && state._gemmaForm.form) || null,
      mrp_printed: isFinite(mrp) && mrp > 0 ? mrp : null,
    };
    var res = M.matchFromGemma(state.index, gemma);
    renderResult(res);
  }

  // ---- result rendering ---------------------------------------------------

  function renderLoading() {
    var host = $("#resultHost");
    host.innerHTML = "";
    host.appendChild(el("div", { class: "skeleton", role: "status", "aria-live": "polite" }, [
      el("p", { class: "loading-text" }, [spinner(), t("photo.reading")]),
      el("div", { class: "sk-line w80" }),
      el("div", { class: "sk-line w60" }),
      el("div", { class: "sk-band" }),
      el("div", { class: "sk-line w40" }),
    ]));
    openResult();
  }

  function spinner() {
    return el("span", { class: "sr-only", text: t("a11y.loading") });
  }

  function renderError(key) {
    state._lastResult = { reason: "error", errKey: key };
    var host = $("#resultHost");
    host.innerHTML = "";
    host.appendChild(el("div", { class: "state-card error", role: "alert" }, [
      iconAlert(),
      el("h2", { text: t("err.title") }),
      el("p", { text: t(key) }),
      el("div", { class: "state-actions" }, [
        el("button", { class: "btn btn-primary btn-sm", onclick: function () { goType(); } }, [t("home.cta.type")]),
      ]),
    ]));
    openResult();
  }

  function renderResult(res) {
    state._lastResult = res;
    if (res.reason === "error") return renderError(res.errKey);
    var host = $("#resultHost");
    host.innerHTML = "";

    if (res.reason === "none" || !res.match) {
      host.appendChild(renderNoMatch());
      openResult();
      return;
    }

    host.appendChild(renderReceipt(res));
    openResult();
    announce(res);
    if (res.savings) animateSavings();
  }

  function renderNoMatch() {
    return el("div", { class: "state-card", role: "status" }, [
      iconSearchOff(),
      el("h2", { text: t("nomatch.title") }),
      el("p", { text: t("nomatch.body") }),
      el("div", { class: "state-actions" }, [
        el("button", { class: "btn btn-outline btn-sm", onclick: function () { goType(); } }, [t("nomatch.retry")]),
        el("button", { class: "btn btn-primary btn-sm", onclick: function () { openKendra(); } }, [t("result.kendra")]),
      ]),
    ]);
  }

  function renderReceipt(res) {
    var g = res.match;
    var r = res.resolved;
    var card = el("div", { class: "result-card" });

    // title
    card.appendChild(el("h2", { class: "rc-title", text: g.generic_name }));
    var subBits = [];
    if (r.brand) subBits.push(t("result.sameAs", { brand: r.brand }));
    if (res.exactStrength === false) subBits.push(t("result.altStrength"));
    if (subBits.length) card.appendChild(el("p", { class: "rc-sub", text: subBits.join(" · ") }));

    card.appendChild(el("hr", { class: "dashed" }));

    // branded line
    if (r.brandMrp) {
      var brandedLbl = el("span", { class: "lbl" }, [t("result.branded")]);
      if (r.approx) brandedLbl.appendChild(el("span", { class: "approx-tag", text: t("result.approx") }));
      card.appendChild(el("div", { class: "rc-line" }, [
        brandedLbl,
        el("span", { class: "amt struck", text: rupees(r.brandMrp) }),
      ]));
    }
    // generic line
    card.appendChild(el("div", { class: "rc-line" }, [
      el("span", { class: "lbl", text: t("result.generic") }),
      el("span", { class: "amt", text: rupees(g.mrp) }),
    ]));

    card.appendChild(el("hr", { class: "dashed" }));

    // savings band
    if (res.savings) {
      var band = el("div", { class: "savings-band" }, [
        el("span", { class: "lbl", text: t("result.saveLabel") }),
        el("span", { class: "num", id: "saveNum", "data-target": res.savings.saved, text: rupees(res.savings.saved) }),
        el("span", { class: "pct", text: "(" + res.savings.pct + "%)" }),
      ]);
      card.appendChild(band);
    }

    // meta
    card.appendChild(el("p", { class: "rc-meta", text: t("result.pack", { unit: g.unit }) }));
    card.appendChild(el("p", { class: "rc-meta" }, [t("result.code", { code: "" }), el("span", { class: "code", text: g.code })]));

    // alternatives
    if (res.alternatives && res.alternatives.length) {
      var alts = el("div", { class: "alts" }, [el("h3", { text: t("result.alternatives") })]);
      res.alternatives.forEach(function (a) {
        alts.appendChild(el("div", { class: "alt-item" }, [
          el("span", { text: a.generic_name + " (" + a.strength + ")" }),
          el("span", { class: "amt", text: rupees(a.mrp) }),
        ]));
      });
      card.appendChild(alts);
    }

    // actions: primary Kendra (full width), then a compact secondary row
    var actions = el("div", { class: "result-actions" });
    actions.appendChild(el("button", { class: "btn btn-primary", onclick: function () { openKendra(); } }, [t("result.kendra")]));

    var secondary = el("div", { class: "action-row" });
    secondary.appendChild(linkButton(SUGAM_APP_URL, t("result.app"), false, true));
    if (res.savings && r.brand) secondary.appendChild(whatsappButton(res));
    if (window.speechSynthesis) secondary.appendChild(speakButton(res));
    actions.appendChild(secondary);

    actions.appendChild(el("button", { class: "btn btn-outline", onclick: function () { goType(); } }, [t("result.another")]));
    card.appendChild(actions);

    // disclaimer + source
    card.appendChild(el("div", { class: "disclaimer" }, [iconInfo(), el("span", { text: t("result.disclaimer") })]));
    card.appendChild(el("p", { class: "source-line", text: t("result.source", { date: state.dataDate }) }));

    return card;
  }

  function animateSavings() {
    var node = $("#saveNum");
    if (!node || prefersReducedMotion()) return;
    var target = parseFloat(node.getAttribute("data-target"));
    if (!isFinite(target)) return;
    var dur = 600, start = null;
    function step(ts) {
      if (start == null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = rupees(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else node.textContent = rupees(target);
    }
    requestAnimationFrame(step);
  }

  function announce(res) {
    if (!res.savings) return;
    var rupeesWhole = Math.round(res.savings.saved);
    var msg = t("result.save.sr", { rupees: rupeesWhole, pct: res.savings.pct });
    var live = el("div", { class: "sr-only", role: "status", "aria-live": "polite", text: t("a11y.resultReady") + ". " + msg });
    document.body.appendChild(live);
    setTimeout(function () { live.remove(); }, 1500);
  }

  // buttons ---

  function linkButton(href, label, primary, small) {
    return el("a", {
      class: "btn " + (primary ? "btn-primary" : "btn-outline") + (small ? " btn-compact" : ""),
      href: href, target: "_blank", rel: "noopener noreferrer",
    }, [label]);
  }

  function whatsappButton(res) {
    var g = res.match, r = res.resolved;
    var text = t("share.text", {
      brand: r.brand || g.generic_name,
      branded: rupees(r.brandMrp),
      generic: g.generic_name,
      price: rupees(g.mrp),
    });
    return el("a", {
      class: "btn btn-outline btn-compact", target: "_blank", rel: "noopener noreferrer",
      href: "https://wa.me/?text=" + encodeURIComponent(text),
    }, [t("share.whatsapp")]);
  }

  function speakButton(res) {
    return el("button", { class: "btn btn-outline btn-compact", onclick: function () { speak(res); } }, [t("speak.button")]);
  }

  function speak(res) {
    try {
      window.speechSynthesis.cancel();
      var g = res.match;
      var parts = [g.generic_name];
      if (res.savings) parts.push(t("result.save.sr", { rupees: Math.round(res.savings.saved), pct: res.savings.pct }));
      parts.push(t("result.disclaimer"));
      var u = new SpeechSynthesisUtterance(parts.join(". "));
      u.lang = state.lang === "hi" ? "hi-IN" : "en-IN";
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  // icons ---
  function svg(path, size) {
    return el("span", { html: '<svg viewBox="0 0 24 24" width="' + (size || 24) + '" height="' + (size || 24) + '" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' + path + "</svg>" }).firstChild;
  }
  function iconInfo() { return svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>', 20); }
  function iconAlert() { var s = svg('<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/>', 48); s.setAttribute("class", "ico"); return s; }
  function iconSearchOff() { var s = svg('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4M8 11h6"/>', 48); s.setAttribute("class", "ico"); return s; }

  // ---- offline ------------------------------------------------------------

  function updateOnline() {
    $("#offlineBanner").classList.toggle("show", !navigator.onLine);
    var net = $("#photoNet");
    if (net) net.style.color = navigator.onLine ? "" : "var(--danger)";
  }

  // ---- Kendra locator -----------------------------------------------------

  var GEO_TIMEOUT_MS = 10000;
  var OFFICIAL_LOCATOR = "https://janaushadhi.gov.in/locate-kendra";

  function openKendra() {
    openStage("kendra");
    setKendraMsg("");
    var btn = $("#useLocation");
    if (btn) btn.focus();
    // If we already have results (e.g. re-opening), keep them.
    if (!state._kendraList) $("#kendraList").innerHTML = "";
    if (state.mapAvailable && state.mapAvailable()) $("#kendraTabs").hidden = false;
  }

  function setKendraMsg(text) {
    var m = $("#kendraMsg");
    if (m) m.textContent = text || "";
  }

  function useLocation() {
    if (!navigator.geolocation) { onGeoError(); return; }
    setKendraMsg(t("kendra.locating"));
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        setKendraMsg("");
        var origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        showKendraResults(L.nearest(state.kendras, origin, 10), origin, false);
      },
      function () { onGeoError(); },
      { enableHighAccuracy: false, timeout: GEO_TIMEOUT_MS, maximumAge: 60000 }
    );
  }

  function onGeoError() {
    // No dead end: send the user to the PIN field with a friendly message.
    setKendraMsg(t("kendra.denied"));
    var pin = $("#pinInput");
    if (pin) pin.focus();
  }

  function submitPin(e) {
    if (e) e.preventDefault();
    var pin = ($("#pinInput").value || "").trim();
    if (!L.isValidPin(pin)) { setKendraMsg(t("kendra.none")); return; }
    var list = L.byPin(state.kendras, pin, 10);
    if (!list.length) { setKendraMsg(t("kendra.none")); clearKendraResults(); return; }
    setKendraMsg("");
    // Origin for the map: the centroid of the exact-PIN matches.
    var exact = state.kendras.filter(function (k) { return String(k.pin) === pin; });
    var origin = L.centroid(exact);
    showKendraResults(list, origin, true);
  }

  // Keep the current list + origin so we can re-render (language change, tabs).
  function showKendraResults(list, origin, fromPin) {
    state._kendraList = list;
    state._kendraOrigin = origin;
    state._kendraFromPin = fromPin;
    renderKendraResults();
    if (state.mapAvailable && state.mapAvailable()) {
      $("#kendraTabs").hidden = false;
      if (state.updateMap) state.updateMap(list, origin);
    }
  }

  function clearKendraResults() {
    state._kendraList = null; state._kendraOrigin = null;
    $("#kendraList").innerHTML = "";
    $("#kendraTabs").hidden = true;
  }

  function renderKendraResults() {
    if (!state._kendraList) return;
    renderKendraList(state._kendraList);
  }

  function renderKendraList(list) {
    var host = $("#kendraList");
    host.innerHTML = "";
    list.forEach(function (k, i) {
      var addr = el("p", { class: "k-addr" }, [k.address]);
      if (k.approx_location) addr.appendChild(el("span", { class: "approx-tag", text: t("kendra.approx") }));
      var main = el("div", { class: "k-main" }, [
        el("h3", { class: "k-name", text: k.name }),
        addr,
      ]);
      if (k.distanceKmRounded != null) {
        main.appendChild(el("p", { class: "k-dist", text: t("kendra.distance", { km: k.distanceKmRounded }) }));
      }
      var actions = el("div", { class: "k-actions" });
      if (k.phone) {
        actions.appendChild(el("a", { class: "btn btn-outline", href: "tel:" + k.phone }, [t("kendra.call")]));
      }
      actions.appendChild(el("a", {
        class: "btn btn-primary",
        href: "https://www.google.com/maps/dir/?api=1&destination=" + k.lat + "," + k.lng,
        target: "_blank", rel: "noopener noreferrer",
      }, [t("kendra.directions")]));

      var card = el("div", { class: "kendra-card", id: "kcard-" + i, "data-idx": i }, [main, actions]);
      card.addEventListener("click", function (ev) {
        if (ev.target.closest("a")) return; // let Call/Directions work
        if (state.focusMapMarker) state.focusMapMarker(i);
      });
      host.appendChild(card);
    });
  }

  function kendraBackHandler() {
    // Return to the result if there was one, else home.
    if (state._lastResult && state._lastResult.reason && state._lastResult.reason !== "none") {
      openResult();
    } else {
      show("home");
    }
  }

  // Tabs are wired by the map module (see initMap). Until then this is a no-op
  // and the Map tab stays hidden, so the list works on its own.
  function wireKendraTabs() { if (state.wireKendraTabs) state.wireKendraTabs(); }

  // ---- nav helpers --------------------------------------------------------

  function goType() { show("search", { focus: "searchInput" }); closeSuggestions(); }
  function goPhoto() { show("photo"); }
  function goKendra() { openKendra(); }

  // ---- init ---------------------------------------------------------------

  function wire() {
    // language
    $all("#langToggle button").forEach(function (b) {
      b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
    });

    // theme
    var themeBtn = $("#themeToggle");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

    // home actions
    $("#goPhoto").addEventListener("click", goPhoto);
    $("#goType").addEventListener("click", goType);
    $all(".chip").forEach(function (c) {
      c.addEventListener("click", function () {
        goType();
        var q = c.getAttribute("data-example");
        $("#searchInput").value = q;
        runSearch(q);
      });
    });

    // back buttons
    $all("[data-goto]").forEach(function (b) {
      b.addEventListener("click", function () { show(b.getAttribute("data-goto")); });
    });

    // bottom bar
    $all("[data-bottom]").forEach(function (b) {
      b.addEventListener("click", function () {
        b.getAttribute("data-bottom") === "photo" ? goPhoto() : goType();
      });
    });

    // search input
    var input = $("#searchInput");
    input.addEventListener("input", function () {
      var q = input.value;
      $("#clearSearch").classList.toggle("show", q.length > 0);
      renderSuggestions(q);
    });
    input.addEventListener("keydown", function (e) {
      if (!suggestItems.length) {
        if (e.key === "Enter") { e.preventDefault(); runSearch(input.value); }
        return;
      }
      if (e.key === "ArrowDown") { e.preventDefault(); highlightSuggestion((suggestActive + 1) % suggestItems.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); highlightSuggestion((suggestActive - 1 + suggestItems.length) % suggestItems.length); }
      else if (e.key === "Enter") {
        e.preventDefault();
        if (suggestActive >= 0) chooseSuggestion(suggestActive);
        else { closeSuggestions(); runSearch(input.value); }
      } else if (e.key === "Escape") { closeSuggestions(); }
    });
    $("#clearSearch").addEventListener("click", function () {
      input.value = ""; $("#clearSearch").classList.remove("show"); closeSuggestions(); input.focus();
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".field-wrap") && !e.target.closest("#suggest")) closeSuggestions();
    });

    // photo
    $("#photoInput").addEventListener("change", function (e) {
      var file = e.target.files && e.target.files[0];
      state.lastPhotoFile = file;
      handlePhoto(file);
    });
    $("#confirmShow").addEventListener("click", confirmAndMatch);

    // Kendra locator
    var useLoc = $("#useLocation");
    if (useLoc) useLoc.addEventListener("click", useLocation);
    var pinForm = $("#pinForm");
    if (pinForm) pinForm.addEventListener("submit", submitPin);
    var kBack = $("#kendraBack");
    if (kBack) kBack.addEventListener("click", kendraBackHandler);
    var fKendra = $("#footerKendra");
    if (fKendra) fKendra.addEventListener("click", goKendra);
    // only digits in the PIN field
    var pinInput = $("#pinInput");
    if (pinInput) pinInput.addEventListener("input", function () {
      pinInput.value = pinInput.value.replace(/\D/g, "").slice(0, 6);
    });
    wireKendraTabs();

    // offline
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    updateOnline();
  }

  function loadData() {
    state.kendras = [];
    // Kendras are optional; load them in parallel but never block the app.
    fetch("data/kendras.json")
      .then(function (r) { return r.json(); })
      .then(function (k) { if (Array.isArray(k)) state.kendras = k; })
      .catch(function () {});

    return Promise.all([
      fetch("data/jan_aushadhi.json").then(function (r) { return r.json(); }),
      fetch("data/brands.json").then(function (r) { return r.json(); }),
    ]).then(function (res) {
      var jan = res[0], brands = res[1];
      state.dataDate = (jan && jan.snapshot_date) || state.dataDate;
      state.index = M.buildIndex(jan, brands);
      applyI18n();
    }).catch(function () {
      // data is bundled; a failure is rare, but keep the UI usable
      state.index = M.buildIndex({ products: [] }, { brands: [] });
    });
  }

  function init() {
    initLang();
    initTheme();
    wire();
    loadData();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
