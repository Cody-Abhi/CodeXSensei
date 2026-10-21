/**
 * locator.js — DawaDekho Kendra locator maths. Pure and dependency-free.
 * Runs in the browser (window.DawaLocator) and in Node tests.
 *
 * No network, no Mapbox: just distance and PIN logic over the bundled
 * data/kendras.json. The map is a separate, optional enhancement.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.DawaLocator = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var R_KM = 6371; // Earth radius in km

  function toRad(d) { return (d * Math.PI) / 180; }

  function isNum(n) { return typeof n === "number" && Number.isFinite(n); }
  function validPoint(p) { return p && isNum(p.lat) && isNum(p.lng); }

  // Great-circle distance between two {lat,lng} points, in kilometres.
  function haversineKm(a, b) {
    if (!validPoint(a) || !validPoint(b)) return Infinity;
    var dLat = toRad(b.lat - a.lat);
    var dLng = toRad(b.lng - a.lng);
    var lat1 = toRad(a.lat);
    var lat2 = toRad(b.lat);
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R_KM * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  // Round distance for display: one decimal under 10 km, whole numbers above.
  function roundKm(km) {
    if (!isNum(km)) return null;
    return km < 10 ? Math.round(km * 10) / 10 : Math.round(km);
  }

  /**
   * The `n` nearest Kendras to a point, each annotated with distanceKm,
   * sorted ascending. Invalid input yields [].
   */
  function nearest(kendras, point, n) {
    n = n || 10;
    if (!Array.isArray(kendras) || !validPoint(point)) return [];
    return kendras
      .filter(validPoint)
      .map(function (k) {
        var km = haversineKm(point, k);
        return Object.assign({}, k, { distanceKm: km, distanceKmRounded: roundKm(km) });
      })
      .sort(function (a, b) { return a.distanceKm - b.distanceKm; })
      .slice(0, n);
  }

  function centroid(list) {
    var pts = list.filter(validPoint);
    if (!pts.length) return null;
    var lat = 0, lng = 0;
    pts.forEach(function (p) { lat += p.lat; lng += p.lng; });
    return { lat: lat / pts.length, lng: lng / pts.length };
  }

  function isValidPin(pin) { return typeof pin === "string" && /^\d{6}$/.test(pin); }

  /**
   * Kendras for a PIN code: exact PIN matches first (ordered by distance to
   * their centroid), then the nearest others to that centroid, up to `n`.
   * An invalid PIN or no exact match yields [].
   */
  function byPin(kendras, pin, n) {
    n = n || 10;
    if (!Array.isArray(kendras) || !isValidPin(pin)) return [];
    var exact = kendras.filter(function (k) { return k && String(k.pin) === pin; });
    if (!exact.length) return [];
    var c = centroid(exact);
    if (!c) return [];
    var exactRanked = nearest(exact, c, exact.length);
    var exactCodes = {};
    exactRanked.forEach(function (k) { if (k.code) exactCodes[k.code] = true; });
    var others = nearest(
      kendras.filter(function (k) { return !(k.code && exactCodes[k.code]); }),
      c,
      n
    );
    return exactRanked.concat(others).slice(0, n);
  }

  return {
    haversineKm: haversineKm,
    roundKm: roundKm,
    nearest: nearest,
    byPin: byPin,
    centroid: centroid,
    isValidPin: isValidPin,
  };
});
