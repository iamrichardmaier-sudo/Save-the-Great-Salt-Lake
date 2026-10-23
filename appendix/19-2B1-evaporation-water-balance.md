# 2B.1 Our assumptions regarding evaporation and the lake's water balance

The lake's water balance is the most sensitive part of our model. Gross evaporation alone moves the 2055 lake by 4.23 ft across its plausible range, precipitation on the lake by 2.88 ft and the closure factor by 1.50 ft, more than any lever. These are physical constants, not markets, so we explain them briefly. They were fitted together to reproduce the state's own simulated lake levels, which keeps the model honest even where any one of them is uncertain.

```latex
\text{area}(E) \times \underbrace{(3.77 - 1.25)}_{\text{net evaporation, 2.52 ft a year}} = \text{inflow} \times 0.933
```

## Gross evaporation

**What we assume.** The lake loses 3.77 ft of water a year from its surface, about 45 inches. **Basis.** The US Geological Survey's water budget for 1931–1976 found that evaporation "averaged 2.9 million acre-ft. The latter is equivalent to about 45 in. per year for the average lake level" ([Arnow, 1978](https://pubs.usgs.gov/of/1978/0912/report.pdf)). A later study put the mean saline evaporation depth for 1950–2010 at 1.14 m, about 3.74 ft ([Mohammed & Tarboton, 2012](https://hydrology.usu.edu/dtarb/Mohammed_Tarboton_2012WR011908.pdf)). The state's recent budget gives 2,733 KAF a year of lake evaporation over 1989–2024 ([Great Salt Lake Strike Team, 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf)), which over today's smaller area implies a lower depth of about 35 inches, while state planning documents cite estimates "ranging from 2,000,000 to 5,000,000 acre-feet per year" ([Utah Division of Water Resources, 2023](https://water.utah.gov/wp-content/uploads/2023/11/GSLBIP-Work-Plan-Appendix-J-FINAL.pdf)). **Formula.** 45 inches a year ÷ 12 = 3.75 ft; the model uses 3.77. **Verdict:** confirmed; range 3.4 to 4.1 ft.

## Precipitation on the lake

**What we assume.** 1.25 ft of rain and snow falls on the lake each year, 15 inches. **Basis.** The 1991–2020 normal at Salt Lake City airport is 15.52 inches ([Wikipedia, 2025](https://en.wikipedia.org/wiki/Climate_of_Salt_Lake_City)), and the USGS water budget implies about 14 inches on the lake. The western side of the lake is drier, so the lake-wide figure may be a little lower. **Formula.** 15 inches ÷ 12 = 1.25 ft. **Verdict:** confirmed; range 1.0 to 1.5 ft.

## The closure factor

**What we assume.** Only 93.3% of gauged river inflow acts on the open lake in the balance. **Basis.** This factor is derived: it is the value that best reproduces the state's published long-term mean lake levels for three inflow scenarios. Those are 4,191.1 ft with no added water, 4,193.7 ft with 250 KAF a year added and 4,198.0 ft with 800 KAF added ([Great Salt Lake Strike Team, 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf)). With a factor of 0.933 our model gives 4,190.93, 4,194.05 and 4,198.04 ft, a root-mean-square error of 0.23 ft. A factor below 1 means some gauged inflow does not reach the open lake. **Verdict:** corrected from 1.03, which was fitted to a coarser area curve.

**A caution.** Evaporation, precipitation and this factor are collinear: the calibration pins only their combination, net evaporation divided by the closure factor. Raising evaporation alone would force a recalibration that lowers the other terms, so the sensitivity of each one alone, as shown in tab 2, overstates how much any of them could move the answer.

## The area curve

**What we assume.** The lake's surface area at each level follows the US Geological Survey's 2023 elevation-area table, in one-foot steps ([Root, 2023](https://www.sciencebase.gov/catalog/item/6467b42fd34ec11ae4a8afb1)). **Basis.** The table is built from a half-metre topographic and bathymetric model of the lakebed. **Verdict:** corrected; it replaced three area anchors that the old model interpolated between.

![Inflow needed to hold the lake at each level: area at that level times 2.52 ft of net evaporation.](blob/fa92803c-83f0)

| Lake level (ft) | Area (sq mi) | Inflow needed to hold it (KAF a year) |
| --- | --- | --- |
| 4,190 | 937.6 | 1,621 |
| 4,194 | 1,104.2 | 1,909 |
| 4,198 | 1,422.5 | 2,459 |
| 4,202 | 1,779.7 | 3,076 |
| 4,205 | 2,010.5 | 3,475 |

The curve steepens through the healthy range because the lake spreads over the flat ground around it. That is the physical reason each foot of recovery costs more water than the one below it (tab 1.2).
