import { Card } from '../../components/Card';
import { ProgressBar } from '../../components/ProgressBar';
import { daysUntil } from '../../../shared/dates';
import { formatMinor, percentOf, sumMinor } from '../../../shared/money';
import type { Currency } from '../../../shared/types';
import { usePlanStore } from '../../store/planStore';
import './Dashboard.css';

export function Dashboard(): React.JSX.Element | null {
  const plan = usePlanStore((s) => s.plan);
  const lastInput = usePlanStore((s) => s.lastInput);
  if (!plan || !lastInput) return null;

  const currency = lastInput.currency as Currency;

  // Countdown
  const daysLeft = daysUntil(lastInput.date);
  const countdownLabel =
    daysLeft > 0
      ? `${daysLeft} days to go`
      : daysLeft === 0
        ? 'Today!'
        : `${Math.abs(daysLeft)} days ago`;
  const countdownTone = daysLeft > 30 ? 'green' : daysLeft > 7 ? 'orange' : 'red';

  // Budget health
  const totalBudget = lastInput.budgetMinor;
  const spent = sumMinor(plan.budget.map((b) => b.amountMinor));
  const budgetPct = percentOf(spent, totalBudget);
  const budgetTone = budgetPct <= 100 ? 'green' : 'red';

  // Timeline progress
  const doneCount = plan.timeline.filter((t) => t.done).length;
  const totalMilestones = plan.timeline.length;
  const timelinePct = totalMilestones > 0 ? percentOf(doneCount, totalMilestones) : 0;

  // Vendor progress
  const bookedCount = plan.vendors.filter((v) => v.status === 'booked').length;
  const totalVendors = plan.vendors.length;
  const vendorPct = totalVendors > 0 ? percentOf(bookedCount, totalVendors) : 0;

  return (
    <Card title="Dashboard" headerTone="blue">
      <div className="pp-dashboard">
        <div className={`pp-dashboard__countdown tone-${countdownTone}`}>
          <span className="pp-dashboard__countdown-number" aria-label="Days until event">
            {Math.abs(daysLeft)}
          </span>
          <span className="pp-dashboard__countdown-label">{countdownLabel}</span>
        </div>

        <div className="pp-dashboard__stats">
          <div className="pp-dashboard__stat">
            <h3>Budget</h3>
            <ProgressBar value={Math.min(budgetPct, 100)} tone={budgetTone} label="Budget" />
            <p>
              {formatMinor(spent, currency)} of {formatMinor(totalBudget, currency)} ({budgetPct}%)
            </p>
          </div>

          <div className="pp-dashboard__stat">
            <h3>Timeline</h3>
            <ProgressBar value={timelinePct} tone="blue" label="Timeline" />
            <p>
              {doneCount} of {totalMilestones} milestones done ({timelinePct}%)
            </p>
          </div>

          <div className="pp-dashboard__stat">
            <h3>Vendors</h3>
            <ProgressBar value={vendorPct} tone="orange" label="Vendors" />
            <p>
              {bookedCount} of {totalVendors} booked ({vendorPct}%)
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
