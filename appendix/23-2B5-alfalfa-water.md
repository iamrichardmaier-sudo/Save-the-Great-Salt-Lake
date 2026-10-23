# 2B.5 Our assumptions regarding alfalfa water consumption

An acre of alfalfa near Salt Lake City consumes 2.41 ft of irrigation water a season, and the basin grows about 1.8% of the nation's alfalfa. That second figure is the one this tab tests. It is often said that the basin's hay is about 1% of the national supply, so that cutting it would barely touch the market. Our check puts the basin nearer 1.8%, and the hay forgone in our model run at 3.6%. Both are still small next to the price swings the market already absorbs. None of these figures moves the 2055 lake by more than 0.11 ft.

## Water per acre

**Consumptive use.** Near Salt Lake City, an acre of alfalfa grown for beef uses 37.22 inches of water a season through evapotranspiration. Of that, 28.97 inches, 2.41 ft, must come from irrigation; the rest is rain ([Hill et al., 2011](https://extension.usu.edu/irrigation/files/Appendix_I_ET_NWS_Stations.pdf)). This net irrigation requirement is what we use to value hay water, because it is the water the crop takes from the rivers. The research base holds Utah figures only; it has no national average consumptive use per acre, so we do not quote one.

**Water applied.** Utah alfalfa growers apply 2.4 acre-feet an acre on average: 2.6 on pressure systems and 2.0 on gravity ([USDA National Agricultural Statistics Service, 2024b](https://www.nass.usda.gov/Publications/AgCensus/2022/Online_Resources/Farm_and_Ranch_Irrigation_Survey/iwms.pdf)). Fallowing a full season of alfalfa saves 1.50 acre-feet of depletion an acre, according to the state ([Utah Division of Water Resources, 2026a](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf)). Each figure answers a different question, and we use each where it fits: net irrigation for value, application for the levy, depletion for what reaches the lake.

**Yield.** We assume 4.3 tons an acre, Utah's 2025 alfalfa yield ([USDA National Agricultural Statistics Service, 2025b](https://nass.usda.gov/Statistics_by_State/Utah/Publications/News_Releases/2025/UT-Crop-Production-01102025.pdf)). It is higher than the 4.0 tons of 2023 and 2024, and statewide rather than basin-specific. **Verdict:** confirmed; range 3 to 5.5 tons.

## The national market, and the 1% claim

**Utah's share.** The United States produced 49.9 million tons of alfalfa hay in 2023; Utah produced 1.96 million tons, ranking 12th ([USDA National Agricultural Statistics Service, 2024a](https://data.nass.usda.gov/Statistics_by_State/Utah/Publications/Annual_Statistical_Bulletin/2024-Agricultural-Statistics.pdf)).

```latex
\frac{1.96 \text{ million tons (Utah)}}{49.9 \text{ million tons (US)}} = 3.9\%
```

**The basin's share.** The basin has about 228,000 irrigated hay acres. At about 4 tons an acre, that is roughly 0.91 million tons, about 1.8% of the national alfalfa crop.

![Alfalfa production in million tons, log scale: the United States, Utah, the basin, and the hay forgone in our run.](blob/9a31e5ee-2c8a)

So the "about 1%" figure understates the basin's share by nearly half, but the conclusion it was meant to support holds in direction: the basin is a small part of a national market. The model's own hay forgone, 1.78 million tons, is 3.6% of the US alfalfa crop and 91% of Utah's. That figure overstates the cut to alfalfa, because the model counts all agricultural water taken as hay (tab 1.6).

## What a cut does to the market

**The economics.** Hay is traded across state lines and overseas, so a fall in basin supply shifts the national supply curve slightly to the left. The price rises until buyers cut their purchases, and other growers add theirs, enough to close the gap. How far the price rises depends on how responsive buyers and other growers are:

```latex
\%\Delta P \approx \frac{\%\Delta Q_{\text{supply}}}{\varepsilon_{\text{demand}} + \varepsilon_{\text{supply}}}
```

A cut of 1.8% to 3.6% of national supply, spread over the combined responsiveness of all buyers and sellers in the country, would raise the national price by a small fraction of that cut, if the two elasticities together are around 1 or more. The research base holds no estimate of the elasticity of hay demand or supply, so we cannot put a number on the price change, and we list the gap in tab 5 and our expectation in Section 3.

**What we can say from the data.** Utah alfalfa prices already swing far more than any plausible effect of our cut. They were $127 a ton in 2016, $297 in 2022 and $222 in 2023 ([USDA National Agricultural Statistics Service, 2024a](https://data.nass.usda.gov/Statistics_by_State/Utah/Publications/Annual_Statistical_Bulletin/2024-Agricultural-Statistics.pdf)): a fall of 25% in a single year, after more than doubling between 2016 and 2022. Buyers, growers and dairies already live with that volatility.

**Who it falls on.** A higher price helps growers outside the basin and those inside who keep growing. It hurts buyers: local dairies and beef herds, and exporters. That is why our model counts livestock receipts at risk, $141.9M a year in 2055, and 1,265 dairy and beef jobs (tab 2B.8).

## Where the hay goes

**What we assume.** The basin grows 596,000 tons of forage a year more than its own herds eat. **Basis.** No published figure measures it. Utah exports "between 10% and 20% of production" ([Utah State University Extension, 2020](https://farmanalysis.usu.edu/static/hay_pricing/pdfs/factsheet.pdf)), which on statewide hay production of about 2.5 million tons is 250,000 to 520,000 tons; growers have estimated the share going overseas at 6% to 8% ([Salt Lake Tribune, 2023a](https://sltrib.com/news/environment/2023/03/16/should-utah-be-exporting-its)). Basin counties produced 893,966 tons of forage on a dry-matter basis in 2022 and carried 340,600 head of cattle, but no published feed-demand figure lets us subtract one from the other ([USDA National Agricultural Statistics Service, 2024c](https://nass.usda.gov/Publications/AgCensus/2022/Full_Report/Volume_1,_Chapter_2_County_Level/Utah/st49_2_024_024.pdf)). Our 596,000 tons is above the top of the export range. **Verdict:** unsupported; an assumption with a range of 150,000 to 600,000 tons.

**Why it matters.** The surplus decides how much of a hay cut falls on exports, which local farmers and ranchers do not depend on, before it reaches local feed. In our run the hay forgone exceeds the surplus three times over, so the model counts the remainder against local livestock. A higher surplus, or a smaller true cut to alfalfa, would shrink the livestock cost.
