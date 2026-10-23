# 2B.2 Our assumptions regarding river inflow, the targets and lake response

We assume the lake receives 1,665 KAF a year of river inflow today, starts at 4,189.7 ft, and needs 800 KAF a year more to reach the bottom of its healthy range by 2055. Of these, inflow matters most: moving it across its plausible range shifts the 2055 lake by 1.90 ft. The targets come straight from the state; the speed at which the lake responds is fitted to the state's own simulations.

## River inflow now

**What we assume.** 1,665 KAF a year, the average for 2000–2025. **Basis.** The state's 2026 summary: "Between 2000 and 2025, inflows averaged 1,665 KAF per year" ([Great Salt Lake Strike Team, 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf)). **Verdict:** confirmed; range 1,500 to 1,850 KAF.

The choice of baseline matters a great deal, so we also run three alternatives, scaled from the US Geological Survey's gauges on the Bear, Weber and Jordan rivers ([U.S. Geological Survey, 2025](https://waterservices.usgs.gov/nwis/dv/?format=rdb&sites=10126000,10141000,10170490&parameterCd=00060&statCd=00003)). Because the gauges miss smaller and ungauged inflows, we use only their ratios to the 2000–2025 average, never their totals.

| Baseline | Inflow (KAF a year) | Level the lake settles at with no package (ft) | Water needed to reach 4,198 ft (KAF a year) |
| --- | --- | --- | --- |
| Driest recent decade, 2013–2022 (0.86 × average) | 1,432 | 4,186.32 | +1,027 |
| 2000–2025 average (our default) | 1,665 | 4,190.93 | +794 |
| Full gauged record, 1950–2025 (1.37 × average) | 2,281 | 4,196.81 | +178 |
| Warming trend (0.82 × average) | 1,365 | 4,185.09 | +1,094 |

The full gauged record is much wetter than this century, which is why we do not use it as the default. The warming case assumes about 4.7 °F of warming at 3.8% less streamflow per degree, the dry end of published sensitivity ([University Corporation for Atmospheric Research, 2013](https://news.ucar.edu/10534/rising-temperatures-challenge-salt-lake-citys-water-supply)).

## Where the lake starts

**What we assume.** 4,189.7 ft, the level at the end of water year 2026, on 30 September 2026. **Basis.** The US Geological Survey's daily record at Saltair shows 4,189.7 ft (provisional) on that date, against 4,191.1 ft a year earlier ([U.S. Geological Survey, 2026a](https://waterservices.usgs.gov/nwis/dv/?format=json&sites=10010000&parameterCd=62614&startDT=2025-09-01&endDT=2026-10-23)). Our plan starts in 2027, so the end of water year 2026 is the right starting point. **Verdict:** corrected from 4,191.1 ft. The lake starts below the 4,190 ft serious-harm level.

## The targets

**What we assume.** A healthy range of 4,198 to 4,205 ft, and a serious-harm level of 4,190 ft. **Basis.** The state determined "that the healthy range of the lake for both human and ecological interests is between 4,198 and 4,205 feet above sea level", and asks for a contingency plan "to keep the South Arm of the lake from falling below 4,190 feet ... to avoid serious adverse effects" ([Office of the Great Salt Lake Commissioner, 2024](https://greatsaltlake.utah.gov/wp-content/uploads/Great-Salt-Lake-Strategic-Plan.pdf)). The state's plan and the Strike Team also describe serious adverse effects below 4,192 ft, so our 4,190 ft is the more lenient of the two published floors. **Verdict:** confirmed.

## The goal

**What we assume.** 800 KAF a year of added inflow, and a goal level of 4,198.5 ft: the bottom of the healthy range plus half a foot of margin. **Basis.** The state's simulations describe "Additional 800 KAF/year inflow to the lake from water conservation or other sources. This scenario represents the additional inflow needed to fill Great Salt Lake to the minimum healthy lake level (4,198 feet) by 2055" ([Great Salt Lake Strike Team, 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf)). It is computed as the needed mean inflow of about 2,465 KAF less the 1,665 KAF average, the same baseline our model uses. In our model, 800 KAF a year holds the lake at 4,198.04 ft. Depending on the climate assumed, the state's range runs from 471 to 1,055 KAF. **Verdict:** corrected from 875 KAF, a figure that appears in no source.

## How fast the lake responds

**What we assume.** Each year the lake closes 17% of the gap between its level and the level its inflow would hold. **Basis.** The state's simulations find that "an additional 800 KAF/year of inflow results in a 2034 mean elevation of 4,196.9 feet and a long-term mean elevation of 4,198.0 feet" ([Great Salt Lake Strike Team, 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf)). Re-run in our model's balance from 4,191.0 ft in October 2025, a speed of 0.17 gives 4,196.87 ft in 2034; a speed of 0.12 would give 4,195.93 ft, a foot too slow. **Formula.** For a first-order approach to equilibrium, the share of the gap remaining after n years is (1 − k)ⁿ; fitting the state's 2034 figures gives k between 0.15 and 0.21, centred near 0.17.

**The analogue.** Mono Lake in California is the closest case of a saline terminal lake given a legally mandated rise in inflow. In 1994 the state water board set a target level of 6,392 ft and determined "that the lake should reach the target lake level within 20 years", based on hydrologic models. By December 2022 the lake stood at about 6,378 ft and had not exceeded 6,384 ft since the decision ([California State Water Resources Control Board, 2023](https://waterboards.ca.gov/waterrights/water_issues/programs/mono_lake/docs/2023-mono-lake-fact-sheet.pdf)). The board's 20-year expectation corresponds to a response speed of about 0.12, and the lake has been slower still. We rate it 4: the same mechanism, but Mono Lake is far smaller and deeper, with a single diverter and a court-ordered remedy. **Verdict:** corrected from 0.12; labelled an assumption, with a range of 0.12 to 0.22. It moves the 2055 lake by 0.17 ft. Mono Lake's slow recovery is a warning that our timing could prove optimistic.
