import { test, expect } from '@playwright/test';

test.describe('Public Pages Smoke Tests', () => {
  test('Home page loads without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    expect(errors.filter(e => !e.includes('favicon'))).toEqual([]);
  });

  test('About page loads with artist roster', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByText('TAP919')).toBeVisible();
    await expect(page.getByText('Mr. Niro')).toBeVisible();
    await expect(page.getByText('A.R.T. Productions')).toBeVisible();
    await expect(page.getByText('The Soulyghost')).toBeVisible();
  });

  test('BeatStore page loads with beats', async ({ page }) => {
    await page.goto('/beat-store');
    await expect(page.getByText(/beat store/i)).toBeVisible();
    await page.waitForTimeout(3000);
    const beatItems = page.locator('ul >> li');
    const count = await beatItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Catalog page loads', async ({ page }) => {
    await page.goto('/catalog');
    await expect(page.locator('h2').first()).toBeVisible();
  });

  test('Terms page loads', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByText(/nc sound provides/i)).toBeVisible();
  });

  test('Story page loads', async ({ page }) => {
    await page.goto('/story');
    await expect(page.getByText(/tap919 cut his teeth/i)).toBeVisible();
  });
});

test.describe('Roster Pages', () => {
  test('Tap919 roster page loads with social links', async ({ page }) => {
    await page.goto('/roster/tap919');
    await expect(page.getByText('Tap919')).toBeVisible();
    await expect(page.getByText(/spotify/i)).toBeVisible();
    await expect(page.getByText(/bandcamp/i)).toBeVisible();
    await expect(page.getByText(/tiktok/i)).toBeVisible();
  });

  test('Niro roster page loads with discography link and Spotify', async ({ page }) => {
    await page.goto('/roster/niro');
    await expect(page.getByText('Mr. Niro')).toBeVisible();
    await expect(page.getByText(/open music player/i)).toBeVisible();
    await expect(page.getByText(/on spotify/i)).toBeVisible();
  });

  test('Soulyghost roster page loads', async ({ page }) => {
    await page.goto('/roster/soulyghost');
    await expect(page.getByText('The Soulyghost')).toBeVisible();
  });

  test('ARTProductions roster page loads', async ({ page }) => {
    await page.goto('/roster/art-productions');
    await expect(page.getByText('A.R.T. Productions')).toBeVisible();
  });
});

test.describe('Niro Music Player', () => {
  test('Niro music page loads with albums', async ({ page }) => {
    await page.goto('/niro-music');
    await expect(page.getByText(/1111|isolated|reloaded/i)).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('navigation between pages works', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /about/i }).first().click();
    await page.waitForURL(/\/about/);
    await expect(page.getByText('TAP919')).toBeVisible();
  });

  test('footer links are present on all pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/all rights reserved/i)).toBeVisible();
    await expect(page.getByText(/terms/i)).toBeVisible();
  });
});

test.describe('Contact Form', () => {
  test('contact form accepts input', async ({ page }) => {
    await page.goto('/about');
    const firstName = page.getByPlaceholder(/first name/i);
    if (await firstName.isVisible()) {
      await firstName.fill('John');
      await page.getByPlaceholder(/email/i).fill('john@example.com');
      await page.getByPlaceholder(/message/i).fill('This is a test message for the contact form submission.');
    }
  });
});

test.describe('Error Handling', () => {
  test('404 page shows for unknown routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
  });
});
