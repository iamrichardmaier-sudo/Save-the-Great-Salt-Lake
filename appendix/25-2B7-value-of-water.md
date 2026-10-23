# 2B.7 Our assumptions regarding the value of water

We value an acre-foot in the lake at $2,440 and an acre-foot in hay at $368. Every cost-benefit figure in this document, and the case in tab 1.4, rests on that gap. Neither value changes the lake level in the model, so neither appears in the sensitivity ranking, but the lake value sets the benefit and the net economic value directly.

## The value of lake water

**What we assume.** $2,440 an acre-foot. **Basis.** No source states this figure; it is derived. An economic study for the state put the cost of a declining lake at $1.69B to $2.17B a year ([Audubon, 2019](https://www.audubon.org/news/potential-costs-declining-water-levels-great-salt-lake-could-be-billions)). We divide the midpoint by the added inflow needed to avoid that decline:

```latex
\frac{(\$1.69\text{B} + \$2.17\text{B}) / 2}{790 \text{ KAF a year}} = \frac{\$1.93\text{B}}{790 \text{ KAF}} \approx \$2{,}440 \text{ an acre-foot}
```

The ends of the study's range give $2,110 to $2,750. **Why it is reasonable.** The decline study counts the losses a shrinking lake imposes: mineral extraction, brine shrimp, recreation, health and more. Dividing by the water needed to prevent them prices that water. **Its weaknesses.** The numerator is mostly gross output, much of it from mineral extraction, rather than net welfare, and it is in 2019 dollars. **Cross-checks.** A 2026 working paper finds that "for every additional acre-foot of water that reaches Great Salt Lake ... Utah receives about $600 to $1,800 worth of health benefits from reduced dust pollution alone" ([Harris et al., 2026](https://www.nber.org/papers/w35270)). Utah households' stated willingness to pay, about $162M a year statewide ([Salt Lake Tribune, 2026a](https://www.sltrib.com/news/environment/2026/10/16/most-utahns-are-willing-open-their/)), works out at about $200 an acre-foot over 800 KAF, but that counts only what people would pay, not the economic losses avoided. **Verdict:** derived; range widened to $600 to $3,600, with $600 the dust-only figure.

## The value of hay water

**What we assume.** $368 an acre-foot. **Basis.** Derived from Utah's alfalfa value of production over 2019–2023, $2,275.8M on 2.56 million acres, or $889 an acre ([USDA National Agricultural Statistics Service, 2024a](https://data.nass.usda.gov/Statistics_by_State/Utah/Publications/Annual_Statistical_Bulletin/2024-Agricultural-Statistics.pdf)), divided by the 2.41 ft of irrigation water an acre of alfalfa needs near Salt Lake City ([Hill et al., 2011](https://extension.usu.edu/irrigation/files/Appendix_I_ET_NWS_Stations.pdf)).

```latex
\frac{\$889 \text{ per acre}}{2.41 \text{ ft per acre}} = \$368 \text{ an acre-foot}
```

**Verdict:** corrected from $245, which divided by full evapotranspiration, about 3 ft, and so counted rain as if it were irrigation water. At 2025 hay prices the figure would be about $310, which the $300 to $500 range covers.

## Farm net values

The $368 is the gross value of the crop. What a farmer actually gives up is less. The state's agricultural report puts the payment growers would accept to stop irrigating full-season alfalfa at $355 an acre, which includes $50 an acre for the costs of leasing ([Utah Division of Water Resources, 2026a](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf)). We therefore take:

- **Net return on an acre of hay:** $305 ($355 − $50). Rebuilding it from yields, a price of $212 a ton and operating costs, weighted by acreage, gives $304.5. **Verdict:** corrected from $175.
- **Net value of irrigation water to a farm:** $236 for each acre-foot of depletion saved, the report's own figure ($355 ÷ 1.50 acre-feet). **Verdict:** corrected from $133, a per-acre-foot-applied figure.

These are the prices the charge and the leases must compete with (tabs 2A.2 and 2A.4).

## What other users earn

| User | Output per acre-foot consumed | How derived | Verdict |
| --- | --- | --- | --- |
| Alfalfa and other hay | $368 | as above | corrected |
| Mineral extraction | $8,315 | $1,130.8M output (2010 $) ÷ 136 KAF | corrected |
| Institutional and government | about $354,000 | state GDP for the sector ÷ its share of 218.4 KAF | confirmed |
| Manufacturing on city water | about $1.3M | the same method | confirmed |
| Commercial businesses | about $2.4M | the same method | confirmed |

![Output per acre-foot consumed, by user (log scale).](blob/4b284bdd-fa40)

The mineral figure divides the sector's output ([Utah Legislature, 2022](https://le.utah.gov/interim/2022/pdf/00004675.pdf)) by its 2020–2024 depletion. The three urban figures take each sector's 2025 output from the federal state GDP accounts ([U.S. Bureau of Economic Analysis, 2025](https://www.bea.gov/data/gdp/gdp-state)) and divide it by its share of non-residential municipal depletion, using the state's split of commercial 14%, institutional 13% and industrial 3% of municipal use ([Utah Division of Water Resources, 2019](https://conservewater.utah.gov/wp-content/uploads/2021/05/Regional-Water-Conservation-Goals-Report-Final.pdf)); they reproduce within 10%. Our model also carries a figure of $1,021 an acre-foot for all agriculture, which could not be reproduced from its sources, so we do not rely on it. Figures for proposed data centres and nuclear plants are discussed in tab 1.7 and listed in Section 3.

**City prices.** For comparison, wholesale water in Salt Lake County costs cities $474 to $811 an acre-foot, and Salt Lake City's average retail rate works out at about $2,173 an acre-foot (tab 2A.2).
