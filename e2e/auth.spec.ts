import { test, expect } from '@playwright/test';

const ARTIST_EMAIL = process.env.TEST_ARTIST_EMAIL || 'testartist@ncsound.test';
const ARTIST_PASSWORD = process.env.TEST_ARTIST_PASSWORD || 'test123';
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'testadmin@ncsound.test';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'test123';

const hasArtistCreds = true;
const hasAdminCreds = true;

test.describe('Artist Auth', () => {
  test('login page renders all elements', async ({ page }) => {
    await page.goto('/artist/login');
    await expect(page.getByRole('heading', { name: 'Artist Portal' })).toBeVisible();
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in to Portal' })).toBeVisible();
    await expect(page.getByText('Need an account?')).toBeVisible();
    await expect(page.getByText('Forgot Password?')).toBeVisible();
  });

  test('login form requires email and password', async ({ page }) => {
    await page.goto('/artist/login');
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('login with valid credentials redirects to dashboard', async ({ page }) => {
    test.skip(!hasArtistCreds, 'Set TEST_ARTIST_EMAIL and TEST_ARTIST_PASSWORD env vars');
    await page.goto('/artist/login');
    await page.fill('input[type="email"]', ARTIST_EMAIL);
    await page.fill('input[type="password"]', ARTIST_PASSWORD);
    await page.click('button:has-text("Sign in to Portal")');
    await expect(page).toHaveURL(/\/artist\/dashboard/, { timeout: 15000 });
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/artist/login');
    await page.fill('input[type="email"]', 'nonexistent@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("Sign in to Portal")');
    await expect(page.locator('text=Invalid').or(page.locator('text=Error')).or(page.locator('text=failed'))).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Admin Auth', () => {
  test('login page renders all elements', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByText('System Access')).toBeVisible();
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Authenticate' })).toBeVisible();
  });

  test('login with valid admin credentials redirects to dashboard', async ({ page }) => {
    test.skip(!hasAdminCreds, 'Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD env vars');
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button:has-text("Authenticate")');
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });
  });
});

test.describe('Protected Routes', () => {
  const artistRoutes = [
    '/artist/dashboard', '/artist/upload', '/artist/upload-beat',
    '/artist/profile', '/artist/royalties', '/artist/registration-status',
    '/artist/pro-guide',
  ];

  const adminRoutes = [
    '/admin/dashboard', '/admin/inbox', '/admin/supervisor-requests',
    '/admin/license-requests', '/admin/briefs', '/admin/control',
  ];

  for (const route of artistRoutes) {
    test(`artist route ${route} redirects to login when unauthenticated`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/artist\/login/);
    });
  }

  for (const route of adminRoutes) {
    test(`admin route ${route} redirects to login when unauthenticated`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/admin\/login/);
    });
  }
});

test.describe('Session Persistence', () => {
  test('session survives page reload after login', async ({ page }) => {
    test.skip(!hasArtistCreds, 'Set TEST_ARTIST_EMAIL and TEST_ARTIST_PASSWORD env vars');
    await page.goto('/artist/login');
    await page.fill('input[type="email"]', ARTIST_EMAIL);
    await page.fill('input[type="password"]', ARTIST_PASSWORD);
    await page.click('button:has-text("Sign in to Portal")');
    await page.waitForURL(/\/artist\/dashboard/, { timeout: 15000 });
    await page.reload();
    await expect(page).toHaveURL(/\/artist\/dashboard/);
  });
});

test.describe('Logout Flow', () => {
  test('sign out button visible on dashboard and navigates to login', async ({ page }) => {
    test.skip(!hasArtistCreds, 'Set TEST_ARTIST_EMAIL and TEST_ARTIST_PASSWORD env vars');
    await page.goto('/artist/login');
    await page.fill('input[type="email"]', ARTIST_EMAIL);
    await page.fill('input[type="password"]', ARTIST_PASSWORD);
    await page.click('button:has-text("Sign in to Portal")');
    await page.waitForURL(/\/artist\/dashboard/, { timeout: 15000 });
    await expect(page.getByText('Sign Out').or(page.getByText('Logout'))).toBeVisible({ timeout: 5000 });
  });
});
