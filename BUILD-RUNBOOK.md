# Build runbook — Great Salt Lake app rebuild

Four Claude accounts, one Lovable shell, a few days. Work the steps in order. Each prompt is
copy-paste ready.

**The rules that keep four accounts from colliding:**

1. Nobody edits a file outside the directories they own.
2. Nobody edits `package.json`. Every dependency is added in Step 2.
3. Nobody edits `src/data.ts`, `src/model.ts`, `src/lake.ts` or `src/simulate.ts` except Stream A.
4. Every view reads the current year from the shared store. No view owns its own clock.
5. No coefficient is ever hard-coded in a view. Read it from `data.ts`.
6. Each stream works on its own branch and merges to `integration`, never to another stream.

**Critical path:** Step 2 → Stream A → everything else. A is the only stream others depend on, so
start it first and keep it unblocked.

**If time runs short**, each stream below has a MUST SHIP section and an IF TIME section. Ship the
first before touching the second. A working app missing the 3D lake beats four broken features.

---

## Step 1 — Lovable design shell

Only a design reference comes out of this. No app logic, no model, no data. Keep it cheap: one
prompt, one screen, then stop. Screenshot it, export the CSS, and we lift the look.

> Build a single static landing screen for a water-policy simulator called **Great Salt Lake
> Allocation Model**. Design only — no state, no interactivity, no backend, no routing.
>
> One page containing: a header with the title and a one-line subtitle; a left panel with eight
> labelled slider controls and a primary button reading "Guided walkthrough"; a main area with
> three empty card placeholders captioned "Charts", "Map" and "3D Lake"; a bottom bar with a year
> scrubber from 2027 to 2055, a play button, and two small callout chips, one green reading
> "Biggest gain" and one amber reading "Biggest cost".
>
> Visual direction: serious policy tool, not a dashboard template. Mineral palette — lake blues,
> salt and alkali neutrals, a warm accent for warnings. Serif for large numbers, clean sans for
> interface text. Generous spacing, restrained borders, no heavy drop shadows. Must work in light
> and dark, and must read at phone width.
>
> Stop after this one screen. Do not add pages or features.

**Then:** screenshot it light and dark, and copy the generated CSS custom properties — colours,
font stack, spacing scale, radii. That is the handoff into Step 2.

---

## Step 2 — Foundation commit (do this before any stream starts)

Hand this to any account, or to me. **Nothing else can start until it lands.**

> You are setting up a shared foundation so four Claude accounts can build in parallel on this
> repository without colliding. Work on branch `integration`, branched from the current head.
>
> Read `src/data.ts`, `src/model.ts` and `src/simulate.ts` first to learn the existing types. Do
> not modify them.
>
> Create these files and nothing else:
>
> **`src/app-state.ts`** — one shared store, plain TypeScript, no framework. It holds: the current
> `Dials`, the current `PkgResult`, the current year index, playback state (`playing`, `speed` in
> seconds per year), and the selected persona id. It exposes `getState()`, `setState(partial)`,
> and `subscribe(fn)` returning an unsubscribe function. Changing the dials re-runs `pkgModel` and
> notifies subscribers. Keep it under 150 lines.
>
> **`src/contracts.ts`** — the interfaces every view implements, so nobody invents their own:
> `interface View { mount(el: HTMLElement): void; update(state: AppState): void; destroy(): void }`,
> plus `YearSnapshot` (one year of the path), `CountyAllocation` (`{ countyFips, countyName,
> acresRetired, afFreed, year }`), `Persona`, and `ShadowPrice` (`{ constraintId, label,
> objectiveGainPerUnit, unit }`). Types only, no logic.
>
> **`src/ui/theme.css`** — design tokens as CSS custom properties. I will paste values from a
> design reference; until then use the existing palette in `src/styles.css`.
>
> **`STREAMS.md`** — a short table of who owns which directories, copied from the runbook.
>
> Create empty directories with a one-line `README.md` in each stating the owner:
> `src/solver/`, `src/ui/wizard/`, `src/ui/controls/`, `src/ui/charts/`, `src/ui/map/`,
> `src/ui/lake3d/`, `src/personas/`.
>
> Add every dependency now so nobody edits `package.json` later:
> `three@0.170.0`, `topojson-client@3.1.0`, and dev types for both. d3 is already present.
>
> Write a test for the store: subscribing, setting dials re-runs the model, unsubscribe works.
> Run `npm test` and `npx tsc --noEmit`. Both must pass. Commit and push `integration`.

---

## Step 3 — Stream A, prompt 1: the solver

Account 1. Branch `stream-a-solver`. **Owns `src/solver/*`. May extend `src/model.ts` and
`src/simulate.ts`.**

> You are building the optimisation solver for a water-policy model. Branch from `integration`.
>
> Read `src/model.ts`, `src/simulate.ts` and `src/contracts.ts` first. The existing `optimise()`
> in `simulate.ts` is a random search — it finds a good combination but cannot say what any
> constraint is worth. That is what you are fixing.
>
> Create `src/solver/solve.ts` exporting:
>
> - `type Objective = { id: string; label: string; direction: 'max' | 'min'; measure: (r: PkgResult) => number }`
>   with a registry of objectives: water to the lake, farm utility retained, farmland kept, total
>   economic surplus, weakest-group political support, and years to reach the healthy range.
> - `type Constraint = { id: string; label: string; dialKey: keyof Dials | null; measure: (r: PkgResult) => number; bound: number; sense: '<=' | '>=' }`
> - `solve(objective, constraints, opts)` — searches the dial space for the best feasible setting.
>   Start from the existing random search, then add a local refinement pass that hill-climbs each
>   dial in turn. Deterministic for a given seed.
> - `shadowPrices(objective, constraints, opts): ShadowPrice[]` — for each binding constraint,
>   relax its bound by one unit, re-solve, and report the change in the objective. This is the
>   number the interface shows as "one more unit here buys you this much".
> - `isFeasible(objective, constraints)` — returns false with a reason when no setting satisfies
>   every constraint, so the interface can say so plainly instead of showing a bad answer.
>
> MUST SHIP: `solve`, `shadowPrices`, `isFeasible`, and tests covering determinism, that `solve`
> never returns an infeasible result, that a slack constraint has a shadow price near zero, and
> that a binding one does not.
>
> IF TIME: a `tradeoffCurve(objective, constraint, range)` returning objective value across a
> sweep of one constraint's bound, for plotting.
>
> Do not touch any file under `src/ui/`. Run `npm test` and `npx tsc --noEmit` before pushing.

---

## Step 4 — Stream A, prompt 2: county allocation

Same account, after Step 3 lands. **Other streams are waiting on this — do it promptly.**

> Continue on `stream-a-solver`.
>
> The model reports total acres leaving irrigation each year but not *where*. The map needs that.
>
> Create `src/solver/counties.ts` exporting `allocateByCounty(result: PkgResult): CountyAllocation[]`
> — one row per county per year, matching the `CountyAllocation` type in `src/contracts.ts`.
>
> Allocation rule, in this order: water is taken cheapest-delivered-first, and within that the
> lowest-value ground sells first. Distribute each year's retired acres across the Great Salt Lake
> basin counties in proportion to their irrigated hay acreage, weighted so lower-value ground goes
> first. Use the basin counties already named in `src/data.ts`; if county-level acreage is not in
> the data, add it there as new coefficients with a `basis` field saying exactly where each figure
> came from, following the existing pattern. Never invent a figure without recording its basis.
>
> Export `BASIN_COUNTIES` with FIPS codes so the map can join to boundary data.
>
> Add a test that total allocated acres equals the model's total for every year, and that no
> county is ever allocated more acreage than it has.
>
> Push and tell the other streams it is ready.

---

## Step 5 — Stream B, prompt 1: expert mode

Account 2. Branch `stream-b-input`. **Owns `src/ui/controls/*` and `src/ui/wizard/*`.**

> You are building the control panel for a water-policy simulator. Branch from `integration`.
>
> Read `src/contracts.ts`, `src/app-state.ts` and `src/ui/controls.ts` (the existing control
> definitions — reuse them, do not rewrite them).
>
> Build `src/ui/controls/panel.ts`, a `View` per `src/contracts.ts`: every dial on one page, grouped
> as they are now. Each control reads its current value from the shared store and writes back on
> change. Each shows its label, current value, and the existing "does nothing yet" hint where a
> dial is inert.
>
> Add to each control a **star toggle** that marks it as a constraint rather than a free variable.
> A starred control records a bound. Store the starred set in the shared store.
>
> MUST SHIP: every dial working, starring working, state round-tripping through the store.
>
> IF TIME: beside each starred control, a small readout of its shadow price from
> `src/solver/solve.ts` — "relax this by one unit and the objective improves by X". Wait for
> Stream A to land before attempting this.
>
> Style from `src/ui/theme.css` tokens only. No hard-coded colours. Must work at phone width.
> Do not touch files outside `src/ui/controls/`.

---

## Step 6 — Stream B, prompt 2: the guided walkthrough

Same account, after Step 5 ships.

> Continue on `stream-b-input`. Build `src/ui/wizard/wizard.ts`, a `View`.
>
> A question-at-a-time flow, each question depending on the last answer.
>
> **Question 1 — "What is your main objective?"** Four cards, each with a one-sentence
> explanation:
> - *Protect farmers* — minimise farm income lost and farmland retired, while still moving water
>   to the lake.
> - *Save the lake by the Olympics* — reach the healthy range by 2034, whatever it costs.
> - *Share the pain* — spread the burden as evenly as possible across farms, cities and industry.
> - *Economic maximisation* — maximise total economic surplus across every sector.
>
> Each maps to an `Objective` from `src/solver/solve.ts`.
>
> **Subsequent questions** walk the remaining dials one at a time. For each, the user chooses
> maximise, minimise, or constrain — and if constrain, sets the bound on a slider.
>
> **After each answer**, show a small panel with the current best solution, and the shadow price of
> the tightest constraint phrased plainly: "Budget is what's holding you back. Another $50M a year
> would get you X more." Include a small chart of objective against that constraint's bound if
> Stream A's `tradeoffCurve` exists; otherwise just the number.
>
> If the chosen combination is infeasible, say so immediately and name which constraint makes it
> impossible. Do not show a bad answer silently.
>
> MUST SHIP: question 1, the dial questions, writing the result back to the shared store.
> IF TIME: the per-step charts and the running tips.
>
> Do not touch files outside `src/ui/wizard/`.

---

## Step 7 — Stream C, prompt 1: charts on the year cursor

Account 3. Branch `stream-c-analysis`. **Owns `src/ui/charts/*` and `src/ui/map/*`.**

> You are building the analysis views. Branch from `integration`.
>
> Read `src/contracts.ts`, `src/app-state.ts` and the existing `src/ui/charts.ts` — reuse those
> drawing functions, do not rewrite them.
>
> Build `src/ui/charts/panel.ts`, a `View` showing: lake elevation over time with the
> tenth-to-ninetieth uncertainty band and the healthy range shaded; budget split across the seven
> instruments; water delivered by lever, stacked; political support by group; and the economic
> effects. All from the current `PkgResult` in the store.
>
> **The year cursor is the point of this step.** Every chart marks the store's current year — a
> vertical rule on time series, a highlighted bar elsewhere — and updates on every store change.
> Charts never advance themselves.
>
> Also build `src/ui/charts/playback.ts`: the year scrubber, a play/pause button, and a speed
> control. **Default two seconds per year, with faster and slower presets.** Twenty-nine years at
> ten seconds each is five minutes, which is far too long to hold an audience.
>
> Add `src/ui/charts/highlights.ts`: for the current year, diff against the previous year, rank the
> changes by magnitude, and return the single biggest improvement and the single biggest harm, as
> plain sentences with their numbers. Compute from the model's own fields — never hand-written copy.
>
> Style from `src/ui/theme.css` only. Must read in light and dark, and at phone width.

---

## Step 8 — Stream C, prompt 2: the county map

Same account, after Step 7 ships and Stream A's `counties.ts` has landed.

> Continue on `stream-c-analysis`. Build `src/ui/map/map.ts`, a `View`.
>
> **Use d3-geo with a local TopoJSON of Utah counties. No tile server, no API key, no network
> calls at runtime.** Commit the TopoJSON under `src/ui/map/` — Utah counties only, simplified.
>
> Show the Great Salt Lake basin counties, shaded by how much irrigated farmland has been retired
> by the store's current year, joining on FIPS from `BASIN_COUNTIES`. The lake itself is drawn at
> the current year's elevation.
>
> Hovering a county gives acres retired, acre-feet freed, and jobs affected, for that year.
>
> Somewhere permanent and legible, state that the county distribution is modelled from cost and
> land-value ordering, not a prediction of which individual farms will sell — some farmers will
> not sell at any price. Do not bury this in a tooltip.
>
> MUST SHIP: counties, shading, the year cursor, the uncertainty note.
> IF TIME: an animated transition as the year advances.
>
> Visual register: approachable and natural, warmer than the charts.

---

## Step 9 — Stream D, prompt 1: the synthetic population

Account 4. Branch `stream-d-experience`. **Owns `src/personas/*` and `src/ui/lake3d/*`.**

> You are building a synthetic population for a water-policy simulator. Branch from `integration`.
>
> **Read this constraint first and do not work around it.** You are not scraping social media or
> forums. People who post about water policy online are not a representative sample, and
> presenting them as one would be indefensible. You are also not generating invented quotes from
> any real named person. Officials appear only through their actual published statements, cited.
>
> Instead, build a synthetic population from the real polling already in `src/data.ts` and
> `src/sources.ts`. Read `STAKEHOLDERS` and the polling coefficients — incentive versus penalty
> preference, rural and urban concern, partisan intensity, willingness to pay.
>
> Create `src/personas/population.ts`:
> - `generatePopulation(n = 100, seed): Persona[]` — personas weighted to basin county population,
>   each with county, occupation (farm, municipal, industry, other), party lean, household water
>   use, and an attitude vector sampled from the polled distributions. Deterministic for a seed.
> - `reactTo(persona, result: PkgResult): { stance: number; reasons: string[] }` — how this persona
>   fares under the scenario, computed from the model: did their ground get retired, did their
>   water bill rise, did the dust near them clear. Stance follows from effects, not from a vibe.
>
> Create `src/personas/vignette.ts`: turn a persona plus their effects into two or three plain
> sentences. Assemble from the computed effects — no invented biography, no invented quotes.
> Every vignette carries a visible label that it is a modelled illustration, not a real person.
>
> Create `src/personas/panel.ts`, a `View`: aggregate support, and clicking into individual
> personas to read their situation. Proportional to population.
>
> Test that the population is deterministic for a seed, that aggregate stance tracks the model's
> existing support scores, and that no persona is generated with a real person's name.

---

## Step 10 — Stream D, prompt 2: the 3D lake

Same account, after Step 9 ships. **This is the single largest item in the build. If the deadline
is close, leave it — everything else must land first.**

> Continue on `stream-d-experience`. Build `src/ui/lake3d/lake.ts`, a `View`, using three.js
> (already installed).
>
> A low-poly, slightly gamified three-dimensional Great Salt Lake. Deliberately more playful than
> the charts, but every number real.
>
> - Water surface at the store's current year's elevation, **tweened** between years rather than
>   jumping.
> - Terrain from the area–elevation relationship already in `src/lake.ts` — as the level rises, the
>   shoreline moves correctly, because `areaSqMi(ft)` says where it goes.
> - Farmland blocks around the edge, thinning as acreage retires.
> - Wildlife markers increasing as the lake approaches the healthy range.
> - An evaporation readout for the current level, computed from the model, not animated decoration.
> - **The uncertainty band must survive into this view**: draw the median level solid and a
>   translucent ghost surface at the tenth and ninetieth percentiles. A single confident water
>   level would hide the honest part of the model.
>
> MUST SHIP: water at the right level, moving correctly with the year, evaporation readout.
> IF TIME: farmland, wildlife, ghost surfaces, happy and sad face markers.
>
> Keep it performant — this must not stall on a laptop. Dispose geometries on `destroy()`.

---

## Step 11 — Integration

One account, or me. After streams land.

> Merge `stream-a-solver`, `stream-b-input`, `stream-c-analysis` and `stream-d-experience` into
> `integration`, in that order, resolving conflicts in favour of the owning stream.
>
> Build the app shell in `src/main.ts`: left panel for input (expert mode, with the walkthrough
> button), main area switching between the three output views, playback bar across the bottom
> driving all of them from the shared store.
>
> Verify: `npm test`, `npx tsc --noEmit`, `npm run build` all clean. Then open every view at
> desktop and phone width in both themes and check for console errors, sideways scroll and
> clipped chart labels.
>
> Confirm the one thing that matters most: **moving the year cursor updates every view at once.**
> If the charts, the map and the 3D lake ever disagree about what year it is, the app is broken
> however good each one looks alone.

---

## Honest note on the deadline

In days, with four accounts, the realistic landing zone is: solver, expert mode, charts with
playback, map, and personas. The guided walkthrough and the 3D lake are the two most likely to
slip, and they are the two most visible — so if you want either one guaranteed, say so now and I
will move it earlier and cut something else instead.
