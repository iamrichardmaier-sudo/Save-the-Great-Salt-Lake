# 2A.5 Our assumptions regarding the crop levy

The crop levy charges $400 for each acre-foot a hay field applies above 1.5 acre-feet an acre. It leaves ordinary irrigation untouched and puts a high price only on the heaviest use, then returns 90% of what it raises to farmers through crop switching. We assume it falls on about 211,000 acres and frees 148.2 KAF a year. How much water a hay acre receives on average matters most here, moving the 2055 lake by 0.11 ft across its range.

## How the levy works as a price

A levy above a threshold is a two-part price. The first 1.5 acre-feet on an acre cost the farmer nothing extra; every acre-foot beyond costs $400. A farmer weighs that $400 against what the extra water adds to the crop. Since an acre-foot of hay water earns about $368 gross, and much less at the margin where the last irrigations add little yield, cutting back is usually the cheaper choice. The cost therefore falls on the heaviest irrigators, who either cut back or pay. Growers below the threshold are unaffected.

```latex
\text{water freed} = \text{acres in scope} \times \text{average excess above 1.5 AF} \times \text{share cut} \times \text{depletion factor}
```

In our run, 211,371 acres apply more than the threshold, an average of 0.91 acre-feet too much. Growers cut half of that, and the levy frees 148.2 KAF a year of depletion and raises $41.6M a year, of which $37.5M funds crop switching.

No real-world levy on over-application in an American irrigation basin exists to serve as an analogue, and we have not manufactured one. The figures below rest on the state's agronomic data.

## The hay ground in scope

**How many acres.** We assume 228,000 acres of irrigated hay in the Utah part of the basin. The 2022 Census of Agriculture's county tables give 219,944 irrigated forage acres in eleven basin counties, from Box Elder's 48,790 to Salt Lake County's 742; Wasatch County's figure is withheld and estimated at about 8,000 ([USDA National Agricultural Statistics Service, 2024c](https://nass.usda.gov/Publications/AgCensus/2022/Full_Report/Volume_1,_Chapter_2_County_Level/Utah/st49_2_024_024.pdf)). **Verdict:** corrected from 399,500 acres, which fits only if Idaho and Wyoming are included, and a Utah levy cannot reach them.

**How much they apply.** We assume 2.4 acre-feet an acre on average. The 2023 national irrigation survey reports Utah alfalfa at 523,658 irrigated acres with 2.4 acre-feet applied on average, 2.6 on pressure systems and 2.0 on gravity systems, and all other hay also at 2.4 ([USDA National Agricultural Statistics Service, 2024b](https://www.nass.usda.gov/Publications/AgCensus/2022/Online_Resources/Farm_and_Ranch_Irrigation_Survey/iwms.pdf)). **Verdict:** corrected from 2.64.

**How application varies.** A levy above a threshold only bites on fields above it, so the spread between fields matters. We treat application as lognormal around the mean, with a coefficient of variation of 0.3. The same survey's farm-size classes range from 1.43 acre-feet an acre on the smallest farms to 3.22 on the largest, a spread between classes of 0.29 ([USDA National Agricultural Statistics Service, 2024d](https://nass.usda.gov/Publications/AgCensus/2022/Online_Resources/Farm_and_Ranch_Irrigation_Survey/iwms.txt)). That is a lower bound on the spread between fields, since it ignores variation within each class. **Verdict:** range revised to 0.25 to 0.6.

## How irrigators respond

**How much of the excess they cut.** We assume growers cut at most half of an acre's application. The state's report gives the depletion saved by each option as a share of full fallowing (1.504 acre-feet an acre): stopping irrigation after June saves 0.77 acre-feet, 51%; stopping after July saves 0.52, 35%; switching to winter wheat saves 0.61, 41% ([Utah Division of Water Resources, 2026a](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf)). The deepest options short of fallowing save 35% to 51%, so 50% sits at the top of what is achievable without taking the field out of production. **Verdict:** evidence.

**How much depletion that frees.** We assume each acre-foot an acre cut frees 1.3 acre-feet of depletion across the acreage. The state gives 1.50 acre-feet an acre for full fallowing of alfalfa and 0.52 to 0.77 for split-season cuts. Our 1.3 is near the full-fallow end. If growers respond mostly with partial-season cuts, the true factor would be nearer 0.6 to 0.8 and the levy would free less water. **Verdict:** evidence; range 1.0 to 1.6. It moves the 2055 lake by 0.07 ft.

**What growers give up.** The return a grower forgoes on an acre of alfalfa taken out of irrigation is $305: the state's willingness-to-accept figure of $355 an acre, less $50 an acre for leasing costs, and confirmed by rebuilding it from yields, a price of $212 a ton and operating costs ([Utah Division of Water Resources, 2026a](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf)). **Verdict:** corrected from $175.

## Where the revenue goes

Of the $41.6M the levy raises, 90% goes back to farmers through the crop-switching programme, which turns it into 100 KAF a year of delivered water (tab 2A.3). The levy therefore works as a fee-and-rebate: heavy irrigators pay, and growers who switch to lower-water crops are paid. That is a policy choice, made because a levy that funds the transition it demands is easier to defend in farm counties than one that funds the state.
