import { SavedProfiles } from '@/components/SavedProfiles';
import { TrackForm } from '@/components/TrackForm';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { POINTS, SEASON, TIERS, TYPE_META } from '@/config/arcade';

export default function Home() {
  return (
    <div>
      <section className="space-y-6">
        <Chip colorVar="--pink">{SEASON.label}</Chip>
        <h1 className="text-5xl uppercase leading-[0.95] sm:text-7xl">
          Track your
          <br />
          <span className="bg-yellow px-2">Arcade</span> badges
        </h1>
        <p className="max-w-2xl text-lg">
          Paste your Google Skills public profile. See every badge sorted into Game, Trivia and Skill, your points, and how far
          you are from the next prize tier.
        </p>
        <Card className="max-w-3xl p-6">
          <TrackForm />
        </Card>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-2" aria-label="How points work">
        <Card>
          <h2 className="text-xl uppercase">How points work</h2>
          <ul className="mt-3 space-y-2">
            <li className="flex items-center gap-2">
              <Chip colorVar={TYPE_META.GAME.colorVar}>Game</Chip> {POINTS.game} point each
            </li>
            <li className="flex items-center gap-2">
              <Chip colorVar={TYPE_META.TRIVIA.colorVar}>Trivia</Chip> {POINTS.trivia} point each
            </li>
            <li className="flex items-center gap-2">
              <Chip colorVar={TYPE_META.SKILL.colorVar}>Skill</Chip> 1 point per {POINTS.skillBadgesPerPoint} badges
            </li>
          </ul>
        </Card>
        <Card>
          <h2 className="text-xl uppercase">Prize tiers</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {TIERS.map((t) => (
              <li key={t.id} className="flex items-center gap-2">
                <Chip colorVar={t.colorVar}>{t.name}</Chip>
                <span className="font-mono text-sm font-bold">{t.min}+</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <SavedProfiles />
    </div>
  );
}
