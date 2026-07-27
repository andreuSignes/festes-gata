import { test, expect } from '@playwright/test';

test('day page route resolves with 200', async ({ page }) => {
  const response = await page.goto('/es/programa/2026-07-26/');
  expect(response?.status()).toBe(200);
});
