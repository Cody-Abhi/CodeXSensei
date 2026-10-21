/**
 * config.js — public runtime configuration. Safe to commit (no secrets here).
 *
 * MAPBOX_TOKEN must be a PUBLIC token (starts with "pk."), restricted by URL
 * to your DigitalOcean app domain and localhost, with only the map read scopes
 * (styles:read, fonts:read, sprites:read, tiles:read / vision). NEVER put a
 * secret token (starts with "sk.") in the browser or in this file.
 *
 * Leave it empty to run the Kendra locator in list-only mode — the map tab
 * stays hidden and everything else works. Mapbox's free tier covers 50,000 web
 * map loads per month; the map is loaded lazily to keep usage low.
 */
window.DAWA_CONFIG = {
  // Paste your public Mapbox token here, or inject it at deploy time.
  MAPBOX_TOKEN: "",
  // Pinned Mapbox GL JS version loaded from the Mapbox CDN.
  MAP_VERSION: "3.9.1",
};
