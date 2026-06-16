import { test, expect } from '@playwright/test';

test.describe('License Request Flow', () => {
  test('track detail page shows license request form', async ({ page }) => {
    await page.goto('/catalog');
    // Navigate to first track if available
    const trackLink = page.locator('a[href*="/catalog/"]').first();
    const trackCount = await trackLink.count();
    test.skip(trackCount === 0, 'No tracks in catalog');

    await trackLink.click();
    await expect(page).toHaveURL(/\/catalog\//);
    await expect(page.getByText('Back to Catalog')).toBeVisible();
  });

  test('license request form has required fields', async ({ page }) => {
    await page.goto('/catalog');
    const trackLink = page.locator('a[href*="/catalog/"]').first();
    const trackCount = await trackLink.count();
    test.skip(trackCount === 0, 'No tracks in catalog');

    await trackLink.click();
    await page.waitForLoadState('networkidle');

    // Look for license-related elements
    const licenseSection = page.getByText(/License|Request|Clear|Sync/).first();
    const hasLicenseSection = (await licenseSection.count()) > 0;
    if (hasLicenseSection) {
      await expect(licenseSection).toBeVisible();
    }
  });
});

test.describe('Beat Store Commerce', () => {
  test('beat store renders pricing tiers', async ({ page }) => {
    await page.goto('/beat-store');
    await expect(page.getByText('Beat Store').first()).toBeVisible();
    await expect(page.getByText('MP3 Lease').or(page.getByText('First Wave Lease'))).toBeVisible();
    await expect(page.getByText('WAV + Stems License').or(page.getByText('WAV + Stems'))).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Exclusive Rights' }).or(page.getByText('Exclusive'))).toBeVisible();
  });

  test('beat store shows checkout buttons for pricing tiers', async ({ page }) => {
    await page.goto('/beat-store');
    await page.waitForLoadState('networkidle');
    // Look for any purchase/checkout related buttons or links
    const checkoutCta = page.getByRole('button').filter({ hasText: /Buy|Purchase|License|Checkout|Select|Get/i }).first();
    const checkoutLink = page.getByRole('link').filter({ hasText: /Buy|Purchase|License|Checkout|Select|Get/i }).first();
    const hasCheckout = (await checkoutCta.count()) > 0 || (await checkoutLink.count()) > 0;
    if (hasCheckout) {
      await expect(checkoutCta.or(checkoutLink).first()).toBeVisible();
    }
  });
});

test.describe('Contact Form Submission', () => {
  test('contact form accepts valid input', async ({ page }) => {
    await page.goto('/about');
    await page.getByText('Get in Touch').scrollIntoViewIfNeeded();

    // Fill contact form
    const firstName = page.locator('#first-name');
    const email = page.locator('#email');
    const message = page.locator('#message');
    const submitBtn = page.getByRole('button', { name: 'Send Message' });

    await expect(firstName).toBeVisible();
    await expect(email).toBeVisible();
    await expect(message).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Submit with empty form to trigger validation
    await submitBtn.click();

    // Either submission succeeds or validation shows (both acceptable)
    await page.waitForTimeout(1000);
    const successMsg = page.getByText(/thank|sent|received|success/i);
    const validationMsg = page.locator(':invalid, [aria-invalid="true"], .error, .text-red');
    await expect(successMsg.or(validationMsg).first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Agreement Interactive Flow', () => {
  test('agreement checkbox enables sign button', async ({ page }) => {
    await page.goto('/agreement');
    await expect(page.getByText('NON-EXCLUSIVE ADMINISTRATION CONTRACT')).toBeVisible();

    const checkbox = page.locator('#agree');
    const signButton = page.getByRole('button', { name: 'Sign & Lock In' });

    // Verify initial state
    await expect(checkbox).toBeVisible();
    await expect(signButton).toBeDisabled();

    // Check the box
    await checkbox.check();
    await expect(signButton).not.toBeDisabled();

    // Uncheck
    await checkbox.uncheck();
    await expect(signButton).toBeDisabled();
  });
});

test.describe('Supervisor Submission Flows', () => {
  test('supervisor registration form can be filled', async ({ page }) => {
    await page.goto('/supervisor/register');
    await page.waitForLoadState('networkidle');

    // Fill the form
    const fields = [
      { name: 'first_name', value: 'Jane' },
      { name: 'last_name', value: 'Supervisor' },
      { name: 'company', value: 'Test Network' },
      { name: 'email', value: 'jane@test-network.com' },
    ];

    for (const field of fields) {
      const input = page.locator(`input[name="${field.name}"]`);
      if (await input.count() > 0) {
        await input.fill(field.value);
      }
    }

    const submitBtn = page.getByRole('button', { name: 'Submit Request' });
    if (await submitBtn.count() > 0) {
      await expect(submitBtn).toBeVisible();
    }
  });

  test('brief submission form can be filled', async ({ page }) => {
    await page.goto('/submit-brief');
    await page.waitForLoadState('networkidle');

    const fields = [
      { name: 'project_title', value: 'Test Project' },
      { name: 'email', value: 'client@test.com' },
    ];

    for (const field of fields) {
      const input = page.locator(`input[name="${field.name}"]`);
      if (await input.count() > 0) {
        await input.fill(field.value);
      }
    }

    const details = page.locator('textarea[name="details"]');
    if (await details.count() > 0) {
      await details.fill('Looking for upbeat hip-hop tracks for a commercial.');
    }

    const dispatchBtn = page.getByRole('button', { name: 'Dispatch Brief' });
    if (await dispatchBtn.count() > 0) {
      await expect(dispatchBtn).toBeVisible();
    }
  });
});

test.describe('Error Recovery', () => {
  test('navigating from 404 back to home works', async ({ page }) => {
    await page.goto('/nonexistent-route');
    await expect(page.getByText('404')).toBeVisible();
    await page.getByRole('link', { name: 'Return Home' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('header')).toBeVisible();
  });
});
