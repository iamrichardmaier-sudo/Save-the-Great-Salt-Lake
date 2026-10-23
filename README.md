# Utah Water Allocation Model

An interactive model of what $100M a year can do for the Great Salt Lake.

Every figure on screen is computed from the dials when you move them — nothing is a stored
scenario — and every figure can be clicked to see where it came from: its basis, its plausible
range, whether it is a published number or an assumption, and a link to the source.

```bash
npm install
npm run dev          # the model, at http://localhost:5173
npm test             # model and render regression suite
npm run check-links  # re-fetch every cited URL
npm run build        # production bundle in dist/
```

## What it is

The brief: allocate $100M a year to meet Utah's water conservation goals, weigh water against the
revenue it currently produces, restore the Great Salt Lake to a healthy level, and do it in a way
every affected party can live with. Scope is the Great Salt Lake basin — the Bear, Weber and
Jordan drainages.

Fifteen tabs, in two groups. **The plan**: where we are, where we need to be, getting there year
by year, levers and budget, and the first-through-third-order impacts. **Detail**: crop transition,
residential lawns, drivers and growth, value of water, legal assumptions, risks and weaknesses,
simulations, baselines, calibration, and a full index of sources, assumptions and constraints.

## How it is built

| File | What it holds |
|---|---|
| `src/data.ts` | Every coefficient, each with a `basis` naming its source or saying plainly that it is an assumption, plus the range the sensitivity sweep explores. |
| `src/sources.ts` | Every source, with a URL. Nothing else carries a URL, so the link checker has one list. |
| `src/lake.ts` | The physical core: a closed-basin evaporation balance. |
| `src/model.ts` | The package model. Pure: no DOM, no globals, no clock. |
| `src/simulate.ts` | Stochastic inflow sequences, the sensitivity sweep, and the optimiser. |
| `src/ui/` | Formatting with provenance, d3 charts, dials, and the tabs. |

Two rules hold the thing together. **No numeral is typed into any sentence**: every figure in
every line of prose is read from the model or from `data.ts` and rendered through a helper that
attaches its provenance. And **the page is a pure function of the dials**, so a number can never
disagree with the model that produced it.

## The physical core, first

The lake is a closed terminal basin. There is no outlet, so evaporation is the only way water
leaves and the lake settles where inflow matches what evaporates off its own surface. A bigger
lake has more surface and evaporates more, so each foot of recovery costs more water than the one
below it.

The balance is validated against the published equilibrium elevations before any policy lever
exists: `npm test` fails if it drifts more than 0.6 ft from them. That is what lets the model
extend past the published range instead of drawing a straight line through it.

One consequence worth stating: the evaporation figure usually quoted describes today's shrunken
lake. Restoring it raises its own evaporation by roughly 760 KAF a year, which is why refilling
takes far more water than the current shortfall suggests.

## What the model says

- **Money is not the binding constraint, but only once something holds the price of a water right
  down.** With a scarcity charge in place, eight times the budget buys a few per cent more water
  and past roughly $400M a year it buys nothing at all: willing sellers and shepherding capacity
  bind first. Without a charge, a small budget binds on money. Both regimes are pinned by tests.
- **A sixfold change in the lease elasticity moves the lake by exactly zero acre-feet** while the
  price swings by a factor of six. When a quantity ceiling binds, the price the last acre-foot
  would have fetched is irrelevant.
- **Pricing non-compliance converts coercion into transactions.** Priced at what the water is
  worth in the lake, a mandate's penalty widens the willing-seller market instead of narrowing it:
  forced acquisition falls sharply, voluntary purchases rise, the price paid collapses, and
  support goes up rather than down.
- **A watering ordinance is an enforcement-budget question, not a penalty-schedule question.**
  Quadrupling the fine buys a few points of compliance; multiplying the citation rate buys dozens.
  Ordinances are almost always written the other way round.
- **Hay earns about $245 per acre-foot depleted and the same water is worth about $2,440 in the
  lake**, which is the entire economic case and why the package takes water from there.
- **Data centres and the lake are not competing for the same water.** Every announced industrial
  project together needs a small fraction of what this package moves.

## Checking it

`npm test` runs the regression suite:

- the evaporation balance against the published elevations, and the area–elevation inversion;
- twelve arithmetic identities — levers sum to the total, the budget sums, gross less losses
  equals net, benefit equals water times value, jobs gained less lost equals net, units are
  consistent, the implied population is plausible — each re-run at nine different dial settings;
- every tab rendering and mounting at six dial settings, with no `NaN` and no unresolved template;
- every control moving the model, and every control that is inert at the defaults declaring it;
- the optimiser's search space matching the dials that exist, since drift between them is silent.

The same checks run live in the page: the pill at the bottom left re-runs them on every change and
turns red if any number stops adding up.

A browser pass additionally renders every tab at desktop and phone width in both themes and fails
on console errors, sideways scroll, or chart labels escaping their box.

## Where it is weakest

Stated here rather than left to a reviewer. The **risks and weaknesses** tab ranks them by how far
each moves the lake across its own range.

- **Willing-seller capacity** is the sharpest attack. Both the leasing and retirement ceilings are
  assumptions with no source, and they are the most leveraged numbers in the model. They should be
  replaced with actual enrolment in the state preservation programme.
- **The price of a water right** is unresolved: anchored to Colorado River buyouts and contradicted
  by Utah figures an order of magnitude lower.
- **Programme capacities are flat step functions.** Real conservation programmes have rising
  marginal cost; here the thousandth acre-foot costs what the first did and then the next dollar
  buys nothing.
- **The lawn figures do not reconcile with their source.** See `research/findings.md`.
- **Support scores are modelled, not surveyed.** The weights come from 2026 Utah polling; the
  scores themselves are the model's arithmetic over those weights and are labelled as such.

`research/findings.md` records what was checked against primary sources, what matched, and what
did not.
