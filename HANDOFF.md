# Hand-off: verifying every number in the model

Last updated 2026-10-23. Branch: `claude/clever-bardeen-unjgd2`. **The verification work is finished.** This file says what was done and what is still open.

## What the owner asked for

The owner asked for every number and assumption in the model to be re-checked at source, and for the results to be linked together:

- exact citations in the model;
- a shareable research report;
- a map of how the numbers connect;
- published evidence for every assumption.

How mismatches were to be handled:

- correct them;
- rerun the optimiser and the year-by-year budget;
- report old → new values and their effect.

Later, the owner added: keep $100M a year and do everything possible, within the existing dial ranges, to reach the goal by 2055.

## Result in one paragraph

With the corrected numbers, the plan as it stood fails:

- the old optimised package ends at 4,198.25 ft in 2055 and never meets the 4,198.5 ft goal;
- the old optimiser re-run on the new numbers gives 4,197.46 ft, with NEV $36.94B;
- before the corrections the plan reached 4,198.96 ft, first met the goal in 2051, and had NEV $59.05B.

A search over every policy dial (`npm run goal-search`) found a package that does meet the goal. It is now the default:

- the goal is first met in 2047 and held;
- the lake ends at 4,198.57 ft in 2055;
- NEV is $55.00B.

It needs several dials at the top of their ranges:

- a 1,200 KAF mandate floor, phased in over one year;
- a $400/AF crop levy above 1.5 AF an acre;
- repossession switched on;
- monitoring at $50M and phragmites removal at $25M.

The margin is under 0.1 ft, so each of these alone misses the goal:

- a 10% weaker mandate;
- no levy;
- no repossession;
- the pessimistic end of any of 33 uncertain numbers.

## Done

| Item | Where |
|---|---|
| Research records, all 102 coefficients | `research/verification/results/b1–b7.json` |
| Side tables and source list (89 rows) | `research/verification/results/tables.json`, written by `research/verification/tools/tables_records.py` |
| Reviewer decisions, each re-opened at source | `research/verification/decisions.json`. A decision can override the quote and locator when the reviewer re-derived the value. |
| Generated citations | `src/verification.ts` (`VERIFICATION` per coefficient, `TABLE_VERIFICATION` per table row) and `src/research-sources.ts`. Rebuild with `npm run verification`. |
| Values applied | `src/data.ts`. Every correction is listed with its effect in `research/findings.md`. |
| Lake area curve | Replaced with the USGS 2023 elevation-area table at one-foot steps. `inflow_efficiency` re-fitted from 1.03 to 0.933. |
| CONSUMERS restructure | Rebuilt from the Strike Team 2020–24 table; sums to 2,387 KAF. `mi_depletion` 328 → 354.4, `charge_base` 1,912 → 1,938.4. |
| Goal search and new default package | `scripts/goal-search.ts` → `research/goal-search.json`. Defaults are in `src/model.ts` (`DEFAULT_DIALS`) and the policy coefficients in `src/data.ts`. |
| Optimiser changes | See the next table. |
| Effect of each correction | `npm run effects` → `research/correction-effects.json`. The pre-correction package is kept in `research/pre-correction-package.json`. |
| Year-by-year budget | `npm run schedule` → `research/budget-schedule.csv` |
| Dependency map | `npm run trace` → `research/dependencies.json`; also the "How it connects" tab |
| Index tab | Verdict, Locator and Quote columns, with source links and the old value for each correction; a section listing every side-table row |
| Findings | `research/findings.md` |
| Report | Claude Doc: https://claude.ai/artifact/Nps2hg3JcK3B1Fop79PtkA, mirrored in `research/report.md` |
| Screenshots | `research/screenshots/`: Index and How-it-connects tabs, desktop (1280 px) and phone (390 px) |
| Tests | `npx vitest run`: 204 pass. The one failure, "header summary adapts when a lever is switched off", failed before this work began. |

Optimiser changes:

| Change | Why |
|---|---|
| Scores progress toward 4,198.5 ft by the horizon, not only net water | A package that delivers the goal too late should score lower |
| No longer moves the price of a water right | It is a market assumption, not a policy |
| Ignores watering asks under 5% | They trigger the lawn-fine flaw below |

## Still open

1. **Lawn module flaw.** `lawnModel` raises full fine revenue from any watering ask, however small, and that money buys rights. A 0.02% ask moved the 2055 lake by 0.6 ft. The optimiser and goal search now avoid it, but the module should scale fines with the ask.
2. **Owner decision.** Should the edge-of-range package stay the default, or should the page show a more cautious package and its gap? A comment asking this is in the report doc.
3. **VALUE_PER_AF rows still unsupported.** All agriculture, nuclear dry cooling, the data-centre rows, Meta, QTS and Tooele have no published water volume behind them.
4. **Pre-existing test failure.** The header-summary test still fails.
5. **Link check exceptions.**
    - earthref.org fails under Node fetch but returns 200 through curl.
    - Two Wiley sources block bots.
    - wateronline.com was briefly returning a server error (500).

## Useful facts

- **Network.** Use curl, which goes through the proxy. For Node `fetch`, set `NODE_USE_ENV_PROXY=1`; `npm run check-links` already does.
- **Hosted model.** https://claude.ai/artifact/1hnVUrv3zc6ovYZ1s4yafE. To republish, run `npm run build`, then publish `dist/index.html` plus `dist/assets/*`.
- **Commands:**
    - `npm test`
    - `npm run verification`
    - `npm run goal-search`
    - `npm run effects`
    - `npm run schedule`
    - `npm run trace`
    - `npm run check-links`
