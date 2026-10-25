import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from '../../src/client/App';

describe('<App />', () => {
  it('renders the brand heading and tagline', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'PlanPop' })).toBeInTheDocument();
    expect(screen.getByText(/stress zero/i)).toBeInTheDocument();
  });

  it('provides a skip-to-content link and main landmark', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /skip to content/i })).toHaveAttribute('href', '#main');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
  });
});
