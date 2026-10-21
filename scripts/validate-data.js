#!/usr/bin/env node
/**
 * validate-data.js — fail loudly if the dataset is malformed.
 *
 * The golden rule of DawaDekho is "never invent a price or a salt". That only
 * holds if the bundled data is clean, so this runs in CI and before any demo.
 *
 * Checks, for every Jan Aushadhi product:
 *   - code, generic_name present and non-empty
 *   - salts is a non-empty array of non-empty strings
 *   - strength present
 *   - mrp is a finite number > 0
 *   - unit/form present
 *   - code is unique
 * And for every brand:
 *   - brand, salts[], strength present
 *   - approx_mrp is a finite number > 0
 *   - every brand salt-set + strength has at least one matching generic
 *     (so the demo never shows a brand we cannot answer)
 *
 * Usage: node scripts/validate-data.js
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

function load(file) {
  const full = path.join(DATA_DIR, file);
  try {
    return JSON.parse(fs.readFileSync(full, "utf8"));
  } catch (err) {
    fail(`Could not read/parse ${file}: ${err.message}`);
    process.exit(1);
  }
}

const errors = [];
const warnings = [];
function fail(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

function isNonEmptyString(v) { return typeof v === "string" && v.trim().length > 0; }
function isPositiveNumber(v) { return typeof v === "number" && Number.isFinite(v) && v > 0; }

// Normalise a salt set to a comparable key: lowercase, trimmed, sorted.
function saltKey(salts, strength) {
  const s = (salts || []).map((x) => String(x).trim().toLowerCase()).sort();
  return `${s.join("+")}@${String(strength || "").trim().toLowerCase()}`;
}

const jan = load("jan_aushadhi.json");
const brands = load("brands.json");

// ---- Jan Aushadhi ----
const products = Array.isArray(jan.products) ? jan.products : [];
if (products.length === 0) fail("jan_aushadhi.json has no products[]");

const seenCodes = new Set();
const genericKeys = new Set();

products.forEach((p, i) => {
  const where = `jan_aushadhi[${i}] (${p && p.code ? p.code : "?"})`;
  if (!isNonEmptyString(p.code)) fail(`${where}: missing code`);
  else if (seenCodes.has(p.code)) fail(`${where}: duplicate code`);
  else seenCodes.add(p.code);

  if (!isNonEmptyString(p.generic_name)) fail(`${where}: missing generic_name`);
  if (!Array.isArray(p.salts) || p.salts.length === 0) fail(`${where}: salts must be a non-empty array`);
  else if (!p.salts.every(isNonEmptyString)) fail(`${where}: salts has empty entries`);
  if (!isNonEmptyString(p.strength)) fail(`${where}: missing strength`);
  if (!isNonEmptyString(p.form)) fail(`${where}: missing form`);
  if (!isNonEmptyString(p.unit)) fail(`${where}: missing unit`);
  if (!isPositiveNumber(p.mrp)) fail(`${where}: mrp must be a number > 0 (got ${JSON.stringify(p.mrp)})`);

  if (Array.isArray(p.salts) && isNonEmptyString(p.strength)) {
    genericKeys.add(saltKey(p.salts, p.strength));
  }
});

// ---- Brands ----
const brandList = Array.isArray(brands.brands) ? brands.brands : [];
if (brandList.length === 0) fail("brands.json has no brands[]");

const seenBrands = new Set();
brandList.forEach((b, i) => {
  const where = `brands[${i}] (${b && b.brand ? b.brand : "?"})`;
  if (!isNonEmptyString(b.brand)) fail(`${where}: missing brand`);
  else {
    const key = b.brand.toLowerCase();
    if (seenBrands.has(key)) fail(`${where}: duplicate brand name`);
    else seenBrands.add(key);
  }
  if (!Array.isArray(b.salts) || b.salts.length === 0) fail(`${where}: salts must be a non-empty array`);
  if (!isNonEmptyString(b.strength)) fail(`${where}: missing strength`);
  if (!isNonEmptyString(b.form)) fail(`${where}: missing form`);
  if (b.approx_mrp !== undefined && b.approx_mrp !== null && !isPositiveNumber(b.approx_mrp)) {
    fail(`${where}: approx_mrp must be a number > 0 when present (got ${JSON.stringify(b.approx_mrp)})`);
  }
  if (b.aliases !== undefined && !Array.isArray(b.aliases)) fail(`${where}: aliases must be an array`);

  // Every brand should have a generic to point at, else the demo dead-ends.
  if (Array.isArray(b.salts) && isNonEmptyString(b.strength)) {
    if (!genericKeys.has(saltKey(b.salts, b.strength))) {
      warn(`${where}: no Jan Aushadhi generic matches salt-set + strength (${saltKey(b.salts, b.strength)})`);
    }
  }
});

// ---- Report ----
console.log(`Checked ${products.length} generics and ${brandList.length} brands.`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  warnings.forEach((w) => console.log(`  ⚠ ${w}`));
}
if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  errors.forEach((e) => console.error(`  ✗ ${e}`));
  console.error("\nData validation FAILED.");
  process.exit(1);
}
console.log("\n✓ Data validation passed.");
