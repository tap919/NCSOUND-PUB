import { test, expect } from '@playwright/test';

const TEST_ARTIST_EMAIL = process.env.TEST_ARTIST_EMAIL || 'testartist@ncsound.test';
const TEST_ARTIST_PASSWORD = process.env.TEST_ARTIST_PASSWORD || 'test123';

test.describe('Artist E2E Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Artist can login with seeded account and access dashboard', async ({ page }) => {
    await page.goto('/artist/login');
    await expect(page.getByRole('heading', { name: 'Artist Portal' })).toBeVisible();

    await page.fill('input[type="email"]', TEST_ARTIST_EMAIL);
    await page.fill('input[type="password"]', TEST_ARTIST_PASSWORD);
    await page.click('button:has-text("Sign in to Portal")');
    
    // Wait for navigation to dashboard
    await page.waitForURL(/\/artist\/dashboard/, { timeout: 30000 });
    await expect(page.getByText('Welcome').or(page.getByText('Dashboard')).first()).toBeVisible();
  });

  test('Artist can upload a beat', async ({ page }) => {
    // Login first
    await page.goto('/artist/login');
    await page.fill('input[type="email"]', TEST_ARTIST_EMAIL);
    await page.fill('input[type="password"]', TEST_ARTIST_PASSWORD);
    await page.click('button:has-text("Sign in to Portal")');
    await page.waitForURL(/\/artist\/dashboard/, { timeout: 30000 });

    // Navigate to upload page
    await page.goto('/artist/upload');
    // Upload page header is "Audio Assets"
    await expect(page.getByText('Audio Assets')).toBeVisible({ timeout: 10000 });

    // Fill metadata step (step 2)
    await page.click('text=Next Step');
    await expect(page.getByText('Core Metadata')).toBeVisible({ timeout: 10000 });

    // Fill required metadata
    await page.fill('input[name="title"]', 'E2E Test Beat');
    await page.fill('input[name="bpm"]', '95');
    
    // Click next step
    await page.click('text=Next Step');
    await expect(page.getByText('Rights Declarations')).toBeVisible({ timeout: 10000 });

    // Check required checkboxes
    await page.check('input[name="masterOwnership"]');
    await page.check('input[name="publishingOwnership"]');
    await page.check('input[name="sampleClearance"]');

    // Submit
    await page.click('button:has-text("Submit Track")');
    
    // Wait for redirect to dashboard
    await page.waitForURL(/\/artist\/dashboard/, { timeout: 30000 });
  });

  test('Artist can logout and is redirected to login', async ({ page }) => {
    await page.goto('/artist/login');
    await page.fill('input[type="email"]', TEST_ARTIST_EMAIL);
    await page.fill('input[type="password"]', TEST_ARTIST_PASSWORD);
    await page.click('button:has-text("Sign in to Portal")');
    await page.waitForURL(/\/artist\/dashboard/, { timeout: 30000 });

    // Find and click logout
    const logoutBtn = page.getByText('Sign Out').or(page.getByText('Logout'));
    await expect(logoutBtn.first()).toBeVisible({ timeout: 10000 });
    await logoutBtn.first().click();
    
    await expect(page).toHaveURL(/\/artist\/login/, { timeout: 10000 });
  });

  test('Artist dashboard shows track list', async ({ page }) => {
    await page.goto('/artist/login');
    await page.fill('input[type="email"]', TEST_ARTIST_EMAIL);
    await page.fill('input[type="password"]', TEST_ARTIST_PASSWORD);
    await page.click('button:has-text("Sign in to Portal")');
    await page.waitForURL(/\/artist\/dashboard/, { timeout: 30000 });

    await page.goto('/artist/dashboard');
    await expect(page.getByText('Dashboard')).toBeVisible();
    
    // Click "My Catalog" tab if not already active
    await page.click('text=My Catalog');
    
    // Check for seeded track titles in the table
    await expect(page.locator('text=Test Track One').or(page.locator('text=Test Track Two')).first()).toBeVisible({ timeout: 10000 });
  });
});