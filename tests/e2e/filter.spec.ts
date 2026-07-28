import { test, expect } from '@playwright/test';

test.describe('filter interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ca/');
  });

  test('all filter chips are aria-pressed true by default', async ({ page }) => {
    const chips = page.locator('[data-filter-type]');
    const count = await chips.count();
    expect(count).toBe(9);

    for (let i = 0; i < count; i++) {
      const chip = chips.nth(i);
      await expect(chip).toHaveAttribute('aria-pressed', 'true');
    }
  });

  test('clicking a filter chip toggles it off', async ({ page }) => {
    const chip = page.locator('[data-filter-type="musica"]');
    await expect(chip).toHaveAttribute('aria-pressed', 'true');

    await chip.click();
    await expect(chip).toHaveAttribute('aria-pressed', 'false');

    await chip.click();
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
  });

  test('clicking filter hides matching event types', async ({ page }) => {
    const festesChip = page.locator('[data-filter-type="festes"]');
    await festesChip.click();

    const hiddenFestesEvents = page.locator('[data-event-type="festes"][hidden]');
    const count = await hiddenFestesEvents.count();
    expect(count).toBeGreaterThan(0);
  });

  test('clear-all button hides all events and shows empty state', async ({ page }) => {
    await page.locator('[data-filter-clear]').click();

    const visibleEvents = page.locator('[data-event-list] li:not([hidden])');
    await expect(visibleEvents).toHaveCount(0);

    const visibleEmptyState = page.locator('[data-empty-day]:not([hidden])');
    await expect(visibleEmptyState.first()).toBeVisible();
  });

  test('reset button restores all filter chips to pressed', async ({ page }) => {
    await page.locator('[data-filter-type="bous"]').click();
    await page.locator('[data-filter-type="musica"]').click();
    await page.locator('[data-filter-type="liturgia"]').click();

    await expect(page.locator('[data-filter-type="bous"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('[data-filter-type="musica"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('[data-filter-type="liturgia"]')).toHaveAttribute('aria-pressed', 'false');

    await page.locator('[data-filter-reset]').click();

    const chips = page.locator('[data-filter-type]');
    const count = await chips.count();
    for (let i = 0; i < count; i++) {
      await expect(chips.nth(i)).toHaveAttribute('aria-pressed', 'true');
    }
  });

  test('filtering hides events only for selected type', async ({ page }) => {
    const allEvents = page.locator('[data-event-list] li');
    const initialCount = await allEvents.count();
    expect(initialCount).toBeGreaterThan(1);

    await page.locator('[data-filter-type="bous"]').click();

    const visibleEvents = page.locator('[data-event-list] li:not([hidden])');
    const visibleCount = await visibleEvents.count();
    expect(visibleCount).toBeLessThan(initialCount);
    expect(visibleCount).toBeGreaterThan(0);
  });

  test('filter works on ES locale', async ({ page }) => {
    await page.goto('/es/');

    await page.locator('[data-filter-type="pasacalles"]').click();

    const hiddenPasacalles = page.locator('[data-event-type="pasacalles"][hidden]');
    const visiblePasacalles = page.locator('[data-event-type="pasacalles"]:not([hidden])');
    const totalPasacalles = await page.locator('[data-event-type="pasacalles"]').count();
    expect(totalPasacalles).toBeGreaterThan(0);
    await expect(hiddenPasacalles).toHaveCount(totalPasacalles);
    await expect(visiblePasacalles).toHaveCount(0);
  });

  test('empty day state appears when all events in day are filtered', async ({ page }) => {
    await page.locator('[data-filter-clear]').click();

    const emptyDayRegions = page.locator('[data-empty-day]:not([hidden])');
    const count = await emptyDayRegions.count();
    expect(count).toBeGreaterThan(0);
  });

  test('selective filter leaves some days with events visible', async ({ page }) => {
    await page.locator('[data-filter-type="bous"]').click();
    await page.locator('[data-filter-type="pirotecnia"]').click();

    const daysWithVisibleEvents = page.locator('[data-day-id]');
    const count = await daysWithVisibleEvents.count();
    expect(count).toBeGreaterThan(0);
  });
});
