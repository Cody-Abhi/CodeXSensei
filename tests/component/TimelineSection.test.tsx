import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TimelineSection } from '../../src/client/features/plan/TimelineSection';
import { usePlanStore } from '../../src/client/store/planStore';
import { buildFallbackPlan } from '../../src/shared/templates';
import type { EventInput, Plan, TimelineItem } from '../../src/shared/types';

const input: EventInput = {
  type: 'wedding',
  name: 'Test Wedding',
  date: '2099-02-14',
  city: 'Jaipur',
  guests: 300,
  budgetMinor: 150_000_000,
  currency: 'INR',
  vibes: [],
  dietary: [],
  notes: '',
};
const plan = buildFallbackPlan(input);

function TimelineWrapper({ timeline }: { timeline?: TimelineItem[] }) {
  const storePlan = usePlanStore((s) => s.plan);
  if (!storePlan) return null;
  return <TimelineSection timeline={timeline ?? storePlan.timeline} eventName="Test Wedding" />;
}

function renderTimeline(timeline?: TimelineItem[]) {
  const effectivePlan: Plan = timeline ? { ...plan, timeline } : plan;
  usePlanStore.setState({ plan: effectivePlan, status: 'success', lastInput: input });
  return render(
    <MemoryRouter>
      <TimelineWrapper timeline={timeline} />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  usePlanStore.getState().reset();
});

describe('<TimelineSection />', () => {
  it('renders all milestones', () => {
    renderTimeline();
    for (const item of plan.timeline) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    }
  });

  it('shows a done count', () => {
    renderTimeline();
    expect(screen.getByText(`0/${plan.timeline.length} done`)).toBeInTheDocument();
  });

  it('toggles a milestone done on checkbox click', async () => {
    const user = userEvent.setup();
    renderTimeline();
    const firstTitle = plan.timeline[0]!.title;
    const checkbox = screen.getByRole('checkbox', {
      name: new RegExp(`Mark "${firstTitle}" as done`),
    });
    await user.click(checkbox);
    const updated = usePlanStore.getState().plan?.timeline[0];
    expect(updated?.done).toBe(true);
  });

  it('marks overdue items when due date is past', () => {
    const overdueTimeline: TimelineItem[] = [
      {
        id: 'past-1',
        title: 'Overdue task',
        dueDate: '2020-01-01',
        phase: 'Planning',
        done: false,
      },
    ];
    renderTimeline(overdueTimeline);
    expect(screen.getAllByText(/overdue/i).length).toBeGreaterThan(0);
  });

  it('shows GCal links for each milestone', () => {
    renderTimeline();
    const gcalLinks = screen.getAllByRole('link', { name: /gcal/i });
    expect(gcalLinks).toHaveLength(plan.timeline.length);
    for (const link of gcalLinks) {
      expect(link).toHaveAttribute('href', expect.stringContaining('calendar.google.com'));
    }
  });

  it('has a download .ics button', () => {
    renderTimeline();
    expect(screen.getByRole('button', { name: /download \.ics/i })).toBeInTheDocument();
  });

  it('triggers ICS download on button click', async () => {
    const user = userEvent.setup();
    renderTimeline();
    const revokeURL = vi.spyOn(URL, 'revokeObjectURL').mockReturnValue(undefined);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    const clickSpy = vi.fn();
    const removeSpy = vi.fn();
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return {
          set href(_v: string) {},
          set download(_v: string) {},
          click: clickSpy,
          remove: removeSpy,
        } as unknown as HTMLAnchorElement;
      }
      return origCreateElement(tag);
    });
    vi.spyOn(document.body, 'appendChild').mockReturnValue(null as unknown as Node);
    await user.click(screen.getByRole('button', { name: /download \.ics/i }));
    expect(clickSpy).toHaveBeenCalled();
    revokeURL.mockRestore();
  });
});
