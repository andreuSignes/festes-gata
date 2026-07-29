/**
 * festival-interactivity.ts — bounded, locale-aware interactivity for
 * the festival landings.
 *
 * Two progressive-enhancement entry points loaded only on the locale
 * landing routes (`/${lang}/`) via the conditional `<script>` mount in
 * `BaseLayout.astro`:
 *
 *  - `initFilters(lang)` — multi-select filter on `[data-filter-bar]`.
 *    Delegated `click` toggles a `Set<EventType>` of selected types,
 *    flips `aria-pressed`, sets `el.hidden` + `tabindex='-1'` +
 *    `aria-hidden='true'` on out-of-set event `<li>` nodes, and reveals
 *    the empty-day live region inside any day whose visible events
 *    dropped to zero. Two bulk controls mirror each other: the reset
 *    button (`data-filter-reset`) refills the set, and the clear-all
 *    button (`data-filter-clear`) empties it so a single chip tap can
 *    isolate one type. With an empty set every day legitimately shows
 *    its empty state — that is the intended "cleared" view, not an
 *    error path.
 *
 *  - `initTodayScroll()` — locale-neutral. Computes today's date in
 *    `Europe/Madrid` via `Intl.DateTimeFormat`, resolves `#day-…`, and
 *    scrolls to the exact or closest available day. Takes over
 *    `history.scrollRestoration` so the browser does not snap to its
 *    previous scroll position (often the bottom of the document) after
 *    the smooth scroll lands on today's day. Bails on a non-empty hash;
 *    honors `prefers-reduced-motion: reduce` by switching to
 *    `behavior: 'auto'`.
 *
 * `EventType` and `Locale` are imported from the shared
 * `src/lib/event-types.ts` and `src/lib/locale.ts` so the same enum
 * list drives the Zod schema, the badges, the filter chips, and this
 * client-side filter logic.
 *
 * Library-free, library-free. See `design.md` §5.
 */

import { EVENT_TYPES, type EventType } from '../lib/event-types';
import type { Locale } from '../lib/locale';

function initBottomSheet(): void {
  const trigger = document.querySelector<HTMLButtonElement>('[data-filter-trigger]');
  const sheet = document.querySelector<HTMLElement>('[data-filter-sheet]');
  const backdrop = document.querySelector<HTMLElement>('[data-filter-backdrop]');
  const closeBtn = document.querySelector<HTMLButtonElement>('[data-filter-sheet-close]');
  const fab = document.querySelector<HTMLElement>('.filter-fab');

  if (!trigger || !sheet || !backdrop || !closeBtn) return;

  const $trigger = trigger;
  const $sheet = sheet;
  const $backdrop = backdrop;
  const $closeBtn = closeBtn;
  const $fab = fab;

  function open(): void {
    $sheet.dataset['open'] = '';
    $backdrop.dataset['open'] = '';
    $trigger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if ($fab) $fab.style.display = 'none';
    $closeBtn.focus();
  }

  function close(): void {
    delete $sheet.dataset['open'];
    delete $backdrop.dataset['open'];
    $trigger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if ($fab) $fab.style.display = '';
    $trigger.focus();
  }

  $trigger.addEventListener('click', open);
  $closeBtn.addEventListener('click', close);
  $backdrop.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $sheet.dataset['open'] !== undefined) {
      close();
    }
  });
}

function initFilters(lang: Locale): void {
  const bar = document.querySelector<HTMLElement>('[data-filter-bar]');
  if (!bar) return;

  const active = new Set<EventType>(EVENT_TYPES);

  // Query chips from BOTH the bar (desktop) and the sheet (mobile)
  const barButtons = bar.querySelectorAll<HTMLButtonElement>('[data-filter-type]');
  const sheet = document.querySelector<HTMLElement>('[data-filter-sheet]');
  const sheetButtons = sheet ? sheet.querySelectorAll<HTMLButtonElement>('[data-filter-type]') : [];
  const buttons = [...barButtons, ...sheetButtons];

  const resetEls = bar.querySelectorAll<HTMLButtonElement>('[data-filter-reset]');
  const clearEls = bar.querySelectorAll<HTMLButtonElement>('[data-filter-clear]');
  const sheetResetEls = sheet
    ? sheet.querySelectorAll<HTMLButtonElement>('[data-filter-reset]')
    : [];
  const sheetClearEls = sheet
    ? sheet.querySelectorAll<HTMLButtonElement>('[data-filter-clear]')
    : [];
  const allReset = [...resetEls, ...sheetResetEls];
  const allClear = [...clearEls, ...sheetClearEls];

  const emptyCopy: Record<Locale, string> = {
    ca: 'No hi ha actes',
    es: 'No hay actos',
  };

  function updateFilterCount(): void {
    const badge = bar!.querySelector<HTMLElement>('[data-filter-count]');
    if (!badge) return;
    const count = active.size;
    const total = EVENT_TYPES.length;
    const label = lang === 'ca' ? 'actius' : 'activos';
    const newText = `${count}/${total} ${label}`;
    if (badge.textContent !== newText) {
      badge.textContent = newText;
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        badge.classList.remove('bounce');
        void badge.offsetWidth;
        badge.classList.add('bounce');
      }
    }
  }

  function applyFilter(): void {
    const items = document.querySelectorAll<HTMLLIElement>('[data-event-list] li[data-event-type]');
    items.forEach((li) => {
      const type = li.getAttribute('data-event-type') as EventType | null;
      const inSet = type !== null && active.has(type);
      li.hidden = !inSet;
      if (inSet) {
        li.removeAttribute('aria-hidden');
        li.removeAttribute('tabindex');
      } else {
        li.setAttribute('aria-hidden', 'true');
        li.setAttribute('tabindex', '-1');
      }
    });

    const days = document.querySelectorAll<HTMLElement>('[data-day-id]');
    days.forEach((day) => {
      const list = day.querySelector<HTMLOListElement>('[data-event-list]');
      const empty = day.querySelector<HTMLElement>('[data-empty-day]');
      if (!list || !empty) return;
      const visible = list.querySelectorAll<HTMLLIElement>('li:not([hidden])').length;
      empty.hidden = visible > 0;
      if (visible === 0 && !empty.textContent) {
        empty.textContent = emptyCopy[lang];
      }
    });

    // Sync aria-pressed state across both desktop chips and mobile sheet chips
    buttons.forEach((btn) => {
      const type = btn.getAttribute('data-filter-type') as EventType | null;
      if (!type) return;
      btn.setAttribute('aria-pressed', active.has(type) ? 'true' : 'false');
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-filter-type') as EventType | null;
      if (!type) return;
      if (active.has(type)) {
        active.delete(type);
      } else {
        active.add(type);
      }
      applyFilter();
      updateFilterCount();
    });
  });

  allReset.forEach((reset) => {
    reset.addEventListener('click', () => {
      active.clear();
      EVENT_TYPES.forEach((t: EventType) => active.add(t));
      applyFilter();
      updateFilterCount();
      reset.focus();
    });
  });

  allClear.forEach((clear) => {
    clear.addEventListener('click', () => {
      active.clear();
      buttons.forEach((b) => b.setAttribute('aria-pressed', 'false'));
      applyFilter();
      updateFilterCount();
      clear.focus();
    });
  });

  // Run once so initial aria-pressed state mirrors the DOM even before
  // any user interaction (defensive: the static markup already starts
  // with all types pressed, but this keeps the script idempotent if
  // the markup were ever changed).
  applyFilter();
  updateFilterCount();
}

function initTodayScroll(): void {
  if (window.location.hash !== '') return;
  // Take over scroll restoration so the browser does not snap to its
  // previous scroll position (often the bottom of the page, where the
  // user last was) after the smooth scroll lands on today's day. On
  // mobile this is critical: the address bar collapse can change the
  // viewport mid-scroll, and the browser's auto-restoration can win
  // the race against `scrollIntoView`, teleporting the user to the
  // bottom of the document.
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date());
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth';

  const target = document.getElementById(`day-${today}`);
  if (target) {
    target.scrollIntoView({ behavior, block: 'start' });
    return;
  }

  // Closest fallback: outside the festival window, jump to the first
  // or last available day. If today is inside the window but the
  // exact day file is missing (data parity gap), snap to the closest
  // day so the user does not get teleported to the bottom of the
  // document.
  const days = Array.from(document.querySelectorAll<HTMLElement>('[data-day-id]'));
  if (days.length === 0) return;
  const dates = days
    .map((d) => d.getAttribute('data-day-id'))
    .filter((d): d is string => d !== null)
    .sort();
  const first = dates[0];
  const last = dates[dates.length - 1];
  if (!first || !last) return;

  let fallback: string;
  if (today < first) {
    fallback = first;
  } else if (today > last) {
    fallback = last;
  } else {
    // Inside the festival window but the exact day is missing.
    // Pick the day with the smallest ISO-date distance to `today`.
    let closest = first;
    let closestDelta = Math.abs(today.localeCompare(first));
    for (const d of dates) {
      const delta = Math.abs(today.localeCompare(d));
      if (delta < closestDelta) {
        closest = d;
        closestDelta = delta;
      }
    }
    fallback = closest;
  }

  const fallbackEl = document.getElementById(`day-${fallback}`);
  if (!fallbackEl) return;
  fallbackEl.scrollIntoView({ behavior, block: 'start' });
}

// Guard against double-run: astro:page-load (ClientRouter swaps) and
// DOMContentLoaded (initial load) both fire; we only need one execution.
// The flag is module-scoped so it survives across page swaps.
let initialized = false;

function initScrollReveal(): void {
  // Scroll-driven reveal fallback for Safari (no animation-timeline: view() support).
  // Uses IntersectionObserver to add data-day-revealed when section enters viewport.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset.dayRevealed = 'true';
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -40px 0px', threshold: 0 }
  );

  document.querySelectorAll('[data-day-id]').forEach((el) => observer.observe(el));
}

function initStickyDayHeader(): void {
  const sticky = document.querySelector<HTMLElement>('[data-sticky-day-header]');
  const titleEl = sticky?.querySelector<HTMLElement>('.sticky-day-header__title');
  const headers = document.querySelectorAll<HTMLElement>('[data-day-header]');
  if (!sticky || !titleEl || !headers.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeId: string | null = null;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const header = entry.target as HTMLElement;
          const daySection = header.closest<HTMLElement>('[data-day-id]');
          const newId = daySection?.dataset.dayId ?? null;
          if (newId && newId !== activeId) {
            activeId = newId;
            const heading = header.querySelector('h1, h2');
            const text = heading?.textContent?.trim() ?? '';
            if (text) {
              sticky.hidden = false;
              if (reducedMotion) {
                titleEl.textContent = text;
              } else {
                sticky.classList.add('slide-out');
                setTimeout(() => {
                  titleEl.textContent = text;
                  sticky.classList.remove('slide-out');
                  sticky.classList.add('slide-in');
                  setTimeout(() => sticky.classList.remove('slide-in'), 300);
                }, 200);
              }
            }
          }
        }
      }
    },
    { threshold: 0, rootMargin: '-10% 0px -80% 0px' }
  );

  headers.forEach((h) => observer.observe(h));

  // Show first visible day on load
  const firstVisible = [...headers].find((h) => {
    const rect = h.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.9;
  });
  if (firstVisible) {
    const daySection = firstVisible.closest<HTMLElement>('[data-day-id]');
    if (daySection?.dataset.dayId) {
      activeId = daySection.dataset.dayId;
      const heading = firstVisible.querySelector('h1, h2');
      titleEl.textContent = heading?.textContent?.trim() ?? '';
      sticky.hidden = false;
    }
  }
}

function run(): void {
  if (initialized) return;
  initialized = true;

  const html = document.documentElement;
  const lang: Locale = html.lang === 'es' ? 'es' : 'ca';
  initFilters(lang);
  initTodayScroll();
  initScrollReveal();
  initStickyDayHeader();
  initBottomSheet();
}

// astro:page-load fires after ClientRouter swaps the page.
// DOMContentLoaded fires on initial page load (before Astro's page-load
// in some test environments). Listening to both ensures the script runs
// regardless of how the page was loaded.
document.addEventListener('astro:page-load', run);
document.addEventListener('DOMContentLoaded', run);
