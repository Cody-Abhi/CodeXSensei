import { formatMinor } from '../../../shared/money';
import type { Currency, Plan } from '../../../shared/types';
import { Card } from '../../components/Card';

export interface PlanOverviewProps {
  plan: Plan;
  currency: Currency;
}

/** Human-readable vendor status. */
const STATUS_LABEL: Record<Plan['vendors'][number]['status'], string> = {
  to_find: 'To find',
  contacted: 'Contacted',
  booked: 'Booked',
};

/**
 * Read-only overview of a generated plan (Phase 5). Phase 6 replaces this with
 * interactive, editable budget / timeline / vendor views.
 *
 * @param props - The plan and its currency.
 * @returns The overview sections.
 */
export function PlanOverview({ plan, currency }: PlanOverviewProps): React.JSX.Element {
  return (
    <div className="pp-overview">
      <Card title="Summary" headerTone="yellow">
        <p>{plan.summary}</p>
      </Card>

      <Card title="Budget" headerTone="green">
        <ul className="pp-overview__list">
          {plan.budget.map((item) => (
            <li key={item.category}>
              <strong>{item.category}</strong> — {formatMinor(item.amountMinor, currency)}
              <span className="pp-overview__muted"> · {item.rationale}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Timeline" headerTone="blue">
        <ol className="pp-overview__list">
          {plan.timeline.map((item) => (
            <li key={item.id}>
              <strong>{item.dueDate}</strong> — {item.title}
              <span className="pp-overview__muted"> ({item.phase})</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card title="Vendors" headerTone="pink">
        <ul className="pp-overview__list">
          {plan.vendors.map((vendor) => (
            <li key={vendor.id}>
              <strong>{vendor.category}:</strong> {vendor.name} — {STATUS_LABEL[vendor.status]}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Ideas" headerTone="purple">
        <ul className="pp-overview__list">
          {plan.ideas.map((idea) => (
            <li key={idea.id}>
              <strong>{idea.title}</strong>
              <span className="pp-overview__muted"> — {idea.description}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
