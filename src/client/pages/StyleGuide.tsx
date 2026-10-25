import { useState } from 'react';

import { Badge, Button, Card, Field, Modal, ProgressBar, Toast, type Tone } from '../components';
import './StyleGuide.css';

const TONES: Tone[] = ['yellow', 'pink', 'blue', 'green', 'orange', 'purple', 'red'];

/**
 * Living style guide rendering every design-system component. Serves as the
 * Phase 2 demo route exercised by axe (PRD §14).
 *
 * @returns The style-guide page.
 */
export function StyleGuide(): React.JSX.Element {
  const [modalOpen, setModalOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [withError, setWithError] = useState(false);

  return (
    <div className="pp-guide">
      <h1>Design system</h1>
      <p>Neobrutalism building blocks: thick borders, hard shadows, flat saturated colour.</p>

      <Card title="Buttons" headerTone="yellow">
        <h3>Solid tones</h3>
        <div className="pp-guide__row">
          {TONES.map((tone) => (
            <Button key={tone} tone={tone}>
              {tone}
            </Button>
          ))}
        </div>
        <h3>Variants &amp; sizes</h3>
        <div className="pp-guide__row">
          <Button variant="outline">Outline</Button>
          <Button size="lg" tone="pink">
            Large
          </Button>
          <Button disabled>Disabled</Button>
        </div>
      </Card>

      <Card title="Badges" headerTone="pink">
        <div className="pp-guide__row">
          <Badge tone="pink" icon="💍">
            Wedding
          </Badge>
          <Badge tone="yellow" icon="🎂">
            Birthday
          </Badge>
          <Badge tone="blue" icon="🎪">
            Community
          </Badge>
          <Badge tone="green" icon="✓">
            Booked
          </Badge>
          <Badge tone="red" icon="!">
            Overdue
          </Badge>
        </div>
      </Card>

      <Card title="Progress" headerTone="blue">
        <ProgressBar label="Vendors booked" value={3} max={8} tone="blue" />
        <ProgressBar label="Budget used" value={92} tone="orange" />
      </Card>

      <Card title="Form fields" headerTone="green">
        <Field
          id="demo-name"
          label="Event name"
          hint="This is only stored in your browser."
          required
        >
          {(control) => <input {...control} type="text" placeholder="e.g. Aisha & Rohan" />}
        </Field>
        <Field
          id="demo-notes"
          label="Notes"
          error={withError ? 'Please keep notes under 300 characters.' : undefined}
        >
          {(control) => <textarea {...control} rows={3} />}
        </Field>
        <Button tone="blue" onClick={() => setWithError((v) => !v)}>
          Toggle error state
        </Button>
      </Card>

      <Card title="Overlays" headerTone="purple">
        <div className="pp-guide__row">
          <Button tone="purple" onClick={() => setModalOpen(true)}>
            Open modal
          </Button>
          <Button tone="green" onClick={() => setToastOpen(true)}>
            Show toast
          </Button>
        </div>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Example dialog">
        <p>Focus is trapped here. Press Escape or the close button to dismiss.</p>
        <Button tone="yellow" onClick={() => setModalOpen(false)}>
          Got it
        </Button>
      </Modal>

      {toastOpen && (
        <Toast
          message="Saved to your browser."
          tone="green"
          onDismiss={() => setToastOpen(false)}
        />
      )}
    </div>
  );
}
