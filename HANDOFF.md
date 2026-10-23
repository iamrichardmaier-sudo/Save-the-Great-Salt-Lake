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

## Done, by the seven items in the brief

| # | Item | State | Where |
|---|---|---|---|
| 1 | Side-tables research | Done | `research/verification/results/tables.json` (89 rows, written by `research/verification/tools/tables_records.py`). Decisions in `decisions.json`. CONSUMERS sums to 2,387 KAF; `mi_depletion` 328 → 354.4 and `charge_base` 1,912 → 1,938.4. The area curve is the USGS 2023 table; `inflow_efficiency` 1.03 → 0.933. `npm run verification` rebuilds `src/verification.ts` (`VERIFICATION`, `TABLE_VERIFICATION`). |
| 2 | Failing tests, plus new coverage tests | Done | 204 pass. The header-summary test still fails, as it did before this work. New tests: every coefficient has a verdict and a checked date; every confirmed or corrected record has a quote and a locator. The schedule test asserts that the default package meets the goal, and that a weaker package reports `meetsGoal=false` with its shortfall. |
| 3 | Index tab | Done | Verdict, Locator and Quote columns, with source links and the old value for each correction; a section listing every side-table row |
| 4 | `research/findings.md` | Done | Verified, corrected (old → new, with effect), unsupported and no-evidence lists, plus the caveats |
| 5 | Rerun and before/after | Done | `research/budget-schedule.csv` and `research/dependencies.json`. `research/correction-effects.json` holds the effect of each correction (`npm run effects`); `research/goal-search.json` holds the goal search. README updated. |
| 6 | Research report | Done | https://claude.ai/artifact/Nps2hg3JcK3B1Fop79PtkA, mirrored in `research/report.md`. See the section order below. |
| 7 | Ship | Done, except the republish | tsc clean; vitest as above; check-links clean apart from the exceptions below. Screenshots are in `research/screenshots/`. Pushed. The hosted model could not be republished: the link returns "artifact not found" for this account. |

The report's sections follow item 6 of the brief, in this order:
1. Headline findings, including the missed goal
2. Every number (value, units, verdict, old → new, locator, quote, source), with the side tables
3. Assumptions with evidence
4. Effect on results
5. Connection map
6. Sources

The goal search was a later decision. The owner chose to keep $100M a year and do everything possible within the dial ranges, and to keep the resulting package as the default. The package is defined in `scripts/goal-search.ts`, `DEFAULT_DIALS` in `src/model.ts`, and the policy coefficients in `src/data.ts`. The pre-correction package is kept in `research/pre-correction-package.json`.

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
