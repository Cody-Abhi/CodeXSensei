import { daysUntil } from '../../../shared/dates';
import type { TimelineItem } from '../../../shared/types';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { usePlanStore } from '../../store/planStore';
import { downloadICS, gcalLink, generateICS } from './icsExport';
import './TimelineSection.css';

export interface TimelineSectionProps {
  timeline: TimelineItem[];
  eventName: string;
}

function statusIcon(item: TimelineItem): string {
  if (item.done) return '✓';
  if (daysUntil(item.dueDate) < 0) return '⚠';
  return '○';
}

function statusText(item: TimelineItem): string {
  if (item.done) return 'Done';
  const days = daysUntil(item.dueDate);
  if (days < 0) return `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`;
  if (days === 0) return 'Due today';
  return `${days} day${days === 1 ? '' : 's'} left`;
}

/**
 * Timeline milestone list with done toggles, overdue indicators, .ics export,
 * and Google Calendar links (PRD §F4).
 *
 * @param props - Timeline items and event name.
 * @returns The timeline section.
 */
export function TimelineSection({ timeline, eventName }: TimelineSectionProps): React.JSX.Element {
  const toggleDone = usePlanStore((s) => s.toggleMilestoneDone);

  function handleDownloadICS(): void {
    const events = timeline.map((m) => ({
      title: `${eventName}: ${m.title}`,
      date: m.dueDate,
      description: m.phase,
    }));
    const ics = generateICS(events);
    downloadICS(`${eventName.replace(/\s+/g, '-')}-timeline.ics`, ics);
  }

  const doneCount = timeline.filter((m) => m.done).length;

  return (
    <Card title="Timeline" headerTone="blue">
      <div className="pp-timeline">
        <div className="pp-timeline__actions">
          <Button type="button" variant="outline" onClick={handleDownloadICS}>
            Download .ics
          </Button>
          <span className="pp-timeline__progress">
            {doneCount}/{timeline.length} done
          </span>
        </div>
        <ol className="pp-timeline__list">
          {timeline.map((item) => {
            const overdue = !item.done && daysUntil(item.dueDate) < 0;
            return (
              <li
                key={item.id}
                className={`pp-timeline__item${item.done ? ' is-done' : ''}${overdue ? ' is-overdue' : ''}`}
              >
                <label className="pp-timeline__check">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleDone(item.id)}
                    aria-label={`Mark "${item.title}" as ${item.done ? 'not done' : 'done'}`}
                  />
                  <span className="pp-timeline__icon" aria-hidden="true">
                    {statusIcon(item)}
                  </span>
                </label>
                <div className="pp-timeline__body">
                  <strong className="pp-timeline__title">{item.title}</strong>
                  <span className="pp-timeline__meta">
                    {item.dueDate} &middot; {item.phase} &middot;{' '}
                    <span className={overdue ? 'pp-timeline__overdue' : ''}>
                      {statusText(item)}
                    </span>
                  </span>
                </div>
                <a
                  href={gcalLink(`${eventName}: ${item.title}`, item.dueDate)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pp-timeline__gcal"
                  title={`Add "${item.title}" to Google Calendar`}
                >
                  + GCal
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </Card>
  );
}
