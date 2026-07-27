import { test, expect } from '@playwright/test';

// NOTE: After PR #3 lands (adding /ca/, /es/, LanguageSwitcher, real page routes),
// update this test to assert status 200 instead of 404.
test('day page route resolves (currently 404, update to 200 after PR #3)', async ({ page }) => {
  const response = await page.goto('/es/programa/2026-07-26/');
  // Currently 404 — PR #3 will add this route
  expect(response?.status()).toBe(404);
});
