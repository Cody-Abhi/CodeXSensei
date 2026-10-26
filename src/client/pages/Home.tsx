import { Link } from 'react-router-dom';

import { APP_TAGLINE } from '../../shared/version';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import './Home.css';

const EVENT_TYPES = [
  { tone: 'pink', icon: '💍', label: 'Weddings' },
  { tone: 'yellow', icon: '🎂', label: 'Birthdays' },
  { tone: 'blue', icon: '🎪', label: 'Community events' },
] as const;

/**
 * Landing placeholder for Phase 2. The full wizard-driven landing arrives in
 * Phase 5; this establishes the hero and event-type cards for the design system.
 *
 * @returns The home page.
 */
export function Home(): React.JSX.Element {
  return (
    <div className="pp-home">
      <h1 className="pp-home__headline">PLAN BIG. STRESS ZERO.</h1>
      <p className="pp-home__lede">
        {APP_TAGLINE} PlanPop turns a few details into a budget, timeline, vendor checklist and
        personalized ideas — in under a minute.
      </p>
      <ul className="pp-home__types">
        {EVENT_TYPES.map((t) => (
          <li key={t.label}>
            <Card headerTone={t.tone} title={t.label}>
              <Badge tone={t.tone} icon={t.icon}>
                {t.label}
              </Badge>
              <p>Type-specific prompts, templates, budgets and timelines.</p>
            </Card>
          </li>
        ))}
      </ul>
      <p className="pp-home__cta">
        <Link to="/plan/new" className="pp-btn pp-btn--solid pp-btn--lg tone-green">
          Start planning →
        </Link>
      </p>
      <p>
        Explore the building blocks in the <Link to="/style-guide">style guide</Link>.
      </p>
    </div>
  );
}
