import { Link, Navigate } from 'react-router-dom';

import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import type { Currency } from '../../../shared/types';
import { usePlanStore } from '../../store/planStore';
import { PlanOverview } from './PlanOverview';
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
 * Plan dashboard (Phase 5 overview; enriched with tabs in Phase 6). Announces
 * results via an `aria-live` region and shows skeletons with `aria-busy` while
 * loading (PRD §F2).
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
        <Link to="/plan/new" className="pp-plan__edit">
          <Button variant="outline">Start over</Button>
        </Link>
      </div>

      <div aria-live="polite" aria-busy={status === 'loading'}>
        {status === 'loading' && <Skeletons />}

        {status === 'error' && (
          <Card title="We hit a snag" headerTone="red">
            <p role="alert">{error}</p>
            <Link to="/plan/new">
              <Button tone="blue">Try again</Button>
            </Link>
          </Card>
        )}

        {status === 'success' && plan && (
          <>
            <p className="pp-plan__source">
              <Badge tone={source === 'fallback' ? 'orange' : 'green'} icon="✨">
                {source === 'fallback' ? 'Smart template' : 'AI-generated'}
              </Badge>
            </p>
            <PlanOverview plan={plan} currency={currency} />
          </>
        )}
      </div>
    </div>
  );
}
