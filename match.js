/**
 * match.js — DawaDekho matching engine.
 *
 * Runs in the browser (as window.DawaMatch) and in Node (via require) with no
 * dependencies, so the test suite needs no install.
 *
 * The golden rule: this file never invents a drug, salt or price. It only
 * turns a messy input (typed text, or Gemma's reading of a strip) into a
 * *search key* — a normalised salt-set + strength — and looks that key up in
 * the bundled Jan Aushadhi data. If nothing matches confidently, it says so.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.DawaMatch = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Salts that are the same molecule under different names.
  var SALT_ALIASES = {
    acetaminophen: "paracetamol",
    "vitamin c": "ascorbic acid",
    "oral rehydration salts": "ors",
    "vitamin b complex": "b complex",
  };

  // ---- normalisation ------------------------------------------------------

  function normStr(s) {
    return String(s == null ? "" : s).toLowerCase().replace(/\s+/g, " ").trim();
  }

  // Strip to letters+digits for fuzzy comparison: "Pan 40" -> "pan40".
  function compact(s) {
    return normStr(s).replace(/[^a-z0-9]/g, "");
  }

  function normalizeSalt(salt) {
    var s = normStr(salt);
    return SALT_ALIASES[s] || s;
  }

  // A canonical, order-independent key for a salt set: sorted + aliased.
  function saltSetKey(salts) {
    if (!Array.isArray(salts)) salts = [salts];
    return salts.map(normalizeSalt).filter(Boolean).sort().join("+");
  }

  // Strength as an order-independent multiset: "40mg + 5 MG" -> "40mg+5mg".
  function strengthSetKey(strength) {
    return String(strength == null ? "" : strength)
      .toLowerCase()
      .split(/[+/]/)
      .map(function (t) { return t.replace(/\s+/g, ""); })
      .filter(Boolean)
      .sort()
      .join("+");
  }

  // The lookup key that both generics and brands are reduced to.
  function matchKey(salts, strength) {
    return saltSetKey(salts) + "@" + strengthSetKey(strength);
  }

  // ---- fuzzy scoring ------------------------------------------------------

  function levenshtein(a, b) {
    if (a === b) return 0;
    var al = a.length, bl = b.length;
    if (al === 0) return bl;
    if (bl === 0) return al;
    var prev = new Array(bl + 1);
    for (var j = 0; j <= bl; j++) prev[j] = j;
    for (var i = 1; i <= al; i++) {
      var cur = [i];
      for (var k = 1; k <= bl; k++) {
        var cost = a.charCodeAt(i - 1) === b.charCodeAt(k - 1) ? 0 : 1;
        cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + cost);
      }
      prev = cur;
    }
    return prev[bl];
  }

  // 0..1 similarity, 1 = identical.
  function similarity(a, b) {
    if (!a && !b) return 1;
    if (!a || !b) return 0;
    var max = Math.max(a.length, b.length);
    return 1 - levenshtein(a, b) / max;
  }

  // Score a query against one candidate string. Exact > substring > fuzzy.
  function scoreCandidate(queryCompact, candidate) {
    var c = compact(candidate);
    if (!c) return 0;
    if (queryCompact === c) return 1;
    // Whole-query substring (e.g. "pan" inside "pan40") — strong but not exact.
    if (queryCompact.length >= 3 && c.indexOf(queryCompact) !== -1) {
      return 0.9 + 0.09 * (queryCompact.length / c.length);
    }
    if (c.length >= 3 && queryCompact.indexOf(c) !== -1) {
      return 0.88 + 0.09 * (c.length / queryCompact.length);
    }
    return similarity(queryCompact, c);
  }

  // Minimum confidence to accept a typed brand/generic match.
  var ACCEPT_THRESHOLD = 0.62;

  // ---- index --------------------------------------------------------------

  /**
   * Build a searchable index from the two datasets.
   * @param {{products:Array}} janData
   * @param {{brands:Array}} brandData
   */
  function buildIndex(janData, brandData) {
    var products = (janData && janData.products) || [];
    var brands = (brandData && brandData.brands) || [];

    // key -> [generic, ...]
    var byKey = {};
    // saltSetKey -> [generic, ...] (for same-salt / other-strength fallbacks)
    var bySaltSet = {};

    products.forEach(function (p) {
      var key = matchKey(p.salts, p.strength);
      (byKey[key] = byKey[key] || []).push(p);
      var sk = saltSetKey(p.salts);
      (bySaltSet[sk] = bySaltSet[sk] || []).push(p);
    });

    // Searchable brand entries with every alias flattened.
    var brandEntries = brands.map(function (b) {
      var names = [b.brand].concat(Array.isArray(b.aliases) ? b.aliases : []);
      return { brand: b, names: names, namesCompact: names.map(compact) };
    });

    return {
      janData: janData,
      brandData: brandData,
      products: products,
      brands: brands,
      byKey: byKey,
      bySaltSet: bySaltSet,
      brandEntries: brandEntries,
    };
  }

  // ---- generic lookup -----------------------------------------------------

  function cheapest(list) {
    return list.slice().sort(function (a, b) { return a.mrp - b.mrp; })[0];
  }

  // Given a resolved salt-set + strength, return { match, alternatives }.
  function findGenerics(index, salts, strength) {
    var key = matchKey(salts, strength);
    var exact = (index.byKey[key] || []).slice();
    if (exact.length) {
      var top = cheapest(exact);
      var alts = exact.filter(function (g) { return g !== top; });
      // Pad alternatives with same-salt, other-strength options.
      var sameSalt = (index.bySaltSet[saltSetKey(salts)] || []).filter(function (g) {
        return exact.indexOf(g) === -1;
      });
      alts = alts.concat(sameSalt);
      return { match: top, alternatives: alts.slice(0, 2), exactStrength: true };
    }
    // No exact strength — offer same-salt options honestly flagged.
    var sameSaltOnly = (index.bySaltSet[saltSetKey(salts)] || []).slice();
    if (sameSaltOnly.length) {
      var t = cheapest(sameSaltOnly);
      return {
        match: t,
        alternatives: sameSaltOnly.filter(function (g) { return g !== t; }).slice(0, 2),
        exactStrength: false,
      };
    }
    return { match: null, alternatives: [], exactStrength: false };
  }

  // ---- brand resolution ---------------------------------------------------

  // Best brand for a typed query, or null below threshold.
  function resolveBrand(index, query) {
    var qc = compact(query);
    if (!qc) return null;
    var best = null;
    index.brandEntries.forEach(function (entry) {
      var score = 0;
      entry.namesCompact.forEach(function (c) {
        var s = scoreCandidate(qc, c);
        if (s > score) score = s;
      });
      if (!best || score > best.score) best = { brand: entry.brand, score: score };
    });
    if (best && best.score >= ACCEPT_THRESHOLD) return best;
    return null;
  }

  // Match a typed query directly against generic salts/names (no brand).
  function resolveSalt(index, query) {
    var qc = compact(query);
    if (!qc) return null;
    var best = null;
    index.products.forEach(function (p) {
      var cands = [p.generic_name].concat(p.salts || []);
      var score = 0;
      cands.forEach(function (name) {
        var s = scoreCandidate(qc, name);
        if (s > score) score = s;
      });
      if (!best || score > best.score) best = { product: p, score: score };
    });
    if (best && best.score >= ACCEPT_THRESHOLD) return best;
    return null;
  }

  // ---- public search (typed flow) ----------------------------------------

  /**
   * Resolve a typed query to a result object.
   * @returns {{
   *   reason: 'brand'|'salt'|'none',
   *   query: string,
   *   resolved: ?{brand, salts, strength, form, brandMrp, approx},
   *   match: ?Object,
   *   alternatives: Array,
   *   savings: ?{branded:number, generic:number, saved:number, pct:number}
   * }}
   */
  function search(index, query) {
    var out = { reason: "none", query: query, resolved: null, match: null, alternatives: [], savings: null };
    if (!query || !compact(query)) return out;

    var brand = resolveBrand(index, query);
    if (brand) {
      var b = brand.brand;
      var g = findGenerics(index, b.salts, b.strength);
      out.reason = "brand";
      out.resolved = {
        brand: b.brand,
        salts: b.salts,
        strength: b.strength,
        form: b.form,
        brandMrp: typeof b.approx_mrp === "number" ? b.approx_mrp : null,
        approx: true, // typed path has no strip, so brand price is approximate
      };
      out.match = g.match;
      out.alternatives = g.alternatives;
      out.exactStrength = g.exactStrength;
      if (g.match && out.resolved.brandMrp) {
        out.savings = computeSavings(out.resolved.brandMrp, g.match.mrp);
      }
      if (!g.match) out.reason = "none";
      return out;
    }

    // Fall back to typing a generic/salt name directly.
    var salt = resolveSalt(index, query);
    if (salt) {
      var p = salt.product;
      var gg = findGenerics(index, p.salts, p.strength);
      out.reason = "salt";
      out.resolved = {
        brand: null,
        salts: p.salts,
        strength: p.strength,
        form: p.form,
        brandMrp: null,
        approx: false,
      };
      out.match = gg.match || p;
      out.alternatives = gg.alternatives;
      out.exactStrength = true;
      return out;
    }

    return out; // reason: 'none' — honest no-match
  }

  // ---- photo flow (Gemma output) -----------------------------------------

  /**
   * Match Gemma's strip reading. Gemma output is ONLY a search key; all facts
   * come from the dataset. The branded price prefers the strip's printed MRP.
   * @param {{brand?, salts, strength, form?, mrp_printed?}} gemma
   */
  function matchFromGemma(index, gemma) {
    var out = { reason: "none", resolved: null, match: null, alternatives: [], savings: null };
    if (!gemma || !gemma.salts || !gemma.strength) return out;

    var g = findGenerics(index, gemma.salts, gemma.strength);
    var strip = typeof gemma.mrp_printed === "number" && gemma.mrp_printed > 0 ? gemma.mrp_printed : null;

    // If the brand is recognised, borrow its approx price only when the strip
    // MRP is missing.
    var approxFromBrand = null;
    if (gemma.brand) {
      var rb = resolveBrand(index, gemma.brand);
      if (rb && typeof rb.brand.approx_mrp === "number") approxFromBrand = rb.brand.approx_mrp;
    }

    var brandMrp = strip != null ? strip : approxFromBrand;
    out.reason = g.match ? "photo" : "none";
    out.resolved = {
      brand: gemma.brand || null,
      salts: gemma.salts,
      strength: gemma.strength,
      form: gemma.form || null,
      brandMrp: brandMrp,
      approx: strip == null, // true = we used the brand-list approx, not the strip
    };
    out.match = g.match;
    out.alternatives = g.alternatives;
    out.exactStrength = g.exactStrength;
    if (g.match && brandMrp) out.savings = computeSavings(brandMrp, g.match.mrp);
    return out;
  }

  function computeSavings(branded, generic) {
    var saved = Math.max(0, branded - generic);
    var pct = branded > 0 ? Math.round((saved / branded) * 100) : 0;
    return {
      branded: round2(branded),
      generic: round2(generic),
      saved: round2(saved),
      pct: pct,
    };
  }

  function round2(n) { return Math.round(n * 100) / 100; }

  // ---- suggestions (live dropdown) ---------------------------------------

  // Up to `limit` brand/generic names ranked by score, for the search field.
  function suggest(index, query, limit) {
    limit = limit || 6;
    var qc = compact(query);
    if (qc.length < 2) return [];
    var scored = [];
    index.brandEntries.forEach(function (entry) {
      var score = 0;
      entry.namesCompact.forEach(function (c) {
        var s = scoreCandidate(qc, c);
        if (s > score) score = s;
      });
      if (score >= 0.45) {
        scored.push({
          type: "brand",
          label: entry.brand.brand,
          sub: entry.brand.salts.join(" + ") + " " + entry.brand.strength,
          score: score,
          brand: entry.brand,
        });
      }
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, limit);
  }

  return {
    // normalisation (exported for tests)
    normalizeSalt: normalizeSalt,
    saltSetKey: saltSetKey,
    strengthSetKey: strengthSetKey,
    matchKey: matchKey,
    similarity: similarity,
    // engine
    buildIndex: buildIndex,
    search: search,
    suggest: suggest,
    matchFromGemma: matchFromGemma,
    findGenerics: findGenerics,
    resolveBrand: resolveBrand,
    computeSavings: computeSavings,
    ACCEPT_THRESHOLD: ACCEPT_THRESHOLD,
  };
});
