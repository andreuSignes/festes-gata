import { test, expect } from '@playwright/test';

test.describe('404 page', () => {
  test('CA 404 page renders', async ({ page }) => {
    const response = await page.goto('/ca/404');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText('404');
  });

  test('CA 404 page has correct title', async ({ page }) => {
    await page.goto('/ca/404');
    await expect(page).toHaveTitle(/Pàgina no trobada/);
  });

  test('CA 404 page has CA-specific message', async ({ page }) => {
    await page.goto('/ca/404');
    await expect(page.locator('body')).toContainText('No hem trobat la pàgina');
  });

  test('ES 404 page renders', async ({ page }) => {
    const response = await page.goto('/es/404');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText('404');
  });

  test('ES 404 page has correct title', async ({ page }) => {
    await page.goto('/es/404');
    await expect(page).toHaveTitle(/Página no encontrada/);
  });

  test('ES 404 page has ES-specific message', async ({ page }) => {
    await page.goto('/es/404');
    await expect(page.locator('body')).toContainText('No hemos encontrado la página');
  });

  test('CA 404 back link points to CA landing', async ({ page }) => {
    await page.goto('/ca/404');
    const backLink = page.locator('a', { hasText: /Tornar a l\u2019inici/ });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/festes-gata/ca/');
  });

  test('ES 404 back link points to ES landing', async ({ page }) => {
    await page.goto('/es/404');
    const backLink = page.locator('a', { hasText: /Volver al inicio/ });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/festes-gata/es/');
  });

  test('CA 404 back link navigates to CA landing', async ({ page }) => {
    await page.goto('/ca/404');
    await page.locator('a', { hasText: /Tornar a l\u2019inici/ }).click();
    await expect(page).toHaveURL('/festes-gata/ca/');
  });

  test('ES 404 back link navigates to ES landing', async ({ page }) => {
    await page.goto('/es/404');
    await page.locator('a', { hasText: /Volver al inicio/ }).click();
    await expect(page).toHaveURL('/festes-gata/es/');
  });

  test('non-existent day page returns 404', async ({ page }) => {
    const response = await page.goto('/ca/programa/2099-12-31/');
    expect(response?.status()).toBe(404);
  });

  test('non-existent ES day page returns 404', async ({ page }) => {
    const response = await page.goto('/es/programa/2099-12-31/');
    expect(response?.status()).toBe(404);
  });

  test('invalid URL returns 404 page', async ({ page }) => {
    const response = await page.goto('/ca/invalid/nonexistent/page');
    expect(response?.status()).toBe(404);
  });

  test('CA 404 page has correct lang attribute', async ({ page }) => {
    await page.goto('/ca/404');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ca');
  });

  test('ES 404 page has correct lang attribute', async ({ page }) => {
    await page.goto('/es/404');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('CA 404 has working header brand link', async ({ page }) => {
    await page.goto('/ca/404');
    await page.locator('.brand').click();
    await expect(page).toHaveURL('/festes-gata/ca/');
  });

  test('ES 404 has working header brand link', async ({ page }) => {
    await page.goto('/es/404');
    await page.locator('.brand').click();
    await expect(page).toHaveURL('/festes-gata/es/');
  });
});
