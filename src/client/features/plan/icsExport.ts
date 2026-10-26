import { addDays, toISODate } from '../../../shared/dates';

interface ICSEvent {
  title: string;
  date: string;
  description?: string;
}

function escapeICS(text: string): string {
  return text.replace(/[\\;,\n]/g, (ch) => (ch === '\n' ? '\\n' : `\\${ch}`));
}

/**
 * Generate an ICS calendar string for a set of all-day events.
 *
 * @param events - Events to include.
 * @returns A valid ICS string.
 */
export function generateICS(events: ICSEvent[]): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PlanPop//EN', 'CALSCALE:GREGORIAN'];
  for (const ev of events) {
    const start = ev.date.replace(/-/g, '');
    const endDate = toISODate(addDays(new Date(ev.date), 1)).replace(/-/g, '');
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${endDate}`,
      `SUMMARY:${escapeICS(ev.title)}`,
    );
    if (ev.description) {
      lines.push(`DESCRIPTION:${escapeICS(ev.description)}`);
    }
    lines.push(`UID:${start}-${encodeURIComponent(ev.title)}@planpop`, 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Trigger a browser download of an ICS file.
 *
 * @param filename - Filename for the download.
 * @param content - ICS content string.
 */
export function downloadICS(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Build a Google Calendar "add event" link for an all-day event.
 *
 * @param title - Event title.
 * @param date - ISO date string (YYYY-MM-DD).
 * @returns A Google Calendar URL.
 */
export function gcalLink(title: string, date: string): string {
  const start = date.replace(/-/g, '');
  const end = toISODate(addDays(new Date(date), 1)).replace(/-/g, '');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}`;
}
