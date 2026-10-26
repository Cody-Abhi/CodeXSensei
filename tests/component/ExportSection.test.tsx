import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ExportSection } from '../../src/client/features/plan/ExportSection';
import { usePlanStore } from '../../src/client/store/planStore';
import { buildFallbackPlan } from '../../src/shared/templates';
import type { EventInput } from '../../src/shared/types';

const input: EventInput = {
  type: 'birthday',
  name: 'Test Party',
  date: '2099-06-15',
  city: 'Pune',
  guests: 20,
  budgetMinor: 2_500_000,
  currency: 'INR',
  vibes: [],
  dietary: [],
  notes: '',
};
const plan = buildFallbackPlan(input);

function renderExport() {
  usePlanStore.setState({ plan, status: 'success', lastInput: input });
  return render(
    <MemoryRouter>
      <ExportSection />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  usePlanStore.getState().reset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('<ExportSection />', () => {
  it('renders export buttons', () => {
    renderExport();
    expect(screen.getByRole('button', { name: /copy as markdown/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download json/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /print/i })).toBeInTheDocument();
  });

  it('copies markdown to clipboard on click', async () => {
    const user = userEvent.setup();
    const writeSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeSpy },
      writable: true,
      configurable: true,
    });
    renderExport();
    await user.click(screen.getByRole('button', { name: /copy as markdown/i }));
    expect(writeSpy).toHaveBeenCalled();
  });

  it('downloads JSON on click', async () => {
    const user = userEvent.setup();
    renderExport();
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockReturnValue(undefined);
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
    await user.click(screen.getByRole('button', { name: /download json/i }));
    expect(clickSpy).toHaveBeenCalled();
    revokeObjectURL.mockRestore();
  });

  it('calls window.print on print click', async () => {
    const user = userEvent.setup();
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    renderExport();
    await user.click(screen.getByRole('button', { name: /print/i }));
    expect(printSpy).toHaveBeenCalled();
  });

  it('renders null when plan is null', () => {
    usePlanStore.setState({ plan: null });
    const { container } = render(
      <MemoryRouter>
        <ExportSection />
      </MemoryRouter>,
    );
    expect(container.innerHTML).toBe('');
  });
});
