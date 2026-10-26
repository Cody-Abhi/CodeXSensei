import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { VendorSection } from '../../src/client/features/plan/VendorSection';
import { usePlanStore } from '../../src/client/store/planStore';
import { buildFallbackPlan } from '../../src/shared/templates';
import type { EventInput } from '../../src/shared/types';

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

function VendorWrapper() {
  const storePlan = usePlanStore((s) => s.plan);
  if (!storePlan) return null;
  return <VendorSection vendors={storePlan.vendors} currency="INR" city="Jaipur" />;
}

function renderVendors() {
  usePlanStore.setState({ plan, status: 'success', lastInput: input });
  return render(
    <MemoryRouter>
      <VendorWrapper />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  usePlanStore.getState().reset();
});

describe('<VendorSection />', () => {
  it('renders all vendors', () => {
    renderVendors();
    for (const vendor of plan.vendors) {
      expect(screen.getByText(vendor.name)).toBeInTheDocument();
    }
  });

  it('shows a progress bar', () => {
    renderVendors();
    expect(screen.getByRole('progressbar', { name: /vendors booked/i })).toBeInTheDocument();
  });

  it('cycles vendor status on click', async () => {
    const user = userEvent.setup();
    renderVendors();
    const firstVendor = plan.vendors[0]!;
    const statusBtn = screen.getByRole('button', {
      name: new RegExp(`${firstVendor.name}:.*Click to change status`),
    });
    expect(statusBtn).toHaveTextContent(/to find/i);
    await user.click(statusBtn);
    expect(statusBtn).toHaveTextContent(/contacted/i);
    await user.click(statusBtn);
    expect(statusBtn).toHaveTextContent(/booked/i);
  });

  it('shows Google Maps links for each vendor', () => {
    renderVendors();
    const mapsLinks = screen.getAllByRole('link', { name: /google maps/i });
    expect(mapsLinks.length).toBeGreaterThan(0);
    for (const link of mapsLinks) {
      expect(link).toHaveAttribute('href', expect.stringContaining('google.com/maps'));
    }
  });

  it('groups vendors by category', () => {
    renderVendors();
    const categories = [...new Set(plan.vendors.map((v) => v.category))];
    for (const cat of categories) {
      expect(screen.getByRole('heading', { level: 3, name: cat })).toBeInTheDocument();
    }
  });
});
