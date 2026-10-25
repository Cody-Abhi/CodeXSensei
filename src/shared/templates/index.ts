import { backSchedule, type MilestoneSeed } from '../dates';
import { formatMinor, normaliseBudget } from '../money';
import type { EventInput, EventType, Plan } from '../types';

interface BudgetSeed {
  category: string;
  /** Relative weight; re-normalised to the user's exact budget. */
  weight: number;
  rationale: string;
}

interface VendorSeed {
  category: string;
  name: string;
  why: string;
  askThem: string;
}

interface IdeaSeed {
  category: string;
  title: string;
  description: string;
}

interface TypeConfig {
  label: string;
  budget: BudgetSeed[];
  timeline: MilestoneSeed[];
  vendors: VendorSeed[];
  ideas: IdeaSeed[];
}

const WEDDING: TypeConfig = {
  label: 'wedding',
  budget: [
    { category: 'Venue', weight: 30, rationale: 'Usually the single largest cost.' },
    { category: 'Catering', weight: 25, rationale: 'Scales with guest count.' },
    { category: 'Décor & flowers', weight: 12, rationale: 'Sets the whole mood.' },
    { category: 'Attire & styling', weight: 10, rationale: 'Outfits, hair and makeup.' },
    { category: 'Photography', weight: 8, rationale: 'The memories that last.' },
    { category: 'Entertainment', weight: 5, rationale: 'Music, DJ or performers.' },
    { category: 'Logistics', weight: 5, rationale: 'Transport, stay and misc.' },
    { category: 'Contingency', weight: 5, rationale: 'A safety buffer (>=5%).' },
  ],
  timeline: [
    { id: 'w1', title: 'Book venue', phase: '8 months', offsetDays: 240 },
    { id: 'w2', title: 'Shortlist caterer', phase: '6 months', offsetDays: 180 },
    { id: 'w3', title: 'Book photographer', phase: '5 months', offsetDays: 150 },
    { id: 'w4', title: 'Send invitations', phase: '4 months', offsetDays: 120 },
    { id: 'w5', title: 'Finalise attire', phase: '3 months', offsetDays: 90 },
    { id: 'w6', title: 'Menu tasting', phase: '2 months', offsetDays: 60 },
    { id: 'w7', title: 'Collect RSVPs', phase: '1 month', offsetDays: 30 },
    { id: 'w8', title: 'Confirm final headcount', phase: 'Final week', offsetDays: 7 },
    { id: 'w9', title: 'Final vendor confirmations', phase: 'Day before', offsetDays: 1 },
  ],
  vendors: [
    {
      category: 'Venue',
      name: 'Banquet / lawn',
      why: 'Anchors date and capacity.',
      askThem: 'What is included and what is the cancellation policy?',
    },
    {
      category: 'Catering',
      name: 'Caterer',
      why: 'Largest guest-experience driver.',
      askThem: 'Can you handle our dietary needs and per-plate cost?',
    },
    {
      category: 'Photography',
      name: 'Photographer',
      why: 'Captures the day.',
      askThem: 'Do you provide both photo and video, and delivery time?',
    },
    {
      category: 'Décor',
      name: 'Décor & flowers',
      why: 'Realises the theme.',
      askThem: 'Can you work to our palette and budget?',
    },
  ],
  ideas: [
    {
      category: 'Theme',
      title: 'Cohesive colour story',
      description: 'Pick two anchor colours and repeat them across stationery, décor and attire.',
    },
    {
      category: 'Food',
      title: 'Live counters',
      description: 'Interactive chaat or dessert counters keep guests engaged.',
    },
    {
      category: 'Guest experience',
      title: 'Welcome kits',
      description: 'Small hampers with a schedule and local treats for out-of-town guests.',
    },
    {
      category: 'Eco',
      title: 'Plantable invites',
      description: 'Seed-paper invitations and reusable décor cut waste.',
    },
  ],
};

const BIRTHDAY: TypeConfig = {
  label: 'birthday',
  budget: [
    { category: 'Food & cake', weight: 30, rationale: 'The centrepiece of any party.' },
    { category: 'Venue', weight: 25, rationale: 'Home, hall or play zone.' },
    { category: 'Décor', weight: 15, rationale: 'Theme balloons and backdrop.' },
    { category: 'Entertainment', weight: 15, rationale: 'Games, magician or host.' },
    { category: 'Return gifts', weight: 5, rationale: 'A small thank-you for guests.' },
    { category: 'Logistics', weight: 5, rationale: 'Transport and supplies.' },
    { category: 'Contingency', weight: 5, rationale: 'A safety buffer (>=5%).' },
  ],
  timeline: [
    { id: 'b1', title: 'Pick theme & venue', phase: '6 weeks', offsetDays: 42 },
    { id: 'b2', title: 'Send invites', phase: '4 weeks', offsetDays: 28 },
    { id: 'b3', title: 'Order cake', phase: '3 weeks', offsetDays: 21 },
    { id: 'b4', title: 'Plan games & activities', phase: '2 weeks', offsetDays: 14 },
    { id: 'b5', title: 'Confirm RSVPs', phase: '1 week', offsetDays: 7 },
    { id: 'b6', title: 'Shop supplies', phase: '2 days', offsetDays: 2 },
    { id: 'b7', title: 'Decorate & set up', phase: 'Day before', offsetDays: 1 },
  ],
  vendors: [
    {
      category: 'Cake',
      name: 'Bakery',
      why: 'Theme cake is the highlight.',
      askThem: 'Can you match the theme and note any allergens?',
    },
    {
      category: 'Entertainment',
      name: 'Host / entertainer',
      why: 'Keeps kids engaged.',
      askThem: 'What age group and how long is the act?',
    },
    {
      category: 'Décor',
      name: 'Balloon & décor',
      why: 'Creates the wow moment.',
      askThem: 'Do you set up and clear away on the day?',
    },
  ],
  ideas: [
    {
      category: 'Theme',
      title: 'One bold theme',
      description: 'Pick a single theme (dinosaurs, space, jungle) and echo it in cake and games.',
    },
    {
      category: 'Activities',
      title: 'Three rotating stations',
      description: 'Craft, game and photo corners keep energy high without chaos.',
    },
    {
      category: 'Food',
      title: 'Mini portions',
      description: 'Kid-sized snacks and a DIY topping bar reduce waste and fuss.',
    },
    {
      category: 'Eco',
      title: 'Reusable décor',
      description: 'Cloth bunting and refillable favour boxes can be used again.',
    },
  ],
};

const COMMUNITY: TypeConfig = {
  label: 'community event',
  budget: [
    { category: 'Venue & permits', weight: 20, rationale: 'Grounds plus statutory permits.' },
    { category: 'Stalls & infrastructure', weight: 20, rationale: 'Stages, tents, power.' },
    { category: 'Safety & security', weight: 15, rationale: 'Guards, first-aid, fire safety.' },
    { category: 'Catering', weight: 15, rationale: 'Food stalls or community kitchen.' },
    { category: 'Publicity', weight: 10, rationale: 'Posters, social, local press.' },
    { category: 'Volunteers & logistics', weight: 10, rationale: 'Coordination and transport.' },
    { category: 'Waste management', weight: 5, rationale: 'Bins, segregation, cleanup.' },
    { category: 'Contingency', weight: 5, rationale: 'A safety buffer (>=5%).' },
  ],
  timeline: [
    { id: 'c1', title: 'Apply for permits', phase: '4 months', offsetDays: 120 },
    { id: 'c2', title: 'Secure sponsorship', phase: '3 months', offsetDays: 90 },
    { id: 'c3', title: 'Confirm stalls & vendors', phase: '2 months', offsetDays: 60 },
    { id: 'c4', title: 'Finalise safety plan', phase: '6 weeks', offsetDays: 45 },
    { id: 'c5', title: 'Recruit volunteers', phase: '1 month', offsetDays: 30 },
    { id: 'c6', title: 'Publicity push', phase: '2 weeks', offsetDays: 14 },
    { id: 'c7', title: 'Logistics & setup plan', phase: '1 week', offsetDays: 7 },
    { id: 'c8', title: 'Final site walkthrough', phase: 'Day before', offsetDays: 1 },
  ],
  vendors: [
    {
      category: 'Permits',
      name: 'Local authority liaison',
      why: 'Legal to run the event.',
      askThem: 'Which permits and noise/time limits apply?',
    },
    {
      category: 'Safety',
      name: 'Security & first-aid',
      why: 'Crowd and attendee safety.',
      askThem: 'What crowd size can you cover and is first-aid included?',
    },
    {
      category: 'Infrastructure',
      name: 'Stage & tent supplier',
      why: 'Backbone of the venue.',
      askThem: 'Do you cover setup, power and teardown?',
    },
    {
      category: 'Waste',
      name: 'Waste management',
      why: 'Keeps the site clean and compliant.',
      askThem: 'Do you provide segregated bins and cleanup crew?',
    },
  ],
  ideas: [
    {
      category: 'Experience',
      title: 'Clear zones',
      description: 'Separate food, performance and kids zones with signage for easy flow.',
    },
    {
      category: 'Inclusion',
      title: 'Accessible routes',
      description: 'Ramps, seating and quiet corners make it welcoming for everyone.',
    },
    {
      category: 'Safety',
      title: 'Marshal network',
      description: 'Colour-coded volunteer marshals with radios at every junction.',
    },
    {
      category: 'Eco',
      title: 'Zero-waste stalls',
      description: 'Require compostable serveware and set up visible segregation points.',
    },
  ],
};

const CONFIG: Record<EventType, TypeConfig> = {
  wedding: WEDDING,
  birthday: BIRTHDAY,
  community: COMMUNITY,
};

/**
 * Build a deterministic, rule-based plan from user input. Used as the graceful
 * fallback when Gemini is unavailable or returns invalid output (PRD §F2). The
 * budget is re-normalised to sum to the input budget exactly.
 *
 * @param input - Validated event input.
 * @returns A complete, schema-valid plan.
 */
export function buildFallbackPlan(input: EventInput): Plan {
  const config = CONFIG[input.type];

  const amounts = normaliseBudget(
    config.budget.map((item) => item.weight),
    input.budgetMinor,
  );
  // `amounts` has exactly one entry per budget seed, so the index is always in range.
  const budget = config.budget.map((item, index) => ({
    category: item.category,
    amountMinor: amounts[index]!,
    rationale: item.rationale,
  }));

  const timeline = backSchedule(input.date, config.timeline);

  const vendors = config.vendors.map((vendor, index) => ({
    id: `v-${input.type}-${index + 1}`,
    category: vendor.category,
    name: vendor.name,
    why: vendor.why,
    askThem: vendor.askThem,
    status: 'to_find' as const,
  }));

  const vibeSuffix = input.vibes.length > 0 ? ` Tuned for a ${input.vibes.join(', ')} vibe.` : '';
  const ideas = config.ideas.map((idea, index) => ({
    id: `i-${input.type}-${index + 1}`,
    category: idea.category,
    title: idea.title,
    description: index === 0 ? `${idea.description}${vibeSuffix}` : idea.description,
  }));

  const summary =
    `A starter ${config.label} plan for ${input.name} in ${input.city} — around ` +
    `${formatMinor(input.budgetMinor, input.currency)} for about ${input.guests} guests.`;

  return { summary, budget, timeline, vendors, ideas };
}
