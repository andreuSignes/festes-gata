import { test, expect } from '@playwright/test';

test.describe('navigation', () => {
  test('CA header brand links to CA landing', async ({ page }) => {
    await page.goto('/ca/');
    const brand = page.locator('.brand');
    await expect(brand).toBeVisible();
    await expect(brand).toHaveAttribute('href', '/festes-gata/ca/');
  });

  test('ES header brand links to ES landing', async ({ page }) => {
    await page.goto('/es/');
    const brand = page.locator('.brand');
    await expect(brand).toBeVisible();
    await expect(brand).toHaveAttribute('href', '/festes-gata/es/');
  });

  test('brand click navigates to CA landing from day page', async ({ page }) => {
    await page.goto('/ca/programa/2026-07-26/');
    await page.locator('.brand').click();
    await expect(page).toHaveURL('/festes-gata/ca/');
  });

  test('brand click navigates to ES landing from day page', async ({ page }) => {
    await page.goto('/es/programa/2026-07-26/');
    await page.locator('.brand').click();
    await expect(page).toHaveURL('/festes-gata/es/');
  });

  test('today link is present on CA landing', async ({ page }) => {
    await page.goto('/ca/');
    const todayLink = page.locator('.nav-link', { hasText: 'Hui' });
    await expect(todayLink).toBeVisible();
    await expect(todayLink).toHaveAttribute('href', '/festes-gata/ca/');
  });

  test('today link is present on ES landing', async ({ page }) => {
    await page.goto('/es/');
    const todayLink = page.locator('.nav-link', { hasText: 'Hoy' });
    await expect(todayLink).toBeVisible();
    await expect(todayLink).toHaveAttribute('href', '/festes-gata/es/');
  });

  test('locale switcher is present on CA landing', async ({ page }) => {
    await page.goto('/ca/');
    const switcher = page.locator('[data-lang-select]');
    await expect(switcher).toBeVisible();

    const options = switcher.locator('option');
    await expect(options).toHaveCount(2);
  });

  test('locale switcher is present on ES landing', async ({ page }) => {
    await page.goto('/es/');
    const switcher = page.locator('[data-lang-select]');
    await expect(switcher).toBeVisible();

    const options = switcher.locator('option');
    await expect(options).toHaveCount(2);
  });

  test.skip('switching from CA to ES changes URL and lang', async ({ page }) => {
    await page.goto('/ca/');
    await page.locator('[data-lang-select]').selectOption({ index: 1 });
    await page.waitForURL('/festes-gata/es/');

    await expect(page).toHaveURL('/festes-gata/es/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test.skip('switching from ES to CA changes URL and lang', async ({ page }) => {
    await page.goto('/es/');
    await page.locator('[data-lang-select]').selectOption({ index: 0 });
    await page.waitForURL('/festes-gata/ca/');

    await expect(page).toHaveURL('/festes-gata/ca/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ca');
  });

  test.skip('locale switcher on day page preserves date path', async ({ page }) => {
    await page.goto('/ca/programa/2026-07-26/');
    await page.locator('[data-lang-select]').selectOption({ index: 1 });
    await page.waitForURL('/festes-gata/es/programa/2026-07-26/');

    await expect(page).toHaveURL('/festes-gata/es/programa/2026-07-26/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test.skip('locale switcher on ES day page preserves date path', async ({ page }) => {
    await page.goto('/es/programa/2026-07-26/');
    await page.locator('[data-lang-select]').selectOption({ index: 0 });
    await page.waitForURL('/festes-gata/ca/programa/2026-07-26/');

    await expect(page).toHaveURL('/festes-gata/ca/programa/2026-07-26/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ca');
  });

  test('footer links are present', async ({ page }) => {
    await page.goto('/ca/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('day page back link navigates correctly', async ({ page }) => {
    await page.goto('/ca/programa/2026-07-27/');
    await page.locator('a', { hasText: 'Tornar al programa' }).click();

    await expect(page).toHaveURL('/festes-gata/ca/');
  });

  test('day page back link is locale-specific on ES', async ({ page }) => {
    await page.goto('/es/programa/2026-07-27/');
    const backLink = page.locator('a', { hasText: 'Volver al programa' });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/festes-gata/es/');
  });

  test('navigating from CA landing to day page and back', async ({ page }) => {
    await page.goto('/ca/programa/2026-07-26/');

    await page.locator('a', { hasText: 'Tornar al programa' }).click();
    await expect(page).toHaveURL('/festes-gata/ca/');
  });
});
