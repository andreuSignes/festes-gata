import { test, expect, type Page } from '@playwright/test';

/**
 * Regression coverage for the today-scroll behaviour in
 * `src/scripts/festival-interactivity.ts`.
 *
 * Background: the landing page used to scroll to the END of the
 * document on the Catalan locale when `today` was inside the festival
 * window but the exact day file was missing (the CA collection was
 * missing `2026-07-27.json`). The fallback logic was
 * `today < first ? first : last` which always picked `last` whenever
 * today was inside the window, sending the user to the bottom of the
 * page on mobile.
 *
 * The fix:
 *  1. Adds the missing CA day so the exact match path runs.
 *  2. Sets `history.scrollRestoration = 'manual'` so the browser does
 *     not snap to its previous scroll position (often the bottom of
 *     the page) after the smooth scroll lands on today's day. This
 *     is critical on mobile where the address bar collapse can change
 *     the viewport mid-scroll.
 *  3. Replaces the broken fallback with a closest-day algorithm so an
 *     accidental data parity gap can never teleport the user to the
 *     bottom of the document.
 */

/** Wait until the named day element's top edge is at the viewport top. */
async function waitForDayAtTop(page: Page, dayId: string): Promise<void> {
  await page.waitForFunction(
    (id) => {
      const el = document.getElementById(id);
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      // After the smooth scroll lands, the day's top should be near the
      // viewport top. Allow 5px for browser quirks.
      return Math.abs(rect.top) < 5;
    },
    dayId,
    { timeout: 5000, polling: 50 }
  );
}

/** Wait until the LAST day in document order is at the viewport top. */
async function waitForLastDayAtTop(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const all = document.querySelectorAll('[data-day-id]');
      const el = all[all.length - 1];
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return Math.abs(rect.top) < 5;
    },
    undefined,
    { timeout: 5000, polling: 50 }
  );
}

test.describe('today scroll on locale landings', () => {
  test('CA exact match: 2026-07-27 lands on day-2026-07-27 (mobile, the reported bug)', async ({
    page,
  }) => {
    // The reported regression: on the CA landing, today (= 2026-07-27)
    // used to scroll to the END of the document because the CA
    // collection was missing the day and the fallback jumped to `last`.
    await page.clock.setFixedTime(new Date('2026-07-27T12:00:00+02:00')); // Europe/Madrid noon
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/ca/');
    await waitForDayAtTop(page, 'day-2026-07-27');
    // The scroll is NOT at the bottom of the document.
    const info = await page.evaluate(() => {
      const all = document.querySelectorAll('[data-day-id]');
      const last = all[all.length - 1];
      return {
        scrollY: window.scrollY,
        pageHeight: document.documentElement.scrollHeight,
        viewportHeight: window.innerHeight,
        lastDayTop: last ? last.getBoundingClientRect().top : null,
      };
    });
    expect(info.lastDayTop).not.toBeNull();
    expect(info.lastDayTop!).toBeGreaterThan(0); // last day is NOT at the top
    expect(info.scrollY).toBeLessThan(info.pageHeight - info.viewportHeight);
  });

  test('ES exact match: 2026-07-27 lands on day-2026-07-27 (desktop)', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-07-27T12:00:00+02:00'));
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/es/');
    await waitForDayAtTop(page, 'day-2026-07-27');
    const lastDayTop = await page.evaluate(() => {
      const all = document.querySelectorAll('[data-day-id]');
      const last = all[all.length - 1];
      return last ? last.getBoundingClientRect().top : null;
    });
    expect(lastDayTop).not.toBeNull();
    expect(lastDayTop!).toBeGreaterThan(0);
  });

  test('before festival: scrolls to the first day', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-07-20T12:00:00+02:00'));
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/ca/');
    await waitForDayAtTop(page, 'day-2026-07-18');
  });

  test('after festival: scrolls to the last day', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-08-15T12:00:00+02:00'));
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/ca/');
    await waitForLastDayAtTop(page);
  });

  test('prefers-reduced-motion uses instant scroll', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-07-29T12:00:00+02:00'));
    await page.setViewportSize({ width: 375, height: 667 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/ca/');
    // With reduced motion the scroll is instant; the day lands at the
    // top on the first read.
    await page.waitForFunction(
      () => {
        const el = document.getElementById('day-2026-07-29');
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return Math.abs(rect.top) < 5;
      },
      undefined,
      { timeout: 1000, polling: 25 }
    );
  });
});
