import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function expectNoAxeViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations).toEqual([]);
}

const routes = [
  { path: '/', heading: /plan big\. stress zero\./i },
  { path: '/style-guide', heading: /design system/i },
];

for (const route of routes) {
  test.describe(`route ${route.path}`, () => {
    test('renders its heading', async ({ page }) => {
      await page.goto(route.path);
      await expect(page.getByRole('heading', { level: 1, name: route.heading })).toBeVisible();
    });

    for (const scheme of ['light', 'dark'] as const) {
      test(`has no axe violations (${scheme})`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(route.path);
        await expectNoAxeViolations(page);
      });
    }
  });
}

test.describe('design system interactions', () => {
  test('opens an accessible modal with no axe violations', async ({ page }) => {
    await page.goto('/style-guide');
    await page.getByRole('button', { name: /open modal/i }).click();
    const dialog = page.getByRole('dialog', { name: /example dialog/i });
    await expect(dialog).toBeVisible();
    await expectNoAxeViolations(page);
    // Escape closes the native dialog and returns focus.
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('skip link is the first focusable element', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: /skip to content/i })).toBeFocused();
  });
});
