# Hand-off: verifying every number in the model

Written 2026-10-23 so another person or AI can pick this up. Branch: `claude/clever-bardeen-unjgd2`.

## What the owner asked for

Re-check every number and assumption in the model against real sources, then link it all together:

1. **Exact citations in the model.** Each number carries a quote, a page or table, and the date it was checked.
2. **A shareable research report.** One row per number, with its verdict.
3. **A map of how the numbers connect.**
4. **Published evidence for every assumption.**

How mismatches are handled, as the owner chose:

- Fix the value.
- Rerun the optimiser and the year-by-year budget.
- Report old value → new value and the effect on the results.
- Cover all of about 120 numbers, highest-impact first.

Earlier in the same session, also done and pushed:

- A year-by-year budget that spends the full $100M every year (`src/schedule.ts`, `fullSpendSchedule`).
- The tab "5 · Budget, year by year".

## Done

| Step | State |
|---|---|
| Network | Open. Fetch with curl (it uses the proxy). The **WebFetch tool does not work** in this environment (no DNS). For Node `fetch`, set `NODE_USE_ENV_PROXY=1`; `npm run check-links` now does this. |
| Sources downloaded | 30 of 34 cited sources open. `finley_2020` and `irrigation_elasticity_meta` (Wiley) block bots, and two sites rate-limit. URL list: `research/verification/source-urls.tsv`. Re-download with curl, then `pdftotext -layout` or `research/verification/tools/totext.py`. |
| Priority ranking | `research/verification/rankings.json` ranks every coefficient by two measures: how far it moves the 2055 lake level, and how much it changes the budget's net economic value (NEV) across its range. Built on the optimised package `optimise(0.6, {seed: 424242})`. |
| How it connects | Done. `src/connections.ts`, the "How it connects" tab, `src/connections.test.ts`, and `npm run trace` → `research/dependencies.json`. |
| Wage per job | Checked at source: DWS Table 19, $65,801. Recorded in `src/data.ts` and `research/findings.md`. |
| Research batches | **5 of 8 finished and reviewed**: b1, b2, b3, b4, b6. Results are in `research/verification/results/*.json`. Still to do: b5, b7 and `tables`. |
| Review decisions | `research/verification/decisions.json`. Every accepted change, with the quote I re-checked at source myself. **Nothing has been applied to `src/data.ts` yet**, except the wage. |

### Accepted changes (from `decisions.json`), not yet applied

| id | old → new | range | basis (short) |
|---|---|---|---|
| goal_added | 875 → **800** | 471–1,055 | Strike Team Mar 2026 p.29: "Additional 800 KAF/year … to fill … (4,198 feet) by 2055" |
| response_k | 0.12 → **0.17** | 0.12–0.22 | Reproduces Strike Team 2034 projection (4,196.87 vs 4,196.9 ft) |
| lease_capacity | 200 → **130** | 70–300 | Lake trust leased 72,500 AF in 2025; state calls 132 KAF "herculean" |
| application_mean | 2.64 → **2.4** | 2.0–2.7 | NASS 2023 IWMS Table 39, Utah alfalfa |
| irrigation_net_value | 133 → **236** | 148–345 | Ag Optimization report Table B-8, $/AF depleted |
| hay_net_return | 175 → **305** | 60–445 | Table B-7 $355/acre less the $50 leasing cost |
| phrag_cost | 186 → **610** | 200–4,050 | DWR Aug 2025 M&I report p.81–82, which conflicts with a 2026 legislative slide ($200) |
| mi_reference_price | 380 → **640** | 450–2,200 | JVWCD 2026/27 wholesale median $639.92 |
| landscape_sqft | 6,938 → **5,785** | 4,200–9,000 | DWR 2019 Table 4-9, population-weighted |
| turf_need | 30 → **24** | 20–30 | Jackson & Mohadjer 2003 (display only) |
| lake_now | 4,191.1 → **4,189.7** | | USGS 10010000 on 2026-09-30 (provisional); 4,191.1 was the 2025-09-30 reading. Now below serious_low. |
| inflow_cv | 0.35 → **0.50** | 0.40–0.65 | Agent computed it from USGS Bear, Weber and Jordan daily flows; re-run before relying on it |
| deferred | mi_depletion (328 is in no source; ~354 proposed), charge_base (~1,938) | | Restructure together with CONSUMERS in the tables batch |
| ranges only | crop_cost 276–493; application_cv 0.25–0.6; phrag_lag 2–5; phrag_cap 17–57; ramp_years high 10; onfarm_cap 15–110; retire_capacity low 20; compliance_floor 0.05–0.55 | | see decisions.json |
| relabel to assumption | growth_draw_2055, urban_to_lake (range 0.1–0.45), streamflow_decline_2055, phrag_delivery | | no source states them |
| relabel | lake_value_per_af → **derived** (ECONorthwest $1.93B/yr ÷ ~790 KAF), low 600, high 3,600; baseline_inflow → **sourced** | | |
| caveats to report | evap_gross: confirmed, but collinear with precip_lake and inflow_efficiency, so its sensitivity swing is overstated. shepherd_start: confirmed, but much of it is in-lake mineral water rather than water delivered down rivers. | | |

## Left to do

1. **Finish research.** Batches b5, b7 and `tables` (the side tables, legal assumptions and source list) were still running when this was written. If their files aren't in `research/verification/results/`, re-run them:
   - Brief: `research/verification/brief.md`. Its paths point at a scratchpad that no longer exists; replace them with `research/verification/...`.
   - Inputs: `research/verification/batches/`.
   - Review every "corrected" record yourself against the source before accepting it, and add it to `decisions.json`.
2. **Apply the changes** (plan Step 3):
   - Add a `src/verification.ts` record per coefficient: verdict, checked date, source ids, locator, quote, arithmetic, previous value.
   - Update values, ranges and statuses in `src/data.ts`.
   - Add new sources to `src/sources.ts`. Only that file may hold URLs. New sources so far include the le.utah.gov interim slide, the JVWCD rates PDF, the GSL trust 2025 impact report, the NASS IWMS PDF, the DWR Aug 2025 M&I report, USGS OFR 78-912, the Audubon/ECONorthwest summary, and the NBER press release (URLs are in the results JSON).
   - Add verdict, locator and quote columns to the Index tab.
   - Rewrite `research/findings.md`.
   - Resolve the three coefficients nothing uses (`hay_depletion`, `farmer_compensation_low/high`): wire them in or delete them, then update `UNUSED_ON_PURPOSE` in `src/connections.test.ts`.
   - Tests: every coefficient has a verdict and checked date; every confirmed or corrected one has a quote and locator.
3. **Rerun** (Step 4):
   - Run `optimise(0.6, seed 424242)`, `fullSpendSchedule`, and `npm run schedule` and `npm run trace`.
   - Record before and after: 2055 lake level (currently 4,198.96 ft), first year the goal is met (2051), and NEV (currently $59.05B).
   - If the optimised package no longer reaches 4,198.5 ft, say so. Do not re-tune the policies without asking the owner.
   - Several corrections cut capacity (leasing) or raise costs (phragmites), so the goal may be missed.
4. **Report** (Step 6): write a shareable doc with headline findings, every number with its verdict, assumptions with evidence, the effect on results, the connection map, and sources.
5. **Ship:**
   - `npx tsc --noEmit`, `npx vitest run`. The header-summary test already fails on the base branch and is unrelated.
   - `npm run check-links`.
   - Screenshots of the Index and How-it-connects tabs.
   - Commit, push, and republish the hosted model.

## Useful facts

- The full plan is in the session's plan file. Its content is summarised above.
- Hosted model (owner's private artifact): https://claude.ai/artifact/1hnVUrv3zc6ovYZ1s4yafE. Rebuild with `npm run build`, then publish `dist/index.html` plus `dist/assets/*`.
- The appendix doc with the old budget tables (now out of date) is at https://claude.ai/artifact/DFaUFQ1pehjX5CtpSiz9ZD.
- Commands:
  - `npm test`
  - `npm run schedule`: year-by-year budget CSV
  - `npm run trace`: dependency map
  - `npm run check-links`
