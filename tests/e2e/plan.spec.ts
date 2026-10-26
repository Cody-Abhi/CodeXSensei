import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function fillBasics(
  page: Page,
  opts: { name: string; date: string; city: string; guests: string; budget: string },
): Promise<void> {
  await page.getByLabel('Event name').fill(opts.name);
  await page.getByLabel('Event date').fill(opts.date);
  await page.getByLabel('City').fill(opts.city);
  await page.getByLabel('Guest count').fill(opts.guests);
  await page.getByLabel('Total budget').fill(opts.budget);
}

const cases = [
  { type: /wedding/i, name: 'Aisha & Rohan', city: 'Jaipur', guests: '300', budget: '1500000' },
  { type: /birthday/i, name: 'Kiaan 7th', city: 'Pune', guests: '20', budget: '25000' },
  { type: /community/i, name: 'Diwali Mela', city: 'Delhi', guests: '500', budget: '200000' },
];

for (const c of cases) {
  test(`creates a plan for ${c.name}`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /start planning/i }).click();
    await expect(page).toHaveURL(/\/plan\/new$/);

    await page.getByRole('radio', { name: c.type }).check({ force: true });
    await page.getByRole('button', { name: /next/i }).click();

    await fillBasics(page, {
      name: c.name,
      date: '2099-02-14',
      city: c.city,
      guests: c.guests,
      budget: c.budget,
    });
    await page.getByRole('button', { name: /next/i }).click();

    await page.getByRole('button', { name: /generate my plan/i }).click();

    await expect(page).toHaveURL(/\/plan$/);
    await expect(page.getByRole('heading', { level: 1, name: /your plan/i })).toBeVisible();
    await expect(page.getByText(c.name, { exact: false }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Budget' })).toBeVisible();
  });
}

test.describe('wizard & plan accessibility', () => {
  test('wizard has no axe violations', async ({ page }) => {
    await page.goto('/plan/new');
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });

  test('plan page has no axe violations after generation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /start planning/i }).click();
    await page.getByRole('radio', { name: /birthday/i }).check({ force: true });
    await page.getByRole('button', { name: /next/i }).click();
    await fillBasics(page, {
      name: 'Axe Party',
      date: '2099-02-14',
      city: 'Pune',
      guests: '20',
      budget: '25000',
    });
    await page.getByRole('button', { name: /next/i }).click();
    await page.getByRole('button', { name: /generate my plan/i }).click();
    await expect(page.getByRole('heading', { name: 'Budget' })).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
});
