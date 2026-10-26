import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { BudgetSection } from '../../src/client/features/plan/BudgetSection';
import { usePlanStore } from '../../src/client/store/planStore';
import { buildFallbackPlan } from '../../src/shared/templates';
import type { Currency, EventInput } from '../../src/shared/types';

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

function BudgetWrapper({ plannedBudgetMinor }: { plannedBudgetMinor: number }) {
  const storePlan = usePlanStore((s) => s.plan);
  const lastInput = usePlanStore((s) => s.lastInput);
  if (!storePlan || !lastInput) return null;
  return (
    <BudgetSection
      budget={storePlan.budget}
      currency={lastInput.currency as Currency}
      plannedBudgetMinor={plannedBudgetMinor}
    />
  );
}

function renderBudget(plannedBudgetMinor = 150_000_000) {
  usePlanStore.setState({ plan, status: 'success', lastInput: input });
  return render(
    <MemoryRouter>
      <BudgetWrapper plannedBudgetMinor={plannedBudgetMinor} />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  usePlanStore.getState().reset();
});

describe('<BudgetSection />', () => {
  it('renders all budget categories in the table', () => {
    renderBudget();
    const table = screen.getByRole('table', { name: /budget breakdown/i });
    for (const item of plan.budget) {
      expect(within(table).getByText(item.category)).toBeInTheDocument();
    }
  });

  it('shows the total row', () => {
    renderBudget();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('shows an overspend warning when total exceeds planned budget', () => {
    renderBudget(1);
    expect(screen.getByRole('alert')).toHaveTextContent(/over budget/i);
  });

  it('does not show overspend when within budget', () => {
    renderBudget();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('opens an inline editor on click and commits on Enter', async () => {
    const user = userEvent.setup();
    renderBudget();
    const firstCat = plan.budget[0]!.category;
    const editBtn = screen.getByRole('button', {
      name: new RegExp(`Edit amount for ${firstCat}`),
    });
    await user.click(editBtn);
    const inputEl = screen.getByRole('spinbutton', {
      name: new RegExp(`Amount for ${firstCat}`),
    });
    expect(inputEl).toBeInTheDocument();
    await user.clear(inputEl);
    await user.type(inputEl, '5000');
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('provides an accessible data table for the chart', () => {
    renderBudget();
    expect(screen.getByText('Budget breakdown')).toBeInTheDocument();
  });
});
