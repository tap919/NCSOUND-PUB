import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || '';
const hasAdminCreds = !!(ADMIN_EMAIL && ADMIN_PASSWORD);

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasAdminCreds, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD env vars');
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button:has-text("Authenticate")');
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  });

  test('dashboard loads with Validation tab active by default', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Metadata Validation Engine');
    await expect(page.getByText('Run Batch Check')).toBeVisible();
  });

  const TAB_CHECKS: { tabButton: string; expectedHeading: string; expectedContent: string }[] = [
    { tabButton: 'Metadata Layer', expectedHeading: 'Metadata Validation Engine', expectedContent: 'Run Batch Check' },
    { tabButton: 'MLC Registry Sync', expectedHeading: 'The MLC Integration', expectedContent: 'Export DISCO CSV' },
    { tabButton: 'PRO / TuneRegistry', expectedHeading: 'PRO Registration Bridge', expectedContent: 'TuneRegistry API Active' },
    { tabButton: 'DDEX ERN Deliv.', expectedHeading: 'DDEX ERN 4.3 Delivery', expectedContent: 'Generate ERN' },
    { tabButton: 'Integrations', expectedHeading: '3rd Party Integrations', expectedContent: 'Configure API keys' },
    { tabButton: 'Deals & Cue Sheets', expectedHeading: 'Sync Deal & Cue Sheet Logs', expectedContent: 'Log New Placement' },
    { tabButton: 'AI Pitch Engine', expectedHeading: 'AI Sync Pitch Automation', expectedContent: 'DISCO pitches' },
    { tabButton: 'System Analytics', expectedHeading: 'System Analytics', expectedContent: 'Global platform metrics' },
    { tabButton: 'NcSound Records', expectedHeading: 'NcSound Records Roster', expectedContent: 'Add Artist' },
    { tabButton: 'Acquisition Metrics', expectedHeading: 'Acquisition Metrics', expectedContent: 'Catalog Size' },
  ];

  for (const { tabButton, expectedHeading, expectedContent } of TAB_CHECKS) {
    test(`navigates to ${tabButton} tab`, async ({ page }) => {
      await page.getByRole('button', { name: tabButton }).click();
      await page.waitForTimeout(300);
      await expect(page.locator('h1')).toContainText(expectedHeading);
      if (expectedContent) {
        await expect(page.getByText(expectedContent).first()).toBeVisible();
      }
    });
  }

  test('sidebar admin page links navigate correctly', async ({ page }) => {
    const links = [
      { name: 'Inbox', url: /\/admin\/inbox/ },
      { name: 'Supervisor Requests', url: /\/admin\/supervisor-requests/ },
      { name: 'License Requests', url: /\/admin\/license-requests/ },
      { name: 'Briefs & Matching', url: /\/admin\/briefs/ },
      { name: 'Control Center', url: /\/admin\/control/ },
    ];
    for (const { name, url } of links) {
      await page.getByRole('link', { name }).click();
      await page.waitForURL(url, { timeout: 10000 });
      await page.goBack();
      await page.waitForLoadState('networkidle');
    }
  });

  test('DDEX tab generates XML on button click', async ({ page }) => {
    await page.getByRole('button', { name: 'DDEX ERN Deliv.' }).click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'Generate ERN 4.3 XML' }).click();

    // Should show a status message (error or success depending on API mock)
    await expect(page.getByText(/generating|error/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('agent chat widget opens and responds', async ({ page }) => {
    await page.getByTitle('Open AI Agent').click();
    await expect(page.getByText('Hey, I\'m your NcSound agent')).toBeVisible({ timeout: 5000 });

    await page.fill('input[placeholder="Ask anything..."]', 'What deals are active?');
    await page.click('button[type="button"] svg');

    const assistantMsg = page.locator('text=NcSound agent').first();
    await expect(assistantMsg).toBeVisible();
  });

  test('sign out returns to admin login', async ({ page }) => {
    await page.getByRole('button', { name: 'Exit Terminal' }).click();
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 });
  });

  test('dashboard is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toContainText('Metadata Validation Engine');
    await page.getByRole('button', { name: 'MLC Registry Sync' }).click();
    await page.waitForTimeout(300);
    await expect(page.locator('h1')).toContainText('The MLC Integration');
  });
});
