import type { Idea } from '../../../shared/types';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { usePlanStore } from '../../store/planStore';
import './IdeasSection.css';

export interface IdeasSectionProps {
  ideas: Idea[];
}

export function IdeasSection({ ideas }: IdeasSectionProps): React.JSX.Element {
  const regenerateIdeas = usePlanStore((s) => s.regenerateIdeas);
  const ideasLoading = usePlanStore((s) => s.ideasLoading);
  const categories = [...new Set(ideas.map((i) => i.category))];

  return (
    <Card title="Ideas" headerTone="purple">
      <div className="pp-ideas">
        {categories.map((cat) => (
          <div key={cat} className="pp-ideas__group">
            <div className="pp-ideas__group-head">
              <h3 className="pp-ideas__cat">{cat}</h3>
              <Button
                type="button"
                variant="outline"
                onClick={() => regenerateIdeas(cat)}
                disabled={ideasLoading}
                aria-label={`Regenerate ${cat} ideas`}
              >
                {ideasLoading ? 'Loading…' : 'Regenerate'}
              </Button>
            </div>
            <ul className="pp-ideas__list">
              {ideas
                .filter((i) => i.category === cat)
                .map((idea) => (
                  <li key={idea.id} className="pp-ideas__card">
                    <strong>{idea.title}</strong>
                    <span className="pp-ideas__desc"> — {idea.description}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}
