import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildFallbackPlan } from '../../src/shared/templates';
import type { EventInput } from '../../src/shared/types';

vi.mock('../../src/client/api/client', () => ({ postPlan: vi.fn() }));

import { postPlan } from '../../src/client/api/client';
import { Wizard } from '../../src/client/features/wizard/Wizard';
import { usePlanStore } from '../../src/client/store/planStore';

const sampleInput: EventInput = {
  type: 'wedding',
  name: 'x',
  date: '2099-02-14',
  city: 'x',
  guests: 1,
  budgetMinor: 100,
  currency: 'INR',
  vibes: [],
  dietary: [],
  notes: '',
};

function renderWizard() {
  return render(
    <MemoryRouter initialEntries={['/plan/new']}>
      <Routes>
        <Route path="/plan/new" element={<Wizard />} />
        <Route path="/plan" element={<div>PLAN PAGE</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  usePlanStore.getState().reset();
  vi.mocked(postPlan).mockResolvedValue({
    plan: buildFallbackPlan(sampleInput),
    source: 'fallback',
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('<Wizard />', () => {
  it('blocks step 1 without an event type and shows an error summary', async () => {
    const user = userEvent.setup();
    renderWizard();
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/choose an event type/i);
    // still on step 1
    expect(screen.getByRole('group', { name: /choose your event type/i })).toBeInTheDocument();
  });

  it('advances through the steps and generates a plan on submit', async () => {
    const user = userEvent.setup();
    renderWizard();

    await user.click(screen.getByRole('radio', { name: /wedding/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));

    fireEvent.change(screen.getByLabelText(/event name/i), { target: { value: 'Aisha & Rohan' } });
    fireEvent.change(screen.getByLabelText(/event date/i), { target: { value: '2099-02-14' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Jaipur' } });
    fireEvent.change(screen.getByLabelText(/guest count/i), { target: { value: '300' } });
    fireEvent.change(screen.getByLabelText(/total budget/i), { target: { value: '1500000' } });
    await user.click(screen.getByRole('button', { name: /next/i }));

    await user.click(screen.getByRole('button', { name: /generate my plan/i }));

    expect(screen.getByText('PLAN PAGE')).toBeInTheDocument();
    expect(postPlan).toHaveBeenCalledOnce();
    const callArg = vi.mocked(postPlan).mock.calls[0]?.[0];
    expect(callArg?.budgetMinor).toBe(150_000_000);
    expect(callArg?.type).toBe('wedding');
  });

  it('toggles vibe tags and caps the selection at six', async () => {
    const user = userEvent.setup();
    renderWizard();
    await user.click(screen.getByRole('radio', { name: /birthday/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));
    fireEvent.change(screen.getByLabelText(/event name/i), { target: { value: 'Party' } });
    fireEvent.change(screen.getByLabelText(/event date/i), { target: { value: '2099-02-14' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Pune' } });
    fireEvent.change(screen.getByLabelText(/guest count/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/total budget/i), { target: { value: '25000' } });
    await user.click(screen.getByRole('button', { name: /next/i }));

    const traditional = screen.getByRole('button', { name: /traditional/i, pressed: false });
    await user.click(traditional);
    expect(screen.getByRole('button', { name: /traditional/i, pressed: true })).toBeInTheDocument();
    // toggling again deselects
    await user.click(screen.getByRole('button', { name: /traditional/i, pressed: true }));
    expect(
      screen.getByRole('button', { name: /traditional/i, pressed: false }),
    ).toBeInTheDocument();

    // dietary toggle and notes update
    await user.click(screen.getByRole('button', { name: /vegetarian/i }));
    expect(screen.getByRole('button', { name: /vegetarian/i, pressed: true })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/cultural or religious notes/i), {
      target: { value: 'Mehendi night' },
    });
    expect(screen.getByLabelText(/cultural or religious notes/i)).toHaveValue('Mehendi night');
  });

  it('can navigate back to a previous step', async () => {
    const user = userEvent.setup();
    renderWizard();
    await user.click(screen.getByRole('radio', { name: /community/i }));
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByLabelText(/event name/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByRole('group', { name: /choose your event type/i })).toBeInTheDocument();
  });
});
