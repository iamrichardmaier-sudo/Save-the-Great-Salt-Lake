# 2A.3 Our assumptions regarding conservation programmes

We model each programme the same way: money buys water at a fixed cost per acre-foot until the programme reaches a cap set by nature or by how many people will take part, and only a share of the water freed reaches the lake. In supply terms, each programme is a flat supply curve that stops dead at its cap. Crop switching's cap matters most of these figures, moving the 2055 lake by 0.18 ft across its range. Every programme takes three years to reach full output, an assumption the state's own report supports by phasing irrigation upgrades over ten years ([Utah Division of Water Resources, 2026a](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf)).

```latex
\text{water delivered} = \min\left(\frac{\text{spending}}{\text{cost per AF}},\ \text{cap}\right) \times \text{delivery share}
```

| Programme | Cost per AF freed | Share reaching the lake | Cap (KAF a year) | Delivered in our run |
| --- | --- | --- | --- | --- |
| Cloud seeding | $10 | 0.35 | 50 | 50 KAF at $28.6 per AF delivered |
| Phragmites removal | $610 | 0.90 | 50 | 36.9 KAF at $678 |
| Crop switching | $318.4 | 0.80 | 100 | 100 KAF at $398 |
| On-farm efficiency | $581 | 0.55 | 70 | 18 KAF at $1,056 |

## Cloud seeding

**Cost.** We assume $10 an acre-foot of added runoff, the top of the state's estimate: "The additional water produced by cloud seeding is estimated to cost $5 to $10 per acre-foot" ([Utah State University Extension, 2025](https://extension.usu.edu/climate/research/cloud-seeding-enhancing-winter-snowpack.php)). **Verdict:** confirmed.

**Share reaching the lake.** We assume 35%. Seeded snow melts into the same rivers as all other water and is diverted and consumed upstream like it. Across the basin, about 42% of all water supply reaches the lake: 1,665 KAF of inflow against 2,320 KAF of human depletion ([Great Salt Lake Strike Team, 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf)). Seeded water arrives in spring runoff in the headwaters, above most storage, so in dry years reservoirs may capture more of it. **Verdict:** evidence; no source gives a delivery share for seeded water.

**Cap.** We assume new seeding can add at most 50 KAF a year to the lake, limited by storms and target areas, not money. The analogues are strong. The northern Utah seeding programme over the Bear River basin, which drains to the lake, was estimated in a 2012 study to add about 56,000 acre-feet a season ([North American Weather Consultants, 2022](https://idwr.idaho.gov/wp-content/uploads/sites/2/iwrb/CloudSeeding/Northern-Utah-2021-22-Final.pdf)); we rate this 5, the same mechanism in the same basin. The central and southern Utah programme likely adds more than 70,000 acre-feet a year ([North American Weather Consultants, 2023](https://water.utah.gov/wp-content/uploads/2023/09/Southern-and-Central-Utah-Program-2022-23.pdf)); we rate it 4, since those watersheds drain away from the lake. If our cap means added water from new or expanded seeding, 50 KAF is plausible; if it means the whole programme, the state's 77 to 102 KAF would be the better estimate. **Verdict:** evidence.

## Phragmites removal

Phragmites is an invasive reed that has spread through the lake's wetlands and transpires far more water than the native plants it displaces.

**Cost.** We assume $610 an acre-foot, the low end of the state's documented estimate of "between $610 and $4,050 per ac-ft" ([Utah Division of Water Resources, 2025b](https://water.utah.gov/wp-content/uploads/2025/09/MI-Water-Conservation-Opportunities-Report-09_02_2025.pdf)). A 2026 legislative slide gives a much lower summary figure, $60M for 300 KAF a year, or $200 an acre-foot ([Utah Legislature, 2026d](https://le.utah.gov/interim/2026/pdf/00000790.pdf)). The two official figures disagree by an order of magnitude, and our range spans both. **Verdict:** corrected from $186.

**Cap and timing.** We assume at most 50 KAF a year. The state estimates that removing phragmites throughout its known range "could range from 17,000 to 57,000 ac-ft per year" in savings ([Utah Division of Water Resources, 2025b](https://water.utah.gov/wp-content/uploads/2025/09/MI-Water-Conservation-Opportunities-Report-09_02_2025.pdf)). The state's phragmites strategy estimates the reed uses 3.62 acre-feet of water an acre against 1.55 for native saltgrass; across 30,000 acres that is a theoretical saving of about 62 KAF a year ([Utah Division of Forestry, Fire and State Lands, 2024](https://ffsl.utah.gov/wp-content/uploads/GSL-Phragmites-Strategy-Overview-and-Reduction-in-water-depletions.pdf)). We rate it 4: the right place and mechanism, but the figures are modelled, not measured. Treated stands have to die back before the saving appears: "It typically takes us three to five years to remove any given patch" ([Utah Public Radio, 2026](https://www.upr.org/environment/2026-04-16/great-salt-lake-phragmites-invasive-reeds)), so we assume a three-year lag.

**Share reaching the lake.** We assume 90%, because the stands are on the lake's edge, below nearly all diversions. No source gives a figure, and the state notes that "additional research is needed to quantify water savings from phragmites treatment" ([Great Salt Lake Strike Team, 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf)). **Verdict:** unsupported; an assumption.

## Crop switching

**Cost.** This is a derived figure. The state's report costs switching from alfalfa at $276 an acre-foot of depletion saved for winter wheat, $424 for corn and $493 for spring wheat ([Utah Division of Water Resources, 2026a](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf)). We use the blended rate that fills the programme's capacity at $39.8M a year:

```latex
\text{cost per AF} = \frac{\$39.8\text{M} \times 0.8}{100{,}000 \text{ AF}} = \$318.4
```

It lies inside the published range, closer to winter wheat, which is the cheapest switch and the one the report finds can deliver most.

**Cap.** We assume 100 KAF a year. The state's report finds that switching alfalfa to winter small grains "could reduce depletions by up to 10%", about 83 to 132 KAF a year, and describes this as a technical scenario that needs very wide adoption. Our 100 KAF is therefore near the technical maximum. **The analogue.** The federal Colorado River pilot programme, which paid farmers across the basin, including in Utah, to fallow or switch to lower-water crops, saved 11,408 acre-feet in 2017 and 25,319 in 2018 ([U.S. Bureau of Reclamation, 2019](https://fpi.omb.gov/program/15.567.html)). We rate it 3: the same mechanism, but a short, budget-limited pilot in another basin. Our cap is four times its best year, in a basin where far more of the water is in hay. **Verdict:** evidence.

**Share reaching the lake.** We assume 80%: water left in the river still passes diversions on its way down. Utah officials "cannot point to a specific amount of the reported agricultural water savings" that reached the lake ([Johns, 2026](https://www.ksl.com/article/news/ksl-investigates/utah-saves-farm-water-but-cant-yet-track-how-much-reaches-the-great-salt-lake/51592182)); we rate this 2, as it shows the share is unmeasured. **Verdict:** no evidence.

## On-farm efficiency

**Cost.** We assume $581 an acre-foot, the midpoint of the state's $148 to $1,014 range across pivot upgrades and surface-to-sprinkler conversions ([Utah Division of Water Resources, 2026a](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf)). The report's own volume-weighted figure, $563, is within 3%. **Verdict:** confirmed.

**Cap.** We assume 70 KAF a year, bounded by how much ground can be converted. Utah sprinkler upgrades offer 16 KAF under $210 an acre-foot and 37 KAF under $510; the whole-basin irrigation strategy reaches 132.6 KAF at $563. **Verdict:** range revised.

**Share reaching the lake.** We assume 55%, and here the analogues are sobering. In western Kansas, efficiency upgrades from 1995 to 2005 increased groundwater extraction, "a rebound effect of over 100%" ([Pfeiffer & Lin, 2010](https://ageconsearch.umn.edu/record/60927/files/Pfeiffer_irrigationtechnology_2_8_10.pdf)); we rate it 3, as a groundwater system with different crops. Utah's own programme reported "Diversion: potential for notable decreases; Depletion: negligible change expected" from its first 20 projects ([Hasenyager & Bunker, 2024](https://le.utah.gov/interim/2024/pdf/00004055.pdf)); we rate it 4. The state's dashboard reports more than 125,000 acre-feet a year of savings, but these are diversion savings, not depletion ([Johns, 2026](https://www.ksl.com/article/news/ksl-investigates/utah-saves-farm-water-but-cant-yet-track-how-much-reaches-the-great-salt-lake/51592182)). The evidence points to a share below 55%, possibly near zero. Because the report's costs are already per acre-foot of depletion saved, a lower share may double-count; we keep 55% and spend only $19M a year on this programme, the least cost-effective in the package. **Verdict:** evidence.
