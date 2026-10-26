import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { PlanPage } from '../../src/client/features/plan/PlanPage';
import { usePlanStore } from '../../src/client/store/planStore';
import { buildFallbackPlan } from '../../src/shared/templates';
import type { EventInput } from '../../src/shared/types';

const input: EventInput = {
  type: 'wedding',
  name: 'Aisha & Rohan',
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

function renderPlan() {
  return render(
    <MemoryRouter initialEntries={['/plan']}>
      <Routes>
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/plan/new" element={<div>WIZARD</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  usePlanStore.getState().reset();
});

describe('<PlanPage />', () => {
  it('redirects to the wizard when idle with no plan', () => {
    renderPlan();
    expect(screen.getByText('WIZARD')).toBeInTheDocument();
  });

  it('shows a busy region while loading', () => {
    usePlanStore.setState({ status: 'loading' });
    const { container } = renderPlan();
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    expect(screen.getByText(/generating your plan/i)).toBeInTheDocument();
  });

  it('renders the plan overview on success', () => {
    usePlanStore.setState({ status: 'success', plan, source: 'fallback', lastInput: input });
    renderPlan();
    expect(screen.getByRole('heading', { level: 1, name: /your plan/i })).toBeInTheDocument();
    expect(screen.getByText(plan.summary)).toBeInTheDocument();
    expect(screen.getByText(/smart template/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Budget' })).toBeInTheDocument();
  });

  it('shows an error with a retry link', () => {
    usePlanStore.setState({ status: 'error', error: 'Too many requests' });
    renderPlan();
    expect(screen.getByRole('alert')).toHaveTextContent(/too many requests/i);
    expect(screen.getByRole('link', { name: /try again/i })).toBeInTheDocument();
  });
});
