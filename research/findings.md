# What was checked, and what did not check out

This records verification done against primary sources, separately from the model itself. It is
deliberately a short, honest list rather than a long one: it says what was actually opened and
read in this session, not what could be.

## Every cited link resolves

`npm run check-links` re-fetches all 19 sources. All return 200. One redirects (the USGS Utah
Water Science Center moved), and the link still works.

Two URLs taken from the specification were dead and have been replaced with working primary
sources:

| Source | Was | Now |
|---|---|---|
| Utah DWR regional conservation goals | `water.utah.gov/conservation-goals/` — 404 | [Utah's Regional M&I Water Conservation Goals (2019)](https://conservewater.utah.gov/wp-content/uploads/2021/05/Regional-Water-Conservation-Goals-Report-Final.pdf) — 200 |
| Utah Workforce Services industry data | `jobs.utah.gov/wi/data/library/industry/index.html` — 500 | [DWS Workforce Information update](https://jobs.utah.gov/wi/update/index.html) — 200 |

## The lawn figures do not reconcile with their source

This is the one substantive disagreement found between the specification and a primary document.

The model's landscaped-area figure of 6,938 sq ft per home is attributed to the state's regional
survey, quoted as 5,154 sq ft landscaped on a 10,300 sq ft lot in Salt Lake and 8,868 on 16,073 in
Bear River.

Table 4-9 of the 2019 Regional Goals report, opened and read, gives instead:

| County | 2015 average lot | 2015 landscaped area per lot |
|---|---|---|
| Salt Lake | 8,463 sq ft | 4,239 sq ft |
| Box Elder | 15,264 sq ft | 8,759 sq ft |
| Cache | 12,805 sq ft | 7,770 sq ft |
| Rich | 20,150 sq ft | 10,075 sq ft |

Both sets treat landscaping as almost exactly half the lot, so the method agrees. But the
published figures are about a fifth lower, and the population-weighted basin figure from the table
is nearer 5,100 sq ft than 6,938.

**Why this matters, and why the figure was not simply replaced.** The lawn model is a chain of
three numbers: homes with a lawn, landscaped area each, and the reported water those lawns use.
Any two of them imply the third. At 6,938 sq ft the chain gives 41 inches of water a year, which
is a plausible over-watering depth against a turf requirement near 30 inches. Substituting the
published 5,100 sq ft gives about 56 inches, which is implausibly deep.

So one of the three is inconsistent with the other two, and the arithmetic cannot say which. The
candidates are the household count, the landscaped area, and whether the reported 408.5 KAF is
water *delivered* or water *depleted* — a distinction the specification itself flags as
unresolved. The model keeps the original value, records this note against it wherever the number
appears, widens the sensitivity range to cover the published figure, and drops the confidence to
low. The risks tab shows how far the result moves across that range.

## Figures confirmed in the Strike Team report

Read directly from [Great Salt Lake 2025: Data and Insights](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2025/01/GSL-Jan2025.pdf):

- the lake's elevation categories — healthy, transitionary, adverse and serious adverse — and the
  4,198 ft figure;
- human depletion by type from 1989 to 2023, with agriculture the large majority of it;
- the conservation scenarios framed as filling to 4,198 ft over 5, 10 and 30 years;
- the statement that total depletions show no long-term trend across the last 30 years.

## The evaporation balance reproduces the published simulations

Not a source check but a model check, and the most important one: the closed-basin balance
reproduces the published equilibrium elevations within 0.6 ft at 0, 250 and 800 KAF of added
inflow. A test fails if that drifts.

Two things the tests corrected along the way:

- **Above 4,200 ft the published area anchors imply the lake spreads more slowly per foot**, so
  "each foot costs more than the last" holds below that elevation and not above. That is in the
  source data, not an artifact of the model, and no policy in the model reaches it.
- **Which constraint binds depends on the lease price.** The headline finding that money is not
  the binding constraint needs a charge or a penalty holding that price down. Without one, a small
  budget binds on money, not on willing sellers. Both regimes are now pinned by tests, and the
  header text on the page says which one the current settings are in.

## Wage per job checked at source

The $65,800 a job-year used to value the jobs the budget creates matches Workforce Services
Table 19 (State Total, 2024): $114,975,453,440 in total wages over 1,747,330 average jobs is
$65,801, and the table's $5,483 average monthly wage times twelve is $65,796.

## Not verified

Stated plainly, because an unchecked number presented as checked is worse than an admitted gap.

- The great majority of coefficients carry the value given in the specification and a source
  reference, but the specific passage behind each value was not re-read in this session. The link
  check confirms the source exists and resolves; it does not confirm the figure is in it.
- No empirical analogue has been attached to any behavioural assumption. The assumptions tab lists
  all of them and marks which have supporting material and which have nothing at all, rather than
  implying support that does not exist.
- The 2026 polling figures and the willingness-to-pay study were not read at source; their links
  resolve and are cited as reported.
