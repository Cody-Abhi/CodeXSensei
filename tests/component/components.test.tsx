import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Badge } from '../../src/client/components/Badge';
import { Button } from '../../src/client/components/Button';
import { Card } from '../../src/client/components/Card';
import { Field } from '../../src/client/components/Field';
import { Modal } from '../../src/client/components/Modal';
import { ProgressBar } from '../../src/client/components/ProgressBar';
import { SkipLink } from '../../src/client/components/SkipLink';
import { ThemeToggle } from '../../src/client/components/ThemeToggle';
import { Toast } from '../../src/client/components/Toast';
import { useTheme } from '../../src/client/store/theme';

describe('<Button />', () => {
  it('renders tone/variant/size classes and handles clicks', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button tone="pink" variant="outline" size="lg" onClick={onClick}>
        Go
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Go' });
    expect(btn).toHaveClass('pp-btn', 'pp-btn--outline', 'pp-btn--lg', 'tone-pink');
    expect(btn).toHaveAttribute('type', 'button');
    await user.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Nope
      </Button>,
    );
    await user.click(screen.getByRole('button', { name: 'Nope' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('<Card />', () => {
  it('renders a titled header strip and body', () => {
    render(
      <Card title="Budget" headerTone="blue">
        <p>contents</p>
      </Card>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Budget' })).toBeInTheDocument();
    expect(screen.getByText('contents')).toBeInTheDocument();
  });

  it('renders without a header when no title', () => {
    render(<Card>body only</Card>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText('body only')).toBeInTheDocument();
  });
});

describe('<Badge />', () => {
  it('renders text with a decorative icon', () => {
    render(
      <Badge tone="green" icon="✓">
        Booked
      </Badge>,
    );
    const badge = screen.getByText('Booked');
    expect(badge).toHaveClass('pp-badge', 'tone-green');
    expect(badge.querySelector('[aria-hidden="true"]')).toHaveTextContent('✓');
  });
});

describe('<Field />', () => {
  it('associates label and shows a hint', () => {
    render(
      <Field id="nm" label="Name" hint="helper">
        {(c) => <input {...c} />}
      </Field>,
    );
    const input = screen.getByLabelText('Name');
    expect(input).toHaveAttribute('aria-describedby', 'nm-hint');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.getByText('helper')).toHaveAttribute('id', 'nm-hint');
  });

  it('wires error state and required', () => {
    render(
      <Field id="nm" label="Name" hint="helper" error="Required" required>
        {(c) => <input {...c} />}
      </Field>,
    );
    const input = screen.getByLabelText(/Name/);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'nm-error');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(screen.getByText('Required')).toBeInTheDocument();
    // hint is hidden while an error is shown
    expect(screen.queryByText('helper')).not.toBeInTheDocument();
  });
});

describe('<ProgressBar />', () => {
  it('exposes progressbar semantics and a percentage', () => {
    render(<ProgressBar label="Vendors" value={3} max={8} />);
    const bar = screen.getByRole('progressbar', { name: 'Vendors' });
    expect(bar).toHaveAttribute('aria-valuenow', '3');
    expect(bar).toHaveAttribute('aria-valuemax', '8');
    expect(screen.getByText('38%')).toBeInTheDocument();
  });

  it('clamps out-of-range values and guards a non-positive max', () => {
    const { rerender } = render(<ProgressBar label="x" value={999} max={100} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
    rerender(<ProgressBar label="x" value={-5} max={100} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
    rerender(<ProgressBar label="x" value={50} max={0} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });
});

describe('<Modal />', () => {
  it('shows an accessible dialog and closes via the button', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Example dialog">
        <p>body</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog', { name: 'Example dialog' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /close dialog/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('closes via the native close event when reopened then closed', () => {
    const onClose = vi.fn();
    const { rerender } = render(<Modal open onClose={onClose} title="T" />);
    rerender(<Modal open={false} onClose={onClose} title="T" />);
    expect(onClose).toHaveBeenCalled();
  });
});

describe('<Toast />', () => {
  it('is a polite status region and dismisses', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<Toast message="Saved" onDismiss={onDismiss} />);
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
    await user.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('renders without a dismiss button when no handler', () => {
    render(<Toast message="Info" />);
    expect(screen.getByRole('status')).toHaveTextContent('Info');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('<SkipLink />', () => {
  it('links to a custom target', () => {
    render(<SkipLink targetId="content">Jump</SkipLink>);
    expect(screen.getByRole('link', { name: 'Jump' })).toHaveAttribute('href', '#content');
  });
});

describe('<ThemeToggle />', () => {
  beforeEach(() => {
    useTheme.getState().setTheme('light');
  });

  it('reflects and toggles the theme', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(btn).toHaveTextContent('Light');

    await user.click(btn);
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(btn).toHaveTextContent('Dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
