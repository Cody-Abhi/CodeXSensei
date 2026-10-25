import type { EventInput } from '../../shared/types';

/**
 * Strip control characters and collapse/trim whitespace, then cap the length.
 * Used to neutralise prompt-injection payloads hidden in control characters and
 * to bound the text that reaches the model (PRD §9).
 *
 * @param value - Raw text.
 * @param maxLength - Maximum length to keep.
 * @returns Sanitised text.
 */
export function sanitizeText(value: string, maxLength: number): string {
  // eslint-disable-next-line no-control-regex -- deliberately matching C0 controls + DEL
  const stripped = value.replace(/[\u0000-\u001f\u007f]+/g, ' ');
  return stripped.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

/**
 * Build a delimited, sanitised data block describing the event. The prompt
 * instructs the model to treat everything inside the delimiters as data, never
 * instructions, which blunts prompt-injection attempts (PRD §9/§13).
 *
 * @param input - Validated event input.
 * @returns A delimited data block string.
 */
export function buildDataBlock(input: EventInput): string {
  const vibes = input.vibes.map((v) => sanitizeText(v, 40)).filter(Boolean);
  const dietary = input.dietary.map((d) => sanitizeText(d, 60)).filter(Boolean);
  const lines = [
    `type: ${input.type}`,
    `name: ${sanitizeText(input.name, 120)}`,
    `city: ${sanitizeText(input.city, 120)}`,
    `date: ${input.date}`,
    `guests: ${input.guests}`,
    `currency: ${input.currency}`,
    `budget_minor_units: ${input.budgetMinor}`,
    `vibes: ${vibes.join(', ') || 'none'}`,
    `dietary: ${dietary.join(', ') || 'none'}`,
    `notes: ${sanitizeText(input.notes, 300) || 'none'}`,
  ];
  return ['<<<USER_DATA>>>', ...lines, '<<<END_USER_DATA>>>'].join('\n');
}
