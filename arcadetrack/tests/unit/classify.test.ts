import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { classifyBadge, classifyTitle } from '@/lib/classify';
import { parseProfileHtml } from '@/lib/parseProfile';

describe('classifyTitle', () => {
  it.each([
    ['The Arcade Trivia June 2024 Week 4', 'TRIVIA'],
    ['Qwiklabs Trivia December 2023 Week 1', 'TRIVIA'],
    ['The Arcade June Speedrun', 'GAME'],
    ['The Arcade Certification Zone June 2024', 'GAME'],
    ['The Arcade Skills Splash', 'GAME'],
    ['Level 3: GenAIus Travels', 'GAME'],
    ['Level 1 : Getting Started with GCP', 'GAME'],
    ['Level 3 GenAI: Prompt Engineering', 'GAME'],
    ['Redis and Google Cloud Game Day', 'GAME'],
    ['Base Camp March 2026', 'GAME'],
    ['Create and Manage Bigtable Instances', 'SKILL'],
    ['Get Started with Pub/Sub', 'SKILL'],
    ['  get started   with PUB/SUB ', 'SKILL'],
    ['DEPRECATED Networking Fundamentals on Google Cloud', 'SKILL'],
    ['[DEPRECATED]Networking Fundamentals on Google Cloud', 'SKILL'],
    ['Introduction to Generative AI', 'OTHER'],
    ['Google Cloud Computing Foundations: Cloud Computing Fundamentals', 'OTHER'],
    ['Skills Boost Arcade Facilitator Program Cohort 2 2025', 'OTHER'],
    ['Google Cloud Arcade Facilitator Program 2024', 'OTHER'],
    ['Totally Unknown Badge', 'OTHER'],
  ])('%s -> %s', (title, type) => {
    expect(classifyTitle(title)).toBe(type);
  });

  it('trivia wins over game keywords', () => {
    expect(classifyTitle('The Arcade Trivia')).toBe('TRIVIA');
  });
});

describe('classifyBadge uses what the profile page says about each badge', () => {
  const html = readFileSync(path.join(__dirname, '../fixtures/profile-public.html'), 'utf8');
  const badges = parseProfileHtml(html, 'https://www.skills.google/public_profiles/x').badges;
  const real = (title: string) => badges.find((b) => b.title === title)!;

  it('a skill badge missing from the bundled catalog is recognised from its dialog text', () => {
    const b = { ...real('Create and Manage Bigtable Instances'), title: 'Brand New Skill Badge Not In Catalog' };
    expect(classifyTitle(b.title)).toBe('OTHER');
    expect(classifyBadge(b)).toBe('SKILL');
  });

  it('foundation courses that merely mention "Skill Badges" stay Other', () => {
    const b = real('Google Cloud Computing Foundations: Data, ML, and AI in Google Cloud');
    expect(b.description).toMatch(/Skill Badges/);
    expect(classifyBadge({ ...b, title: 'Unlisted Foundations Course' })).toBe('OTHER');
  });

  it('the /games catalog marks a game badge even when its title has no game keyword', () => {
    expect(classifyBadge({ title: 'Totally Novel Name', catalog: 'games' })).toBe('GAME');
  });

  it('a course-catalog badge is never a game, but trivia wording still wins', () => {
    expect(classifyBadge({ title: 'Level 9 Something', catalog: 'courses' })).toBe('OTHER');
    expect(classifyBadge({ title: 'Qwiklabs Trivia October 2023 Week 1', catalog: 'courses' })).toBe('TRIVIA');
  });

  it('facilitator badges in the /games catalog are not games', () => {
    expect(classifyBadge(real('Google Cloud Arcade Facilitator Program 2024'))).toBe('OTHER');
  });
});
