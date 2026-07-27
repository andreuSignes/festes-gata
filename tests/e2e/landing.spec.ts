import { test, expect } from '@playwright/test';

test('landing page renders without server error', async ({ page }) => {
  const response = await page.goto('/');
  // Accept 200 or redirect (meta-refresh to /ca/ in the placeholder state)
  expect([200, 301, 302, 304]).toContain(response?.status());
});
