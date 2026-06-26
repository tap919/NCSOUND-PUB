import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || '';
const hasAdminCreds = !!(ADMIN_EMAIL && ADMIN_PASSWORD);

test.describe('Admin License Approval Flow', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasAdminCreds, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD env vars');
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button:has-text("Authenticate")');
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });
  });

  test('admin can approve a license request', async ({ page }) => {
    await page.goto('/admin/license-requests');
    await page.waitForLoadState('networkidle');

    // Find the first 'Approve' button
    const approveBtn = page.getByRole('button', { name: 'Approve' }).first();
    
    // If no requests, skip or fail depending on if we expect data
    if (await approveBtn.count() === 0) {
        test.skip(true, 'No license requests found to approve');
    }

    await approveBtn.click();

    // Verify status update (it might take a moment)
    await expect(page.getByText('approved').first()).toBeVisible({ timeout: 10000 });
  });
});
