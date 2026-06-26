import { test, expect } from '@playwright/test';

test.describe('Stripe Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to beat store and wait for load
    await page.goto('/beat-store');
    await page.waitForLoadState('networkidle');
  });

  test('should render pricing tiers and initiate checkout', async ({ page }) => {
    // Mock the checkout API response
    await page.route('/api/checkout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://checkout.stripe.com/test' }),
      });
    });

    // Verify pricing tiers are visible
    const pricingTiers = page.locator('.bg-neutral-900'); // Assuming a selector for the card/tier
    await expect(pricingTiers.first()).toBeVisible();

    // Look for checkout buttons (Buy/Purchase/License/Checkout/Select)
    const checkoutBtn = page.getByRole('button', { name: /Lease|Buy|Purchase|License|Checkout|Select|Get/i }).first();
    await expect(checkoutBtn).toBeVisible();

    // Click checkout
    await checkoutBtn.click();

    // Verify Stripe checkout URL (or at least initiation)
    // Note: Stripe checkout URL will likely be on stripe.com
    await page.waitForURL(/checkout\.stripe\.com/);
    await expect(page).toHaveURL(/checkout\.stripe\.com/);
  });
});
