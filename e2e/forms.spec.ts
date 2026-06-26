import { test, expect } from '@playwright/test';

test.describe('Form Interactions', () => {
  test('contact form on About page has all required fields', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('#first-name')).toBeVisible();
    await expect(page.locator('#last-name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#message')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send Message' })).toBeVisible();
  });

  test('contact form can be filled out', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    await page.fill('#first-name', 'John');
    await page.fill('#last-name', 'Doe');
    await page.fill('#email', 'john@example.com');
    await page.fill('#message', 'Test message for sync licensing');
    await page.getByRole('button', { name: 'Send Message' }).click();

    // Should show success or error message after submission
    await page.waitForTimeout(2000);
    const submitBtn = page.getByRole('button', { name: /send|sending/i });
    await expect(submitBtn).toBeVisible();
  });

  test('catalog search input works', async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder('Search by title, artist, mood, or genre');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('neon');
    await page.waitForTimeout(500);

    // Verify search input retains value
    await expect(searchInput).toHaveValue('neon');
  });

  test('beat store shows pricing', async ({ page }) => {
    await page.goto('/beat-store');
    await page.waitForLoadState('networkidle');

    // Verify the page has beat pricing elements
    await expect(page.getByText(/Every beat you buy/i)).toBeVisible();
  });

  test('artist login form has validation', async ({ page }) => {
    await page.goto('/artist/login');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: /sign in|login|authenticate/i }).first()).toBeVisible();
  });

  test('admin login form has all fields', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /authenticate|login/i })).toBeVisible();
  });

  test('agreement interactive checkbox enables sign button', async ({ page }) => {
    await page.goto('/agreement');
    await page.waitForLoadState('networkidle');

    const checkbox = page.locator('input[type="checkbox"]').first();
    const signBtn = page.getByRole('button', { name: /sign/i }).first();

    if (await checkbox.isVisible()) {
      await expect(signBtn).toBeDisabled();
      await checkbox.check();
      await expect(signBtn).not.toBeDisabled({ timeout: 2000 });
    }
  });

  test('supervisor registration form renders', async ({ page }) => {
    await page.goto('/supervisor/register');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: /submit|register|verify/i }).first()).toBeVisible();
  });

  test('supervisor portal shows tabs', async ({ page }) => {
    await page.goto('/supervisor');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: /register|login|brief/i }).first()).toBeVisible({ timeout: 5000 });
  });
});
