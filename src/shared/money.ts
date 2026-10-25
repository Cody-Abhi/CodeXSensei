/**
 * Integer-only money utilities. All amounts are in minor units (paise/cents)
 * to avoid floating-point error; conversion to a display string happens only
 * at the edges.
 */

/** Supported ISO currency codes (2-decimal minor units). */
export type Currency = 'INR' | 'USD' | 'EUR';

const LOCALES: Record<Currency, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'en-IE',
};

/**
 * Convert a major-unit amount to integer minor units.
 *
 * @param major - Amount in major units (e.g. rupees).
 * @returns Integer minor units.
 */
export function toMinor(major: number): number {
  return Math.round(major * 100);
}

/**
 * Sum a list of minor-unit amounts.
 *
 * @param values - Minor-unit amounts.
 * @returns The integer sum.
 */
export function sumMinor(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * Percentage of `whole` represented by `part`, rounded to an integer. Returns
 * 0 when `whole` is not positive.
 *
 * @param part - The partial amount.
 * @param whole - The total amount.
 * @returns Integer percentage (0–∞).
 */
export function percentOf(part: number, whole: number): number {
  if (whole <= 0) {
    return 0;
  }
  return Math.round((part / whole) * 100);
}

/**
 * Whether actual spend exceeds the planned amount.
 *
 * @param actualMinor - Actual spend in minor units.
 * @param plannedMinor - Planned amount in minor units.
 * @returns True when overspent.
 */
export function isOverspent(actualMinor: number, plannedMinor: number): boolean {
  return actualMinor > plannedMinor;
}

/**
 * Re-normalise a set of amounts so they sum to `totalMinor` exactly, using
 * integer minor units. Amounts are scaled proportionally; any rounding
 * remainder is assigned to the largest original categories first. When the
 * input sums to zero, the total is distributed as evenly as possible.
 *
 * @param amounts - Original minor-unit amounts (weights).
 * @param totalMinor - The exact total the result must sum to.
 * @returns New amounts summing exactly to `totalMinor`.
 */
export function normaliseBudget(amounts: number[], totalMinor: number): number[] {
  const count = amounts.length;
  if (count === 0) {
    return [];
  }
  const safeTotal = Math.max(0, Math.trunc(totalMinor));
  const current = sumMinor(amounts);

  // Floor each share; even split when there are no positive weights.
  const base =
    current <= 0
      ? Array.from({ length: count }, () => Math.floor(safeTotal / count))
      : amounts.map((amount) => Math.floor((amount / current) * safeTotal));

  // Assign the leftover minor units to the largest original weights first.
  const remainder = safeTotal - sumMinor(base);
  const bumpIndices = new Set(
    amounts
      .map((amount, index) => ({ amount, index }))
      .sort((a, b) => b.amount - a.amount || a.index - b.index)
      .slice(0, remainder)
      .map((entry) => entry.index),
  );

  return base.map((value, index) => value + (bumpIndices.has(index) ? 1 : 0));
}

/**
 * Format a minor-unit amount as a localized currency string.
 *
 * @param minor - Amount in minor units.
 * @param currency - ISO currency code.
 * @param fractionDigits - Decimal places to show (default 0 for whole amounts).
 * @returns A localized currency string.
 */
export function formatMinor(minor: number, currency: Currency, fractionDigits = 0): string {
  const major = minor / 100;
  return new Intl.NumberFormat(LOCALES[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(major);
}
