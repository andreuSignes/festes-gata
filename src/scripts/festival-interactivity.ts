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
 *    dropped to zero. The reset button refills the set.
 *
 *  - `initTodayScroll()` — locale-neutral. Computes today's date in
 *    `Europe/Madrid` via `Intl.DateTimeFormat`, resolves `#day-…`, and
 *    scrolls to the exact or closest available day. Bails on a
 *    non-empty hash or `history.scrollRestoration === 'manual'`;
 *    honors `prefers-reduced-motion: reduce` by switching to
 *    `behavior: 'auto'`.
 *
 * Library-free, library-free. See `design.md` §5.
 */

type EventType =
  | 'pasacalles'
  | 'bous'
  | 'verbena'
  | 'musica'
  | 'liturgia'
  | 'infantil'
  | 'paelles'
  | 'festes'
  | 'otro';

function initFilters(lang: 'ca' | 'es'): void {
  const bar = document.querySelector<HTMLElement>('[data-filter-bar]');
  if (!bar) return;

  const allTypes: EventType[] = [
    'pasacalles',
    'bous',
    'verbena',
    'musica',
    'liturgia',
    'infantil',
    'paelles',
    'festes',
    'otro',
  ];

  const active = new Set<EventType>(allTypes);
  const buttons = bar.querySelectorAll<HTMLButtonElement>('[data-filter-type]');
  const reset = bar.querySelector<HTMLButtonElement>('[data-filter-reset]');

  const emptyCopy: Record<'ca' | 'es', string> = {
    ca: 'No hi ha actes',
    es: 'No hay actos',
  };

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
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-filter-type') as EventType | null;
      if (!type) return;
      if (active.has(type)) {
        active.delete(type);
        btn.setAttribute('aria-pressed', 'false');
      } else {
        active.add(type);
        btn.setAttribute('aria-pressed', 'true');
      }
      applyFilter();
    });
  });

  if (reset) {
    reset.addEventListener('click', () => {
      active.clear();
      allTypes.forEach((t) => active.add(t));
      buttons.forEach((b) => b.setAttribute('aria-pressed', 'true'));
      applyFilter();
      reset.focus();
    });
  }

  // Run once so initial aria-pressed state mirrors the DOM even before
  // any user interaction (defensive: the static markup already starts
  // with all types pressed, but this keeps the script idempotent if
  // the markup were ever changed).
  applyFilter();
}

function initTodayScroll(): void {
  if (window.location.hash !== '') return;
  if (history.scrollRestoration === 'manual') return;

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date());
  const target = document.getElementById(`day-${today}`);
  if (target) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    return;
  }

  // Closest fallback: outside the festival window, jump to the first
  // or last available day.
  const days = Array.from(document.querySelectorAll<HTMLElement>('[data-day-id]'));
  if (days.length === 0) return;
  const dates = days
    .map((d) => d.getAttribute('data-day-id'))
    .filter((d): d is string => d !== null)
    .sort();
  const first = dates[0];
  const last = dates[dates.length - 1];
  const fallback = today < (first ?? '') ? first : last;
  if (!fallback) return;
  const fallbackEl = document.getElementById(`day-${fallback}`);
  if (!fallbackEl) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  fallbackEl.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}

function run(): void {
  const html = document.documentElement;
  const lang: 'ca' | 'es' = html.lang === 'es' ? 'es' : 'ca';
  initFilters(lang);
  initTodayScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', run);
} else {
  run();
}
