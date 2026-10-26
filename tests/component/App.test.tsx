import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { App } from '../../src/client/App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('<App /> routing & layout', () => {
  it('renders the home hero and event-type cards at /', () => {
    renderAt('/');
    expect(
      screen.getByRole('heading', { level: 1, name: /plan big\. stress zero\./i }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute('href', '#main');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
  });

  it('renders the style guide at /style-guide', async () => {
    renderAt('/style-guide');
    expect(await screen.findByRole('heading', { level: 1, name: /design system/i })).toBeVisible();
  });

  it('toggles the field error state on the style guide', async () => {
    const user = userEvent.setup();
    renderAt('/style-guide');
    await screen.findByRole('heading', { level: 1, name: /design system/i });
    expect(screen.queryByText(/under 300 characters/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /toggle error state/i }));
    expect(screen.getByText(/under 300 characters/i)).toBeInTheDocument();
  });

  it('opens the modal and shows a toast from the style guide', async () => {
    const user = userEvent.setup();
    renderAt('/style-guide');
    await screen.findByRole('button', { name: /open modal/i });
    await user.click(screen.getByRole('button', { name: /open modal/i }));
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /example dialog/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /show toast/i }));
    expect(screen.getByRole('status')).toHaveTextContent(/saved to your browser/i);
  });
});
