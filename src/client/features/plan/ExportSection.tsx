import { useState } from 'react';

import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import type { Currency } from '../../../shared/types';
import { usePlanStore } from '../../store/planStore';
import { copyToClipboard, downloadJSON, planToMarkdown } from './exportPlan';

export function ExportSection(): React.JSX.Element | null {
  const plan = usePlanStore((s) => s.plan);
  const lastInput = usePlanStore((s) => s.lastInput);
  const [copied, setCopied] = useState(false);

  if (!plan || !lastInput) return null;

  const currency = lastInput.currency as Currency;
  const eventName = lastInput.name;

  function handleCopyMarkdown(): void {
    if (!plan || !lastInput) return;
    const md = planToMarkdown(plan, eventName, currency);
    copyToClipboard(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownloadJSON(): void {
    if (!plan) return;
    const safeName = eventName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    downloadJSON(plan, `${safeName}-plan.json`);
  }

  function handlePrint(): void {
    window.print();
  }

  return (
    <Card title="Export" headerTone="green">
      <div className="pp-export">
        <Button type="button" variant="outline" onClick={handleCopyMarkdown}>
          {copied ? 'Copied!' : 'Copy as Markdown'}
        </Button>
        <Button type="button" variant="outline" onClick={handleDownloadJSON}>
          Download JSON
        </Button>
        <Button type="button" variant="outline" onClick={handlePrint}>
          Print
        </Button>
      </div>
    </Card>
  );
}
