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
npm run schedule     # the year-by-year budget, to research/budget-schedule.csv
npm run build        # production bundle in dist/
```

## What it is

The brief: allocate $100M a year to meet Utah's water conservation goals, weigh water against the
revenue it currently produces, restore the Great Salt Lake to a healthy level, and do it in a way
every affected party can live with. Scope is the Great Salt Lake basin — the Bear, Weber and
Jordan drainages.

Sixteen tabs, in two groups. **The plan**: where we are, where we need to be, getting there year
by year, levers and budget, the budget year by year, and the first-through-third-order impacts. **Detail**: crop transition,
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
| `src/schedule.ts` | The budget year by year: each year's money goes only where it still buys water. |
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
lake. Restoring it raises its own evaporation by roughly 850 KAF a year, which is why refilling
takes far more water than the current shortfall suggests.

The lake's area at each elevation comes from the USGS 2023 elevation-area table at one-foot steps
(Root, 2023). An earlier three-point straight line overstated the area by 9–15% in the range where
the goal sits.

## What the model says

- **On $100M a year the goal is reachable, but only at the edge.** Every number was re-checked at
  source in October 2026 (`research/findings.md`). With the corrected numbers the package the
  optimiser used to pick ends at about 4,197.5 ft in 2055 and misses the 4,198.5 ft goal (the
  healthy floor plus a half-foot margin); before the corrections it reached 4,199.0 ft by 2051. A
  search across every policy dial (`npm run goal-search`) finds a package that does reach it: the
  goal is first met in 2047 and held, ending at 4,198.6 ft. To get there it needs:
  - the mandate at the top of its range (a 1,200 KAF floor phased in over one year, taking only
    what voluntary levers miss);
  - the crop levy at its maximum, $400 per acre-foot above 1.5 AF an acre;
  - repossession switched on;
  - monitoring and phragmites removal at their caps.

  That package is now the default. It clears the goal by under a tenth of a foot, so a 10% weaker
  mandate, no levy, no repossession, or the pessimistic end of any of 33 uncertain numbers each
  miss it. More money barely helps: at $200M a year the lake reaches 4,198.7 ft.
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
- **Hay earns about $368 per acre-foot of irrigation water depleted and the same water is worth
  about $2,440 in the lake**, which is the entire economic case and why the package takes water
  from there.
- **Data centres and the lake are not competing for the same water, on what is known.** No
  announced project publishes an annual water volume. The model's allowance for all of them (an
  assumption) is a small fraction of what this package moves.

## The budget, year by year

Every year spends the whole budget; what the budget tab decides is where it goes. Each year's
money goes out in small amounts, each to the line that adds the most net economic value per dollar
through the horizon: water reaching the lake at its lake value, less the farm revenue and livestock
receipts it takes, plus the wages of the jobs the money creates. Lake-economy and farm field jobs
are left out of that sum because the lake value and lost farm revenue already count them. A
programme is never funded past its capacity; when every line's next dollar is poor value the money
still goes out, to the least poor, and the tab counts how much. The lake must still reach the
healthy floor plus a half-foot margin by the horizon and stay there; if the most economic split
fell short, water would be weighted more heavily until it did. Charges, levy, mandate and lawn
rules are not moved.

Built on the default package (the one the goal search chose), the most economic split meets the
goal on its own: first in 2047, ending at 4,198.6 ft in 2055. Monitoring is the largest line. Its
jobs count as value in their own right, and it raises how much acquired water can be shepherded to
the lake. Phragmites removal takes most of the rest in the early years, and water rights take it
once the charge revenue that pays for them winds down. `npm run schedule` writes the year-by-year
split to `research/budget-schedule.csv`.

`npm run effects` measures what each correction did by putting its old value back.

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
