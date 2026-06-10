import { test, expect } from '@playwright/test';

// ============================================
// PUBLIC PAGES
// ============================================

test.describe('Public Pages', () => {
  test('homepage renders with hero title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Beat Store');
    await expect(page.getByRole('main').getByRole('link', { name: 'Submit Your Catalog' })).toBeVisible();
    await expect(page.getByRole('main').getByRole('link', { name: 'Supervisor Access' })).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('homepage featured catalog section is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Featured Sync Catalog')).toBeVisible();
    await expect(page.getByText('View Full Catalog').first()).toBeVisible();
  });

  test('about page renders with roster and contact form', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByText('About NcSound')).toBeVisible();
    await expect(page.getByText('The Roster')).toBeVisible();
    await expect(page.getByText('Get in Touch')).toBeVisible();
    await expect(page.locator('#first-name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send Message' })).toBeVisible();
  });

  test('catalog page renders with search and filters', async ({ page }) => {
    await page.goto('/catalog');
    await expect(page.getByText('Licensed Sync')).toBeVisible();
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Genre' })).toBeVisible();
    await expect(page.getByText('100% Pre-Cleared')).toBeVisible();
  });

  test('beat store page renders with pricing tiers', async ({ page }) => {
    await page.goto('/beat-store');
    await expect(page.getByText('Beat Store').first()).toBeVisible();
    await expect(page.getByText('MP3 Lease')).toBeVisible();
    await expect(page.getByText('WAV + Stems License')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Exclusive Rights' })).toBeVisible();
  });

  test('blog page renders with posts', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByText('The Wire')).toBeVisible();
    await expect(page.locator('article')).toHaveCount(3);
  });

  test('agreement page renders with contract', async ({ page }) => {
    await page.goto('/agreement');
    await expect(page.getByText('The Agreement')).toBeVisible();
    await expect(page.getByText('NON-EXCLUSIVE ADMINISTRATION CONTRACT')).toBeVisible();
    await expect(page.getByText('Grant of Rights')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign & Lock In' })).toBeVisible();
  });

  test('catalog submit page renders form', async ({ page }) => {
    await page.goto('/submit');
    await expect(page.getByRole('heading', { name: /Submit Your Catalog/ })).toBeVisible();
    await expect(page.getByText('Artist Information')).toBeVisible();
    await expect(page.getByText('Publishing & Rights')).toBeVisible();
    await expect(page.getByText('Catalog Intel')).toBeVisible();
  });

  test('supervisor portal page renders', async ({ page }) => {
    await page.goto('/supervisor');
    await expect(page.getByText('Music Supervisor Hub')).toBeVisible();
    await expect(page.getByText('24-Hour Clearance').first()).toBeVisible();
    await expect(page.getByText('Verified Login')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enter Catalog' })).toBeVisible();
  });

  test('supervisor register page renders form', async ({ page }) => {
    await page.goto('/supervisor/register');
    await expect(page.getByText('Supervisor Verification')).toBeVisible();
    await expect(page.locator('input[name="first_name"]')).toBeVisible();
    await expect(page.locator('input[name="last_name"]')).toBeVisible();
    await expect(page.locator('input[name="company"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('submit brief page renders form', async ({ page }) => {
    await page.goto('/submit-brief');
    await expect(page.getByText('Submit a Brief').first()).toBeVisible();
    await expect(page.locator('input[name="project_title"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="details"]')).toBeVisible();
    await expect(page.locator('select[name="budget"]')).toBeVisible();
  });
});

// ============================================
// ROSTER PAGES
// ============================================

test.describe('Roster Pages', () => {
  test('niro roster page loads iframe', async ({ page }) => {
    await page.goto('/roster/niro');
    await expect(page.getByText('Back to Roster')).toBeVisible();
    await expect(page.getByText('Open in New Tab')).toBeVisible();
    await expect(page.locator('iframe')).toBeVisible();
  });

  test('tap919 roster page renders', async ({ page }) => {
    await page.goto('/roster/tap919');
    await expect(page.getByRole('heading', { name: /Tap919/ })).toBeVisible();
    await expect(page.getByText('Discography')).toBeVisible();
  });

  test('art productions roster page renders', async ({ page }) => {
    await page.goto('/roster/art-productions');
    await expect(page.getByRole('heading', { name: /A.R.T. Productions/ })).toBeVisible();
    await expect(page.getByText('NcSound Producer')).toBeVisible();
  });
});

// ============================================
// AUTH PAGES
// ============================================

test.describe('Auth Pages', () => {
  test('artist login page renders', async ({ page }) => {
    await page.goto('/artist/login');
    await expect(page.getByRole('heading', { name: 'Artist Portal' })).toBeVisible();
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in to Portal' })).toBeVisible();
    await expect(page.getByText('Need an account?')).toBeVisible();
  });

  test('admin login page renders', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByText('System Access')).toBeVisible();
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Authenticate' })).toBeVisible();
  });
});

// ============================================
// ERROR HANDLING
// ============================================

test.describe('Error Handling', () => {
  test('404 page for unknown routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Return Home' })).toBeVisible();
  });

  test('artist dashboard redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/artist/dashboard');
    await expect(page).toHaveURL(/\/artist\/login/);
  });

  test('admin dashboard redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('artist upload redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/artist/upload');
    await expect(page).toHaveURL(/\/artist\/login/);
  });
});

// ============================================
// NAVIGATION
// ============================================

test.describe('Navigation', () => {
  test('main nav links present and navigate correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Sync Catalog' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Beat Store' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
  });

  test('clicking Sync Catalog navigates there', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Sync Catalog' }).click();
    await expect(page).toHaveURL('/catalog');
  });

  test('clicking Beat Store navigates there', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Beat Store' }).click();
    await expect(page).toHaveURL('/beat-store');
  });

  test('clicking About navigates there', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL('/about');
  });

  test('return home link from 404 works', async ({ page }) => {
    await page.goto('/nonexistent');
    await page.getByRole('link', { name: 'Return Home' }).click();
    await expect(page).toHaveURL('/');
  });
});

// ============================================
// RESPONSIVE DESIGN
// ============================================

test.describe('Responsive Design', () => {
  test('mobile viewport renders', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
  });

  test('desktop layout shows navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Sync Catalog' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Beat Store' })).toBeVisible();
  });
});

// ============================================
// FOOTER
// ============================================

test.describe('Footer', () => {
  test('footer contains branding and admin link', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer')).toContainText('NcSound Publishing');
    await expect(page.locator('footer')).toContainText('Admin');
  });
});
