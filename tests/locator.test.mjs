/**
 * locator.test.mjs — Kendra locator maths. Runs on Node's test runner:
 *   node --test
 * No install needed; imports the UMD locator.js as a CommonJS default export.
 */
import test from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const L = require("../locator.js");

const __dirname = dirname(fileURLToPath(import.meta.url));
const kendras = JSON.parse(readFileSync(join(__dirname, "..", "data", "kendras.json"), "utf8"));

test("haversine: known short pair within ±0.5 km", () => {
  // 0.01° of longitude at ~26.85°N ≈ 0.993 km.
  const d = L.haversineKm({ lat: 26.85, lng: 80.94 }, { lat: 26.85, lng: 80.95 });
  assert.ok(Math.abs(d - 0.993) < 0.5, `expected ~0.99 km, got ${d.toFixed(3)}`);
});

test("haversine: identical points is 0, invalid is Infinity", () => {
  assert.strictEqual(L.haversineKm({ lat: 26.85, lng: 80.94 }, { lat: 26.85, lng: 80.94 }), 0);
  assert.strictEqual(L.haversineKm({ lat: 26.85 }, { lat: 26.85, lng: 80.94 }), Infinity);
});

test("nearest: returns ascending distances, capped at n", () => {
  const pt = { lat: 26.8508, lng: 80.9462 }; // Hazratganj
  const res = L.nearest(kendras, pt, 5);
  assert.strictEqual(res.length, 5);
  for (let i = 1; i < res.length; i++) {
    assert.ok(res[i].distanceKm >= res[i - 1].distanceKm, "distances must be sorted ascending");
  }
  // nearest should essentially be Hazratganj itself (~0 km)
  assert.ok(res[0].distanceKm < 0.5, `nearest should be ~0 km, got ${res[0].distanceKm}`);
  assert.ok(res[0].distanceKmRounded != null);
});

test("nearest: empty / invalid input yields []", () => {
  assert.deepStrictEqual(L.nearest([], { lat: 26.85, lng: 80.94 }), []);
  assert.deepStrictEqual(L.nearest(kendras, null), []);
  assert.deepStrictEqual(L.nearest(kendras, { lat: "x", lng: 1 }), []);
});

test("byPin: valid PIN returns exact matches first", () => {
  const res = L.byPin(kendras, "226001", 10);
  assert.ok(res.length > 0, "226001 should return results");
  const exact = kendras.filter((k) => k.pin === "226001");
  assert.ok(exact.length > 0);
  // the first `exact.length` results should all be the 226001 Kendras
  for (let i = 0; i < exact.length; i++) {
    assert.strictEqual(res[i].pin, "226001", `result ${i} should be an exact PIN match`);
  }
});

test("byPin: invalid PIN yields []", () => {
  assert.deepStrictEqual(L.byPin(kendras, "abc"), []);
  assert.deepStrictEqual(L.byPin(kendras, "123"), []);
  assert.deepStrictEqual(L.byPin(kendras, "999999"), []); // valid shape, no match
  assert.deepStrictEqual(L.byPin(kendras, ""), []);
});

test("isValidPin", () => {
  assert.ok(L.isValidPin("226001"));
  assert.ok(!L.isValidPin("22600"));
  assert.ok(!L.isValidPin("2260011"));
  assert.ok(!L.isValidPin("22600a"));
});
