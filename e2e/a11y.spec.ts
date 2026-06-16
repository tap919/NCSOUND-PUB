import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  { url: '/', name: 'homepage' },
  { url: '/catalog', name: 'catalog' },
  { url: '/beat-store', name: 'beat-store' },
  { url: '/about', name: 'about' },
  { url: '/agreement', name: 'agreement' },
  { url: '/artist/login', name: 'artist-login' },
  { url: '/admin/login', name: 'admin-login' },
  { url: '/supervisor', name: 'supervisor-portal' },
  { url: '/supervisor/register', name: 'supervisor-register' },
  { url: '/submit', name: 'catalog-submit' },
  { url: '/submit-brief', name: 'submit-brief' },
  { url: '/roster/niro', name: 'roster-niro' },
  { url: '/roster/tap919', name: 'roster-tap919' },
  { url: '/story', name: 'story' },
  { url: '/privacy', name: 'privacy' },
  { url: '/terms', name: 'terms' },
];

const EXCLUDE_RULES = [
  // Skip color-contrast for pages with known dark-mode themes
  'color-contrast',
];

for (const { url, name } of PAGES) {
  test(`${name} has no critical accessibility violations`, async ({ page }) => {
    await page.goto(url);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(EXCLUDE_RULES)
      .analyze();

    expect(results.violations.filter(v => v.impact === 'critical')).toEqual([]);
  });
}
