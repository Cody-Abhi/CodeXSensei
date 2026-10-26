import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ChatSection } from '../../src/client/features/plan/ChatSection';
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

function renderChat() {
  usePlanStore.setState({ plan, status: 'success', lastInput: input });
  return render(
    <MemoryRouter>
      <ChatSection />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  usePlanStore.getState().reset();
});

describe('<ChatSection />', () => {
  it('renders empty state prompt', () => {
    renderChat();
    expect(screen.getByText(/ask me to change/i)).toBeInTheDocument();
  });

  it('renders the chat input and send button', () => {
    renderChat();
    expect(screen.getByRole('textbox', { name: /chat message/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('disables send when input is empty', () => {
    renderChat();
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
  });

  it('calls sendChat on form submit', async () => {
    const user = userEvent.setup();
    const sendSpy = vi.fn();
    usePlanStore.setState({ plan, status: 'success', lastInput: input, sendChat: sendSpy });
    render(
      <MemoryRouter>
        <ChatSection />
      </MemoryRouter>,
    );
    const textarea = screen.getByRole('textbox', { name: /chat message/i });
    await user.type(textarea, 'Add more vendors');
    await user.click(screen.getByRole('button', { name: /send/i }));
    expect(sendSpy).toHaveBeenCalledWith('Add more vendors');
  });

  it('shows chat messages', () => {
    usePlanStore.setState({
      plan,
      status: 'success',
      lastInput: input,
      chatMessages: [
        { role: 'user', text: 'Hello' },
        { role: 'assistant', text: 'Hi there!' },
      ],
    });
    render(
      <MemoryRouter>
        <ChatSection />
      </MemoryRouter>,
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('shows loading indicator', () => {
    usePlanStore.setState({
      plan,
      status: 'success',
      lastInput: input,
      chatLoading: true,
      chatMessages: [{ role: 'user', text: 'Hello' }],
    });
    render(
      <MemoryRouter>
        <ChatSection />
      </MemoryRouter>,
    );
    expect(screen.getByText(/thinking/i)).toBeInTheDocument();
  });

  it('shows patch accept/reject when pending', () => {
    usePlanStore.setState({
      plan,
      status: 'success',
      lastInput: input,
      chatMessages: [{ role: 'assistant', text: 'Updated.', patch: { summary: 'New summary' } }],
      pendingPatch: { summary: 'New summary' },
    });
    render(
      <MemoryRouter>
        <ChatSection />
      </MemoryRouter>,
    );
    expect(screen.getByText(/suggested changes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument();
  });

  it('calls acceptPatch on accept click', async () => {
    const user = userEvent.setup();
    const acceptSpy = vi.fn();
    usePlanStore.setState({
      plan,
      status: 'success',
      lastInput: input,
      pendingPatch: { summary: 'New summary' },
      acceptPatch: acceptSpy,
    });
    render(
      <MemoryRouter>
        <ChatSection />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: /accept/i }));
    expect(acceptSpy).toHaveBeenCalled();
  });

  it('calls rejectPatch on reject click', async () => {
    const user = userEvent.setup();
    const rejectSpy = vi.fn();
    usePlanStore.setState({
      plan,
      status: 'success',
      lastInput: input,
      pendingPatch: { summary: 'New summary' },
      rejectPatch: rejectSpy,
    });
    render(
      <MemoryRouter>
        <ChatSection />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: /reject/i }));
    expect(rejectSpy).toHaveBeenCalled();
  });
});
