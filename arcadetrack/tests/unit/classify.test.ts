import { describe, expect, it } from 'vitest';
import { classifyTitle } from '@/lib/classify';

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
