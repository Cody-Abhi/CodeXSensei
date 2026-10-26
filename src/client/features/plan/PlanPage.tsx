import { Link, Navigate } from 'react-router-dom';

import { Badge } from '../../components/Badge';
import { Card } from '../../components/Card';
import type { Currency } from '../../../shared/types';
import { usePlanStore } from '../../store/planStore';
import { BudgetSection } from './BudgetSection';
import { ChatSection } from './ChatSection';
import { IdeasSection } from './IdeasSection';
import { TimelineSection } from './TimelineSection';
import { VendorSection } from './VendorSection';
import './PlanPage.css';

/** Loading skeletons shown while a plan is generated. */
function Skeletons(): React.JSX.Element {
  return (
    <div className="pp-skeletons">
      <p className="visually-hidden">Generating your plan…</p>
      {[0, 1, 2, 3].map((n) => (
        <div key={n} className="pp-skeleton" aria-hidden="true" />
      ))}
    </div>
  );
}

/**
 * Plan dashboard with interactive budget, timeline, and vendor sections
 * (PRD §F2–F5). Announces results via `aria-live` and shows skeletons with
 * `aria-busy` while loading.
 *
 * @returns The plan page.
 */
export function PlanPage(): React.JSX.Element {
  const status = usePlanStore((s) => s.status);
  const plan = usePlanStore((s) => s.plan);
  const error = usePlanStore((s) => s.error);
  const source = usePlanStore((s) => s.source);
  const lastInput = usePlanStore((s) => s.lastInput);

  if (status === 'idle' && !plan) {
    return <Navigate to="/plan/new" replace />;
  }

  const currency: Currency = lastInput?.currency ?? 'INR';

  return (
    <div className="pp-plan">
      <div className="pp-plan__head">
        <h1>Your plan</h1>
        <Link to="/plan/new" className="pp-plan__edit pp-btn pp-btn--outline">
          Start over
        </Link>
      </div>

      <div aria-live="polite" aria-busy={status === 'loading'}>
        {status === 'loading' && <Skeletons />}

        {status === 'error' && (
          <Card title="We hit a snag" headerTone="red">
            <p role="alert">{error}</p>
            <Link to="/plan/new" className="pp-btn tone-blue">
              Try again
            </Link>
          </Card>
        )}

        {status === 'success' && plan && (
          <div className="pp-plan__sections">
            <p className="pp-plan__source">
              <Badge tone={source === 'fallback' ? 'orange' : 'green'} icon="✨">
                {source === 'fallback' ? 'Smart template' : 'AI-generated'}
              </Badge>
            </p>
            <Card title="Summary" headerTone="yellow">
              <p>{plan.summary}</p>
            </Card>
            <BudgetSection
              budget={plan.budget}
              currency={currency}
              plannedBudgetMinor={lastInput?.budgetMinor ?? 0}
            />
            <TimelineSection timeline={plan.timeline} eventName={lastInput?.name ?? 'Event'} />
            <VendorSection
              vendors={plan.vendors}
              currency={currency}
              city={lastInput?.city ?? ''}
            />
            <IdeasSection ideas={plan.ideas} />
            <ChatSection />
          </div>
        )}
      </div>
    </div>
  );
}
