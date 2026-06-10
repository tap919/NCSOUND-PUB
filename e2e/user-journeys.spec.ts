import { test, expect } from '@playwright/test';

// ============================================
// USER JOURNEY 1: Public Visitor
// ============================================

test.describe('Journey: Public Visitor', () => {
  test('complete site browse: home → catalog → track → beat store → about', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Beat Store');
    await expect(page.getByRole('link', { name: 'Sync Catalog' })).toBeVisible();

    // Navigate to catalog
    await page.getByRole('link', { name: 'Sync Catalog' }).click();
    await expect(page).toHaveURL('/catalog');
    await expect(page.getByText('Licensed Sync')).toBeVisible();

    // Click a track if one exists, otherwise verify the page structure
    const trackLinks = page.locator('a[href*="/catalog/"]');
    const trackCount = await trackLinks.count();
    if (trackCount > 0) {
      await trackLinks.first().click();
      await expect(page).toHaveURL(/\/catalog\//);
      await expect(page.getByText('Back to Catalog')).toBeVisible();
      // Go back
      await page.getByText('Back to Catalog').click();
    }

    // Navigate to beat store
    await page.getByRole('link', { name: 'Beat Store' }).click();
    await expect(page).toHaveURL('/beat-store');
    await expect(page.getByText('MP3 Lease')).toBeVisible();
    await expect(page.getByText('WAV + Stems License')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Exclusive Rights' })).toBeVisible();

    // Navigate to about
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL('/about');
    await expect(page.getByText('About NcSound')).toBeVisible();
    await expect(page.getByText('The Roster')).toBeVisible();
    await expect(page.getByText('Get in Touch')).toBeVisible();
  });

  test('site navigation via header links all resolve', async ({ page }) => {
    const links = [
      { name: 'Home', url: '/' },
      { name: 'Sync Catalog', url: '/catalog' },
      { name: 'Beat Store', url: '/beat-store' },
      { name: 'About', url: '/about' },
    ];

    for (const link of links) {
      await page.goto('/');
      await page.getByRole('link', { name: link.name }).click();
      await expect(page).toHaveURL(link.url, { timeout: 10000 });
    }
  });
});

// ============================================
// USER JOURNEY 2: Artist Signup/Login Flow
// ============================================

test.describe('Journey: Artist Auth Flow', () => {
  test('artist login page has signup toggle', async ({ page }) => {
    await page.goto('/artist/login');
    await expect(page.getByRole('heading', { name: 'Artist Portal' })).toBeVisible();

    // Start in login mode
    await expect(page.getByRole('button', { name: 'Sign in to Portal' })).toBeVisible();

    // Toggle to signup mode
    await page.getByText('Need an account?').click();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();

    // Toggle back to login mode
    await page.getByText('Already have an account?').click();
    await expect(page.getByRole('button', { name: 'Sign in to Portal' })).toBeVisible();
  });

  test('login form has required validation', async ({ page }) => {
    await page.goto('/artist/login');
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('password reset link appears in login mode', async ({ page }) => {
    await page.goto('/artist/login');
    await expect(page.getByText('Forgot Password?')).toBeVisible();
  });

  test('artist dashboard redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/artist/dashboard');
    await expect(page).toHaveURL(/\/artist\/login/);
  });

  test('artist upload redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/artist/upload');
    await expect(page).toHaveURL(/\/artist\/login/);
  });

  test('upload-beat redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/artist/upload-beat');
    await expect(page).toHaveURL(/\/artist\/login/);
  });

  test('royalties redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/artist/royalties');
    await expect(page).toHaveURL(/\/artist\/login/);
  });

  test('profile redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/artist/profile');
    await expect(page).toHaveURL(/\/artist\/login/);
  });

  test('registration-status redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/artist/registration-status');
    await expect(page).toHaveURL(/\/artist\/login/);
  });
});

// ============================================
// USER JOURNEY 3: Contact Form
// ============================================

test.describe('Journey: Contact Form', () => {
  test('contact form has all required fields', async ({ page }) => {
    await page.goto('/about');
    await page.getByText('Get in Touch').scrollIntoViewIfNeeded();

    // Sync/Licensing is default tab
    await expect(page.locator('#first-name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#message')).toBeVisible();
    await expect(page.locator('#company')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send Message' })).toBeVisible();
  });

  test('contact form toggles between inquiry types', async ({ page }) => {
    await page.goto('/about');

    // Click Artist Inquiry tab
    await page.getByText('Artist Inquiry').click();
    // Company field should still be present (it's conditional in the old version)
    await expect(page.getByRole('button', { name: 'Send Message' })).toBeVisible();

    // Click back to Sync/Licensing
    await page.getByText('Sync/Licensing').click();
    await expect(page.getByText('Company / Production')).toBeVisible();
  });
});

// ============================================
// USER JOURNEY 4: Supervisor Flow
// ============================================

test.describe('Journey: Supervisor Portal', () => {
  test('supervisor portal shows all sections', async ({ page }) => {
    await page.goto('/supervisor');
    await expect(page.getByText('Music Supervisor Hub')).toBeVisible();
    await expect(page.getByText('24-Hour Clearance')).toBeVisible();
    await expect(page.getByText('Smart Brief Matching')).toBeVisible();
    await expect(page.getByText('Rich Metadata')).toBeVisible();
    await expect(page.getByText('Verified Login')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Submit a Brief' })).toBeVisible();
    await expect(page.getByText('Need Access?')).toBeVisible();
  });

  test('supervisor registration form has all fields', async ({ page }) => {
    await page.goto('/supervisor/register');
    await expect(page.locator('input[name="first_name"]')).toBeVisible();
    await expect(page.locator('input[name="last_name"]')).toBeVisible();
    await expect(page.locator('input[name="company"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="links"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit Request' })).toBeVisible();
  });

  test('brief submission form has all fields', async ({ page }) => {
    await page.goto('/submit-brief');
    await expect(page.locator('input[name="project_title"]')).toBeVisible();
    await expect(page.locator('input[name="descriptors"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="details"]')).toBeVisible();
    await expect(page.locator('select[name="budget"]')).toBeVisible();
    await expect(page.locator('input[name="deadline"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dispatch Brief' })).toBeVisible();
  });
});

// ============================================
// USER JOURNEY 5: Admin Flow
// ============================================

test.describe('Journey: Admin Flow', () => {
  test('admin login page renders', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByText('System Access')).toBeVisible();
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Authenticate' })).toBeVisible();
  });

  test('admin dashboard redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('admin sub-pages redirect to login when unauthenticated', async ({ page }) => {
    const adminPages = ['/admin/inbox', '/admin/supervisor-requests', '/admin/license-requests', '/admin/briefs'];
    for (const adminPage of adminPages) {
      await page.goto(adminPage);
      await expect(page).toHaveURL(/\/admin\/login/);
    }
  });
});

// ============================================
// USER JOURNEY 6: Catalog Submit Flow
// ============================================

test.describe('Journey: Catalog Submission', () => {
  test('submission form has all required sections', async ({ page }) => {
    await page.goto('/submit');
    await expect(page.getByText('Artist Information')).toBeVisible();
    await expect(page.getByText('Publishing & Rights')).toBeVisible();
    await expect(page.getByText('Catalog Intel')).toBeVisible();

    // Check for key form fields
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#artist-name')).toBeVisible();
    await expect(page.locator('#legal-name')).toBeVisible();
    await expect(page.locator('#pro')).toBeVisible();
    await expect(page.locator('#ipi')).toBeVisible();
    await expect(page.locator('#ownership')).toBeVisible();
    await expect(page.locator('#catalog-size')).toBeVisible();
    await expect(page.locator('#term-length')).toBeVisible();
    await expect(page.locator('#genre-tags')).toBeVisible();

    // Proceed to contract button
    await expect(page.getByRole('button', { name: 'Proceed to Contract' })).toBeVisible();
  });
});

// ============================================
// USER JOURNEY 7: Agreement Flow
// ============================================

test.describe('Journey: Agreement', () => {
  test('agreement page has checkbox and sign button', async ({ page }) => {
    await page.goto('/agreement');
    await expect(page.getByText('NON-EXCLUSIVE ADMINISTRATION CONTRACT')).toBeVisible();
    await expect(page.getByText('Grant of Rights')).toBeVisible();
    await expect(page.getByText('Compensation & Splits')).toBeVisible();

    // Checkbox starts unchecked
    const checkbox = page.locator('#agree');
    await expect(checkbox).toBeVisible();
    await expect(checkbox).not.toBeChecked();

    // Sign button starts disabled
    const signButton = page.getByRole('button', { name: 'Sign & Lock In' });
    await expect(signButton).toBeDisabled();

    // Check the checkbox
    await checkbox.check();
    await expect(signButton).not.toBeDisabled();
  });
});

// ============================================
// USER JOURNEY 8: Roster Browsing
// ============================================

test.describe('Journey: Roster', () => {
  test('about page links to roster pages', async ({ page }) => {
    await page.goto('/about');
    // The roster section should have artist links
    const rosterSection = page.locator('text=The Roster').locator('..');
    await expect(rosterSection).toBeVisible();
  });

  test('all roster pages render', async ({ page }) => {
    const rosterPages = [
      { url: '/roster/niro', title: 'Open in New Tab' },
      { url: '/roster/tap919', title: 'Tap919' },
      { url: '/roster/art-productions', title: 'A.R.T. Productions' },
    ];
    for (const { url, title } of rosterPages) {
      await page.goto(url);
      await expect(page.getByText(title).first()).toBeVisible({ timeout: 10000 });
    }
  });
});

// ============================================
// USER JOURNEY 9: Error Handling
// ============================================

test.describe('Journey: Error States', () => {
  test('404 page for completely unknown route', async ({ page }) => {
    await page.goto('/this-does-not-exist-at-all');
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Return Home')).toBeVisible();
  });

  test('404 page Return Home link works', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await page.getByRole('link', { name: 'Return Home' }).click();
    await expect(page).toHaveURL('/');
  });

  test('track detail page loads without crashing', async ({ page }) => {
    await page.goto('/catalog/00000000-0000-0000-0000-000000000000');
    await expect(page).toHaveURL(/\/catalog\//);
  });
});
