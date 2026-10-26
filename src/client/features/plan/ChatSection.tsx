import { useRef, useState } from 'react';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { usePlanStore } from '../../store/planStore';
import './ChatSection.css';

export function ChatSection(): React.JSX.Element {
  const chatMessages = usePlanStore((s) => s.chatMessages);
  const chatLoading = usePlanStore((s) => s.chatLoading);
  const pendingPatch = usePlanStore((s) => s.pendingPatch);
  const sendChat = usePlanStore((s) => s.sendChat);
  const acceptPatch = usePlanStore((s) => s.acceptPatch);
  const rejectPatch = usePlanStore((s) => s.rejectPatch);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || chatLoading) return;
    setInput('');
    sendChat(trimmed);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  const patchSections = pendingPatch
    ? Object.keys(pendingPatch).filter(
        (k) => pendingPatch[k as keyof typeof pendingPatch] !== undefined,
      )
    : [];

  return (
    <Card title="Chat with your plan" headerTone="orange">
      <div className="pp-chat">
        <div className="pp-chat__messages" role="log" aria-label="Chat messages">
          {chatMessages.length === 0 && (
            <p className="pp-chat__empty">
              Ask me to change your budget, add vendors, adjust the timeline, or brainstorm ideas.
            </p>
          )}
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`pp-chat__msg pp-chat__msg--${msg.role}`}
              aria-label={msg.role === 'user' ? 'You' : 'Assistant'}
            >
              <span className="pp-chat__role">{msg.role === 'user' ? 'You' : 'PlanPop'}</span>
              <p className="pp-chat__text">{msg.text}</p>
            </div>
          ))}
          {chatLoading && (
            <div className="pp-chat__msg pp-chat__msg--assistant" aria-label="Assistant">
              <span className="pp-chat__role">PlanPop</span>
              <p className="pp-chat__text pp-chat__typing">Thinking&hellip;</p>
            </div>
          )}
        </div>

        {pendingPatch && patchSections.length > 0 && (
          <div className="pp-chat__patch" role="alert">
            <p className="pp-chat__patch-label">
              Suggested changes to: <strong>{patchSections.join(', ')}</strong>
            </p>
            <div className="pp-chat__patch-actions">
              <Button type="button" variant="solid" onClick={acceptPatch}>
                Accept changes
              </Button>
              <Button type="button" variant="outline" onClick={rejectPatch}>
                Reject
              </Button>
            </div>
          </div>
        )}

        <form className="pp-chat__form" onSubmit={handleSubmit}>
          <textarea
            ref={inputRef}
            className="pp-chat__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your plan..."
            aria-label="Chat message"
            rows={2}
            maxLength={500}
            disabled={chatLoading}
          />
          <Button type="submit" variant="solid" disabled={chatLoading || !input.trim()}>
            Send
          </Button>
        </form>
      </div>
    </Card>
  );
}
