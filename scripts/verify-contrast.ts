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

const T = {
  primary: "#1B3A8C",
  primaryHover: "#142D70",
  secondary: "#0B6E66",
  accent: "#F2B233",
  bg: "#F4F6F9",
  surface: "#FFFFFF",
  text: "#13203A",
  textSecondary: "#3A4762",
  textMuted: "#5E6A84",
  borderStrong: "#76829A",
  success: "#17683F",
  warning: "#7A5208",
  danger: "#9B2318",
  info: "#1D4ED8",
  prioCritical: "#8F1D14",
  prioHigh: "#8A3A07",
  prioMedium: "#6E4A07",
  prioLow: "#2F4A6B",
  white: "#FFFFFF",
};

// [name, fg, bg, minRatio]. 4.5 = AA text; 3.0 = AA large/UI boundary (1.4.11).
const CHECKS: ReadonlyArray<[string, string, string, number]> = [
  ["text / bg", T.text, T.bg, 4.5],
  ["secondary text / surface", T.textSecondary, T.surface, 4.5],
  ["muted text / bg", T.textMuted, T.bg, 4.5],
  ["primary / white", T.primary, T.white, 4.5],
  ["white / primary-hover", T.white, T.primaryHover, 4.5],
  ["secondary / white", T.secondary, T.white, 4.5],
  ["ink on marigold", T.text, T.accent, 4.5],
  ["success / success-bg-ish white", T.success, T.white, 4.5],
  ["warning / white", T.warning, T.white, 4.5],
  ["danger / white", T.danger, T.white, 4.5],
  ["info / white", T.info, T.white, 4.5],
  ["priority critical fg / white", T.prioCritical, T.white, 4.5],
  ["priority high fg / white", T.prioHigh, T.white, 4.5],
  ["priority medium fg / white", T.prioMedium, T.white, 4.5],
  ["priority low fg / white", T.prioLow, T.white, 4.5],
  ["control border / white (1.4.11)", T.borderStrong, T.white, 3.0],
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
