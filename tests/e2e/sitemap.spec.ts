import { test, expect } from '@playwright/test';

test('sitemap is valid XML with at least one sitemap entry', async ({ page }) => {
  const response = await page.goto('/sitemap-index.xml');
  expect(response?.status()).toBe(200);
  const content = await page.content();
  // Check it's valid-ish XML with sitemap entries
  expect(content).toContain('<sitemap>');
  expect(content).toMatch(/<sitemap>[\s\S]*<\/sitemap>/);
});
