import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { IdeasSection } from '../../src/client/features/plan/IdeasSection';
import { usePlanStore } from '../../src/client/store/planStore';
import { buildFallbackPlan } from '../../src/shared/templates';
import type { EventInput, Idea, Plan } from '../../src/shared/types';

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

function IdeasWrapper({ ideas }: { ideas?: Idea[] }) {
  const storePlan = usePlanStore((s) => s.plan);
  if (!storePlan) return null;
  return <IdeasSection ideas={ideas ?? storePlan.ideas} />;
}

function renderIdeas(ideas?: Idea[]) {
  const effectivePlan: Plan = ideas ? { ...plan, ideas } : plan;
  usePlanStore.setState({ plan: effectivePlan, status: 'success', lastInput: input });
  return render(
    <MemoryRouter>
      <IdeasWrapper ideas={ideas} />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  usePlanStore.getState().reset();
});

describe('<IdeasSection />', () => {
  it('renders all ideas', () => {
    renderIdeas();
    for (const idea of plan.ideas) {
      expect(screen.getByText(idea.title)).toBeInTheDocument();
    }
  });

  it('groups ideas by category', () => {
    const categories = [...new Set(plan.ideas.map((i) => i.category))];
    renderIdeas();
    for (const cat of categories) {
      expect(screen.getByText(cat)).toBeInTheDocument();
    }
  });

  it('shows a regenerate button per category', () => {
    const categories = [...new Set(plan.ideas.map((i) => i.category))];
    renderIdeas();
    const buttons = screen.getAllByRole('button', { name: /regenerate/i });
    expect(buttons).toHaveLength(categories.length);
  });

  it('calls regenerateIdeas on regenerate click', async () => {
    const user = userEvent.setup();
    const regenerateSpy = vi.fn();
    usePlanStore.setState({ plan, status: 'success', lastInput: input });
    usePlanStore.setState({ regenerateIdeas: regenerateSpy });
    render(
      <MemoryRouter>
        <IdeasWrapper />
      </MemoryRouter>,
    );
    const buttons = screen.getAllByRole('button', { name: /regenerate/i });
    await user.click(buttons[0]!);
    expect(regenerateSpy).toHaveBeenCalled();
  });

  it('shows Loading text when ideasLoading is true', () => {
    usePlanStore.setState({ plan, status: 'success', lastInput: input, ideasLoading: true });
    render(
      <MemoryRouter>
        <IdeasWrapper />
      </MemoryRouter>,
    );
    const buttons = screen.getAllByRole('button', { name: /regenerate/i });
    expect(buttons[0]).toHaveTextContent(/loading/i);
    expect(buttons[0]).toBeDisabled();
  });
});
