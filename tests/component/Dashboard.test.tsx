import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { Dashboard } from '../../src/client/features/plan/Dashboard';
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

function renderDashboard() {
  usePlanStore.setState({ plan, status: 'success', lastInput: input });
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  usePlanStore.getState().reset();
});

describe('<Dashboard />', () => {
  it('renders the dashboard card', () => {
    renderDashboard();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('shows countdown days', () => {
    renderDashboard();
    expect(screen.getByText(/days to go/i)).toBeInTheDocument();
  });

  it('shows budget progress', () => {
    renderDashboard();
    expect(screen.getByRole('heading', { name: 'Budget' })).toBeInTheDocument();
  });

  it('shows timeline progress', () => {
    renderDashboard();
    expect(screen.getByRole('heading', { name: 'Timeline' })).toBeInTheDocument();
    expect(screen.getByText(/milestones done/i)).toBeInTheDocument();
  });

  it('shows vendor progress', () => {
    renderDashboard();
    expect(screen.getByRole('heading', { name: 'Vendors' })).toBeInTheDocument();
    expect(screen.getByText(/booked/i)).toBeInTheDocument();
  });

  it('shows "Today!" when event date is today', () => {
    const today = new Date().toISOString().slice(0, 10);
    const todayInput = { ...input, date: today };
    usePlanStore.setState({ plan, status: 'success', lastInput: todayInput });
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );
    expect(screen.getByText('Today!')).toBeInTheDocument();
  });

  it('shows "days ago" for past events', () => {
    const pastInput = { ...input, date: '2020-01-01' };
    usePlanStore.setState({ plan, status: 'success', lastInput: pastInput });
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );
    expect(screen.getByText(/days ago/i)).toBeInTheDocument();
  });

  it('shows orange countdown tone within 30 days', () => {
    const soon = new Date(Date.now() + 15 * 86_400_000).toISOString().slice(0, 10);
    const soonInput = { ...input, date: soon };
    usePlanStore.setState({ plan, status: 'success', lastInput: soonInput });
    const { container } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );
    expect(container.querySelector('.tone-orange')).toBeInTheDocument();
  });

  it('shows red countdown tone within 7 days', () => {
    const vSoon = new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10);
    const vSoonInput = { ...input, date: vSoon };
    usePlanStore.setState({ plan, status: 'success', lastInput: vSoonInput });
    const { container } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );
    expect(container.querySelector('.tone-red')).toBeInTheDocument();
  });

  it('shows red budget tone when over 100%', () => {
    const tinyBudgetInput = { ...input, budgetMinor: 100 };
    usePlanStore.setState({ plan, status: 'success', lastInput: tinyBudgetInput });
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );
    expect(screen.getByRole('progressbar', { name: 'Budget' })).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
  });

  it('renders null when plan is null', () => {
    usePlanStore.setState({ plan: null });
    const { container } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );
    expect(container.innerHTML).toBe('');
  });
});
