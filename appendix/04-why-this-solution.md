# 1.4 Why we came up with this solution

An acre-foot of water used to grow hay in the basin earns $368. The same acre-foot left to reach the lake is worth $2,440, more than six times as much. Hay also consumes more of the basin's water than any other use. That gap, on that volume, is the whole case for our proposal: move water from the use where it is worth least to the place where it is worth most, and pay the people who give it up.

## What an acre-foot earns in hay

Utah's alfalfa crop was worth $2,275.8M over 2019–2023, from 2.56 million harvested acres, or $889 an acre ([USDA National Agricultural Statistics Service, 2024a](https://data.nass.usda.gov/Statistics_by_State/Utah/Publications/Annual_Statistical_Bulletin/2024-Agricultural-Statistics.pdf)). An acre of alfalfa near Salt Lake City needs 28.97 inches of irrigation water beyond what rain supplies, or 2.41 ft ([Hill et al., 2011](https://extension.usu.edu/irrigation/files/Appendix_I_ET_NWS_Stations.pdf)). Dividing one by the other gives $368 for each acre-foot of irrigation water the crop consumes.

```latex
\text{hay value per AF} = \frac{\$889 \text{ per acre}}{2.41 \text{ AF per acre}} \approx \$368
```

This is gross value of production, before the farmer's costs. The farmer's own net return is lower: the state's agricultural optimisation report puts the forgone return on an acre of hay at $305, and the net value of irrigation water at $236 an acre-foot depleted ([Utah Division of Water Resources, 2026a](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf)). We use the higher gross figure for the comparison so as not to flatter our case.

## What an acre-foot is worth in the lake

No source states a value per acre-foot for the lake, so we derive one. An economic study for the state estimated the cost of a declining lake at $1.69B to $2.17B a year, a midpoint of $1.93B ([Audubon, 2019](https://www.audubon.org/news/potential-costs-declining-water-levels-great-salt-lake-could-be-billions)). Spread over the roughly 790 KAF a year of added inflow needed to avoid that decline, this is about $2,440 an acre-foot.

```latex
\text{lake value per AF} = \frac{\$1.93\text{B per year}}{790 \text{ KAF per year}} \approx \$2{,}440
```

Two cautions apply. The numerator is mostly gross output, much of it mineral extraction, rather than net welfare, and it is in 2019 dollars. On the other hand, a 2026 study of dust alone puts the health benefit of an acre-foot reaching the lake at $600 to $1,800 ([Harris et al., 2026](https://www.nber.org/papers/w35270)), without counting minerals, brine shrimp or recreation. Our $2,440 sits between those views, and tab 2B.7 sets out the range.

![Output per acre-foot consumed, by user (log scale). Hay is the lowest-value use in the basin; the lake's value is marked.](blob/4b284bdd-fa40)

## Why the water comes from hay

Three facts point at hay. It is the largest use: alfalfa and other hay deplete 1,025 KAF a year, 43% of all human depletion in the basin ([Great Salt Lake Strike Team, 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf)). It is the lowest-value use: every other user earns more from an acre-foot, from mineral extraction at $8,315 to commercial businesses at about $2.4M. And hay water can be measured and moved: a field taken out of irrigation frees a known volume at a known headgate, which a lawn or a factory cannot easily match.

The other uses are poor sources. Lawns consume 408.5 KAF a year, but a city's saving reaches the lake poorly; we assume only a quarter of it arrives (tab 2A.7). Industry, commerce and institutions consume 218.4 KAF and earn hundreds of thousands of dollars or more from each acre-foot, so taking their water would cost far more than it returns.

## What we considered and rejected

**Money alone.** With the mandate switched off, more money hardly helps. A $25M budget leaves the lake at 4,197.50 ft in 2055; $100M reaches 4,197.75 ft; $200M reaches 4,198.07 ft; and anything from $300M up stops at 4,198.11 ft. The limit is how much water willing sellers will lease or sell, not how much the state can pay. A backstop mandate is what closes the last half foot.

**Buying the rights outright.** At $6,000 an acre-foot, buying all 800 KAF of the needed water outright would cost about $4.8B. We use lease-to-own instead, so that leasing payments slowly build ownership, and we keep the outright purchase for later (tab 2A.4).

**Large on-farm efficiency programmes.** Better irrigation reduces what is diverted but often not what is consumed. In western Kansas, efficiency upgrades increased water extraction, with a rebound of over 100% ([Pfeiffer & Lin, 2010](https://ageconsearch.umn.edu/record/60927/files/Pfeiffer_irrigationtechnology_2_8_10.pdf)). Utah's own programme expects "negligible change" in depletion from its first 20 projects ([Hasenyager & Bunker, 2024](https://le.utah.gov/interim/2024/pdf/00004055.pdf)). We fund on-farm work at $19M a year and count only 55% of its nominal saving.

**Fines on lawn watering.** Only 22% of Utah voters favour penalties ([Deseret News & Hinckley Institute of Politics, 2026](https://www.deseret.com/politics/2026/05/27/poll-utahns-concerned-about-water-great-salt-lake/)), and the model's lawn module has a known flaw (tab 5). We ask for no lawn cut.

**A penalty priced at the lake's value.** The model can charge a farm that refuses the mandate up to $2,440 an acre-foot. We set the penalty at zero, so the mandate orders a cut but does not fine.

**Other packages from the goal search.** The search found a second package that also meets the goal: a lower charge of $66.2, no lease-to-own money and a slower mandate. It reaches the goal one year later, in 2048, with a lower net economic value of $53.75B, so we kept the package in tab 1.1, which reaches it in 2047 with $55.0B.
