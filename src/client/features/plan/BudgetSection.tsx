import { useEffect, useRef, useState } from 'react';

import { formatMinor, isOverspent, sumMinor } from '../../../shared/money';
import type { BudgetItem, Currency } from '../../../shared/types';
import { Card } from '../../components/Card';
import { usePlanStore } from '../../store/planStore';
import { BudgetChart } from './BudgetChart';
import './BudgetSection.css';

export interface BudgetSectionProps {
  budget: BudgetItem[];
  currency: Currency;
  plannedBudgetMinor: number;
}

/**
 * Editable budget table with overspend warning and SVG bar chart (PRD §F3).
 *
 * @param props - Budget data and currency.
 * @returns The budget section.
 */
export function BudgetSection({
  budget,
  currency,
  plannedBudgetMinor,
}: BudgetSectionProps): React.JSX.Element {
  const updateBudgetItem = usePlanStore((s) => s.updateBudgetItem);
  const total = sumMinor(budget.map((b) => b.amountMinor));
  const over = isOverspent(total, plannedBudgetMinor);

  return (
    <Card title="Budget" headerTone="green">
      <div className="pp-budget">
        <BudgetChart budget={budget} currency={currency} />
        <div className="pp-budget__table-wrap">
          <table className="pp-budget__table">
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Amount</th>
                <th scope="col">Rationale</th>
              </tr>
            </thead>
            <tbody>
              {budget.map((item, index) => (
                <BudgetRow
                  key={item.category}
                  item={item}
                  index={index}
                  currency={currency}
                  onUpdate={updateBudgetItem}
                />
              ))}
            </tbody>
            <tfoot>
              <tr className={over ? 'pp-budget__overspend' : ''}>
                <th scope="row">Total</th>
                <td>
                  <strong>{formatMinor(total, currency)}</strong>
                </td>
                <td>
                  {over && (
                    <span role="alert" className="pp-budget__warn">
                      Over budget by {formatMinor(total - plannedBudgetMinor, currency)}
                    </span>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Card>
  );
}

function BudgetRow({
  item,
  index,
  currency,
  onUpdate,
}: {
  item: BudgetItem;
  index: number;
  currency: Currency;
  onUpdate: (index: number, amountMinor: number) => void;
}): React.JSX.Element {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  function startEdit(): void {
    setDraft(String(item.amountMinor / 100));
    setEditing(true);
  }

  function commit(): void {
    const parsed = Math.round(Number(draft) * 100);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      onUpdate(index, parsed);
    }
    setEditing(false);
  }

  return (
    <tr>
      <td>{item.category}</td>
      <td>
        {editing ? (
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            min={0}
            className="pp-budget__input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') setEditing(false);
            }}
            aria-label={`Amount for ${item.category}`}
          />
        ) : (
          <button
            type="button"
            className="pp-budget__amount"
            onClick={startEdit}
            aria-label={`Edit amount for ${item.category}, currently ${formatMinor(item.amountMinor, currency)}`}
          >
            {formatMinor(item.amountMinor, currency)}
          </button>
        )}
      </td>
      <td className="pp-budget__rationale">{item.rationale}</td>
    </tr>
  );
}
