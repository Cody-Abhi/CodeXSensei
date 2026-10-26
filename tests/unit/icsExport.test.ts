import { describe, expect, it, vi } from 'vitest';

import { downloadICS, gcalLink, generateICS } from '../../src/client/features/plan/icsExport';

describe('generateICS', () => {
  it('produces a valid VCALENDAR with VEVENT entries', () => {
    const ics = generateICS([
      { title: 'Venue booking', date: '2099-03-01', description: 'Planning' },
    ]);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('DTSTART;VALUE=DATE:20990301');
    expect(ics).toContain('DTEND;VALUE=DATE:20990302');
    expect(ics).toContain('SUMMARY:Venue booking');
    expect(ics).toContain('DESCRIPTION:Planning');
  });

  it('handles multiple events', () => {
    const ics = generateICS([
      { title: 'A', date: '2099-01-01' },
      { title: 'B', date: '2099-01-02' },
    ]);
    const eventCount = (ics.match(/BEGIN:VEVENT/g) ?? []).length;
    expect(eventCount).toBe(2);
  });

  it('escapes special ICS characters', () => {
    const ics = generateICS([{ title: 'Hello; world, test\\more', date: '2099-01-01' }]);
    expect(ics).toContain('SUMMARY:Hello\\; world\\, test\\\\more');
  });

  it('escapes newlines in descriptions', () => {
    const ics = generateICS([{ title: 'Test', date: '2099-01-01', description: 'line1\nline2' }]);
    expect(ics).toContain('DESCRIPTION:line1\\nline2');
  });

  it('uses CRLF line endings', () => {
    const ics = generateICS([{ title: 'Test', date: '2099-01-01' }]);
    expect(ics).toContain('\r\n');
    expect(ics).not.toMatch(/(?<!\r)\n/);
  });
});

describe('gcalLink', () => {
  it('returns a Google Calendar URL with title and dates', () => {
    const url = gcalLink('My Event', '2099-06-15');
    expect(url).toBe(
      'https://calendar.google.com/calendar/render?action=TEMPLATE&text=My%20Event&dates=20990615/20990616',
    );
  });

  it('encodes special characters in the title', () => {
    const url = gcalLink('Aisha & Rohan', '2099-01-01');
    expect(url).toContain('text=Aisha%20%26%20Rohan');
  });
});

describe('downloadICS', () => {
  it('creates and clicks an anchor element to download', () => {
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockReturnValue(undefined);
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    const clickSpy = vi.fn();
    const removeSpy = vi.fn();
    vi.spyOn(document, 'createElement').mockReturnValue({
      set href(_v: string) {},
      set download(_v: string) {},
      click: clickSpy,
      remove: removeSpy,
    } as unknown as HTMLAnchorElement);
    vi.spyOn(document.body, 'appendChild').mockReturnValue(null as unknown as Node);

    downloadICS('test.ics', 'BEGIN:VCALENDAR\r\nEND:VCALENDAR');

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(removeSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });
});
