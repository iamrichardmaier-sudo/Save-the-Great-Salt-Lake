/**
 * The app shell: state, rendering, and the wiring between the dials and the model.
 *
 * One rule governs everything here: the page is a pure function of the dials. Nothing is cached
 * between renders except the dials themselves, so a figure can never disagree with the model that
 * produced it.
 */

import './styles.css';
import { DEFAULT_DIALS, pkgModel, reconcile, type Dials, type PkgResult } from './model';
import { optimise, sensitivity, simulate, type SimResult, type TornadoRow } from './simulate';
import { fullSpendSchedule, type ScheduleResult } from './schedule';
import { TABS, headerSummary, type Ctx } from './ui/tabs';
import { CONTROLS, controlHelp } from './ui/controls';
import { escapeHtml, lookupProvenance, num, pct, provenanceHtml, resetProvenance } from './ui/format';

interface State {
  dials: Dials;
  tab: string;
  optWeight: number;
  reconOpen: boolean;
}

const VALID_TABS = new Set(TABS.map((t) => t.id));

const state: State = {
  dials: { ...DEFAULT_DIALS },
  tab: VALID_TABS.has(location.hash.slice(1)) ? location.hash.slice(1) : 'pkg',
  optWeight: 0.6,
  reconOpen: false,
};

let cache: { r: PkgResult; sim: SimResult; tornado: TornadoRow[] } | null = null;
// The year-by-year budget runs the model thousands of times, so it is built only when a tab asks.
let plan: ScheduleResult | null = null;

function schedule(): ScheduleResult {
  plan ??= fullSpendSchedule(state.dials);
  return plan;
}

function compute(): Ctx {
  if (!cache) {
    const r = pkgModel(state.dials);
    cache = {
      r,
      sim: simulate(r, { seed: 20260101 }),
      tornado: sensitivity(state.dials, 12),
    };
  }
  return { d: state.dials, ...cache, schedule };
}

function invalidate(): void {
  cache = null;
  plan = null;
}

// ───────────────────────── Rendering ─────────────────────────

const app = document.getElementById('app')!;

function render(): void {
  resetProvenance();
  const ctx = compute();
  const tab = TABS.find((t) => t.id === state.tab) ?? TABS[0];
  const checks = reconcile(ctx.r);
  const failed = checks.filter((c) => !c.ok);

  const railButtons = (group: 'plan' | 'detail') =>
    TABS.filter((t) => t.group === group)
      .map(
        (t) =>
          `<button type="button" role="tab" aria-selected="${t.id === state.tab}" data-tab="${t.id}">${escapeHtml(t.label)}</button>`,
      )
      .join('');

  app.innerHTML = `
    <header class="masthead">
      <div class="wrap masthead-inner">
        <div class="title-row">
          <div>
            <h1>Utah Water Allocation Model</h1>
            <p class="standfirst">${headerSummary(ctx.r)}</p>
          </div>
          <button type="button" class="theme-toggle" id="theme-toggle">Switch theme</button>
        </div>
        <nav class="rail" role="tablist" aria-label="The plan">
          <span class="rail-label">The plan</span>${railButtons('plan')}
        </nav>
        <nav class="rail rail-detail" role="tablist" aria-label="Detail">
          <span class="rail-label">Detail</span>${railButtons('detail')}
        </nav>
      </div>
    </header>

    <main class="wrap" id="tabpanel" role="tabpanel" aria-label="${escapeHtml(tab.label)}">
      ${tab.render(ctx)}
    </main>

    <div class="recon">
      ${
        state.reconOpen
          ? `<div class="recon-list">
              <h4>Arithmetic checks</h4>
              <p class="hint">These run against the live model every time a dial moves. A red mark means a number on this page cannot be trusted.</p>
              ${checks
                .map(
                  (c) => `<div class="recon-item ${c.ok ? 'recon-ok' : 'recon-fail'}">
                    <span class="mark">${c.ok ? '✓' : '✕'}</span>
                    <span>${escapeHtml(c.label)}<span class="detail">${escapeHtml(c.detail)}${c.ok ? '' : ` — ${num(c.lhs, 3)} against ${num(c.rhs, 3)}`}</span></span>
                  </div>`,
                )
                .join('')}
            </div>`
          : ''
      }
      <button type="button" class="recon-toggle" id="recon-toggle" aria-expanded="${state.reconOpen}">
        <span class="recon-dot ${failed.length ? 'bad' : ''}"></span>
        ${failed.length ? `${failed.length} check${failed.length > 1 ? 's' : ''} failing` : `All ${checks.length} checks pass`}
      </button>
    </div>`;

  tab.mount?.(app, ctx);
  wire();
}

// ───────────────────────── Events ─────────────────────────

function closePanels(): void {
  document.querySelectorAll('.prov-panel, .prov-backdrop, .help-pop').forEach((n) => n.remove());
}

function openProvenance(id: string): void {
  closePanels();
  if (!lookupProvenance(id)) return;
  const backdrop = document.createElement('div');
  backdrop.className = 'prov-backdrop';
  backdrop.addEventListener('click', closePanels);
  const panel = document.createElement('div');
  panel.className = 'prov-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Where this number comes from');
  panel.innerHTML = `<button type="button" class="prov-close" aria-label="Close">×</button>${provenanceHtml(id)}`;
  panel.querySelector('.prov-close')!.addEventListener('click', closePanels);
  document.body.append(backdrop, panel);
  panel.querySelector<HTMLElement>('.prov-close')?.focus();
}

function openHelp(key: string, anchor: HTMLElement): void {
  closePanels();
  const c = controlHelp(key);
  if (!c) return;
  const pop = document.createElement('div');
  pop.className = 'help-pop';
  pop.textContent = c.help;
  document.body.appendChild(pop);
  const box = anchor.getBoundingClientRect();
  const left = Math.min(Math.max(8, box.left - 20), window.innerWidth - pop.offsetWidth - 8);
  pop.style.left = `${left + window.scrollX}px`;
  pop.style.top = `${box.bottom + window.scrollY + 6}px`;
  setTimeout(() => document.addEventListener('click', closePanels, { once: true }), 0);
}

function setDial(key: keyof Dials, raw: string | boolean): void {
  const control = CONTROLS.find((c) => String(c.key) === key);
  const current = state.dials[key];
  let value: number | string | boolean;
  if (typeof raw === 'boolean') value = raw;
  else if (typeof current === 'number') value = Number(raw);
  else value = raw;
  (state.dials as unknown as Record<string, unknown>)[key as string] = value;
  void control;
  invalidate();
  render();
}

function wire(): void {
  app.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((b) =>
    b.addEventListener('click', () => {
      state.tab = b.dataset.tab!;
      if (location.hash.slice(1) !== state.tab) history.pushState(null, '', `#${state.tab}`);
      render();
      document.getElementById('tabpanel')?.scrollIntoView({ block: 'start', behavior: 'auto' });
    }),
  );

  app.querySelectorAll<HTMLButtonElement>('[data-prov]').forEach((b) =>
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      openProvenance(b.dataset.prov!);
    }),
  );

  app.querySelectorAll<HTMLButtonElement>('[data-help]').forEach((b) =>
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      openHelp(b.dataset.help!, b);
    }),
  );

  app.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-dial]').forEach((el) => {
    const key = el.dataset.dial as keyof Dials;
    if (el instanceof HTMLInputElement && el.type === 'checkbox') {
      el.addEventListener('change', () => setDial(key, el.checked));
    } else if (el instanceof HTMLInputElement && el.type === 'range') {
      // Update the readout while dragging, but only re-run the model when the drag ends.
      el.addEventListener('input', () => {
        const control = CONTROLS.find((c) => String(c.key) === key);
        const out = el.closest('.ctl')?.querySelector('output');
        if (control && out) {
          const preview = { ...state.dials, [key]: Number(el.value) } as Dials;
          out.textContent = control.display(Number(el.value) as never, preview);
        }
      });
      el.addEventListener('change', () => setDial(key, el.value));
    } else {
      el.addEventListener('change', () => setDial(key, (el as HTMLSelectElement).value));
    }
  });

  app.querySelectorAll<HTMLButtonElement>('[data-enable]').forEach((b) =>
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const control = CONTROLS.find((c) => String(c.key) === b.dataset.enable);
      if (!control?.prereq) return;
      Object.assign(state.dials, control.prereq);
      invalidate();
      render();
    }),
  );

  const weight = app.querySelector<HTMLInputElement>('#opt-weight');
  const weightOut = app.querySelector<HTMLOutputElement>('#opt-weight-out');
  weight?.addEventListener('input', () => {
    state.optWeight = Number(weight.value);
    if (weightOut) weightOut.textContent = `${pct(state.optWeight)} water, ${pct(1 - state.optWeight)} political support`;
  });

  app.querySelector<HTMLButtonElement>('#opt-run')?.addEventListener('click', (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = 'Searching…';
    // Let the button repaint before the search blocks the thread.
    setTimeout(() => {
      const best = optimise(state.optWeight, { tries: 1000, seed: 424242, base: state.dials });
      state.dials = best.dials;
      invalidate();
      render();
    }, 20);
  });

  app.querySelector<HTMLButtonElement>('#recon-toggle')?.addEventListener('click', () => {
    state.reconOpen = !state.reconOpen;
    render();
  });

  app.querySelector<HTMLButtonElement>('#theme-toggle')?.addEventListener('click', () => {
    const root = document.documentElement;
    const now = root.getAttribute('data-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const next = now ? (now === 'dark' ? 'light' : 'dark') : prefersDark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('uwam-theme', next);
    } catch {
      // Private windows and blocked site data: the page still works, it just forgets.
    }
    render();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePanels();
});

// Deep links and the back button: a tab is addressable, so a reader can send someone a link to
// the risks tab rather than telling them where to click.
window.addEventListener('hashchange', () => {
  const next = location.hash.slice(1);
  if (VALID_TABS.has(next) && next !== state.tab) {
    state.tab = next;
    render();
  }
});

let resizeTimer: number | undefined;
window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => render(), 160);
});

try {
  const saved = localStorage.getItem('uwam-theme');
  if (saved === 'dark' || saved === 'light') document.documentElement.setAttribute('data-theme', saved);
} catch {
  // No stored preference available; the media query decides.
}

render();
