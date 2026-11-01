/**
 * WCAG 2.x contrast verification for the "Survey Ledger" tokens (§15.1, App. C).
 * Fails (exit 1) if any documented pair drops below its required ratio.
 * Run: pnpm verify:contrast
 */

type RGB = { r: number; g: number; b: number };

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const int = parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function relativeLuminance({ r, g, b }: RGB): number {
  const chan = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

function contrast(a: string, b: string): number {
  const l1 = relativeLuminance(hexToRgb(a));
  const l2 = relativeLuminance(hexToRgb(b));
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

// Modern Civic Minimalism palette (kept in sync with src/styles/tokens.css).
const T = {
  primary: "#0F766E",
  primaryHover: "#0B5D56",
  accent: "#CA8A04",
  bg: "#F5F8F7",
  surface: "#FFFFFF",
  sunken: "#EDF2F1",
  text: "#172B36",
  textSecondary: "#475569",
  textMuted: "#596579",
  borderStrong: "#64748B",
  success: "#15803D",
  warning: "#B45309",
  danger: "#B91C1C",
  info: "#0369A1",
  prioCriticalFg: "#B42318",
  prioCriticalBg: "#FCEBEA",
  prioHighFg: "#9A4408",
  prioHighBg: "#FBF0E0",
  prioMediumFg: "#845607",
  prioMediumBg: "#FBF4DE",
  prioLowFg: "#334E68",
  prioLowBg: "#EAF0F4",
  white: "#FFFFFF",
};

// [name, fg, bg, minRatio]. 4.5 = AA text; 3.0 = AA large/UI boundary (1.4.11).
const CHECKS: ReadonlyArray<[string, string, string, number]> = [
  ["text / bg", T.text, T.bg, 4.5],
  ["text / surface", T.text, T.surface, 4.5],
  ["secondary text / surface", T.textSecondary, T.surface, 4.5],
  ["secondary text / bg", T.textSecondary, T.bg, 4.5],
  ["muted text / bg", T.textMuted, T.bg, 4.5],
  ["muted text / surface", T.textMuted, T.surface, 4.5],
  ["muted text / sunken", T.textMuted, T.sunken, 4.5],
  ["white / primary (button)", T.white, T.primary, 4.5],
  ["white / primary-hover", T.white, T.primaryHover, 4.5],
  ["primary link / surface", T.primary, T.surface, 4.5],
  ["ink on accent", T.text, T.accent, 4.5],
  ["success / surface", T.success, T.surface, 4.5],
  ["warning / surface", T.warning, T.surface, 4.5],
  ["danger / surface", T.danger, T.surface, 4.5],
  ["info / surface", T.info, T.surface, 4.5],
  ["priority critical fg / its bg", T.prioCriticalFg, T.prioCriticalBg, 4.5],
  ["priority high fg / its bg", T.prioHighFg, T.prioHighBg, 4.5],
  ["priority medium fg / its bg", T.prioMediumFg, T.prioMediumBg, 4.5],
  ["priority low fg / its bg", T.prioLowFg, T.prioLowBg, 4.5],
  ["control border / white (1.4.11)", T.borderStrong, T.white, 3.0],
  ["control border / bg (1.4.11)", T.borderStrong, T.bg, 3.0],
];

let failures = 0;
for (const [name, fg, bg, min] of CHECKS) {
  const ratio = contrast(fg, bg);
  const ok = ratio >= min;
  if (!ok) failures += 1;
  const mark = ok ? "PASS" : "FAIL";
  console.log(`${mark}  ${ratio.toFixed(2)}:1  (min ${min})  ${name}`);
}

if (failures > 0) {
  console.error(`\n${failures} contrast check(s) failed.`);
  process.exit(1);
}
console.log("\nAll contrast checks passed.");
