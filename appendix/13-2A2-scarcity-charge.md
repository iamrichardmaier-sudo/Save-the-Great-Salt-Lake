# 2A.2 Our assumptions regarding the scarcity charge

The scarcity charge puts a price on each acre-foot depleted while the lake is short of its goal. We assume users respond as the economics of irrigation and municipal water demand predict: modestly, because water demand is inelastic, but most strongly among growers of low-value crops such as hay. The charge's speed of adjustment matters most of these figures; it moves the 2055 lake by 0.38 ft across its range.

## The rate and the base

The charge starts at $85 an acre-foot and falls on 1,938.4 KAF a year: all basin depletion except household use (421.6 KAF) and reservoir evaporation (27 KAF) ([Great Salt Lake Strike Team, 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf)). It is derived as agriculture (1,584 KAF) plus minerals, commerce, institutions and city-supplied industry (354.4 KAF).

```latex
\text{charge base} = 2{,}387 - 421.6 - 27 = 1{,}938.4 \text{ KAF a year}
```

## How farms respond

**The market.** For a farm, water is an input. Its demand for water slopes down: the higher the price of an acre-foot, the fewer acre-feet it is worth applying, because the last acre-feet add little yield. A charge raises the price of every acre-foot depleted. Growers cut first where water earns least: the last irrigation of the season, the poorest fields, and low-value crops like hay. The cost falls on the grower, who either pays the charge or gives up the crop the water would have grown.

**What we assume.** A farm cuts its depletion by a share equal to 0.4 times the charge, expressed as a fraction of what the water is worth to the farm, up to a cap of 60% of agricultural depletion.

```latex
\text{share cut} = \min\left(0.4 \times \frac{\text{charge}}{\$236},\; 0.6\right)
```

**The value of the water to a farm.** We take $236 an acre-foot, the payment growers would accept to stop irrigating full-season alfalfa, per acre-foot of depletion saved ([Utah Division of Water Resources, 2026a](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf)). The charge is levied on depletion, so the per-acre-foot-depleted figure is the right one. **Verdict:** corrected from $133, which was a per-acre-foot-applied figure.

**The elasticity and its analogue.** Our 0.4 behaves like a price elasticity of demand for irrigation water. A meta-analysis of 24 US studies since 1963 found a mean price elasticity of 0.48 and noted that long-run elasticities, the ones that matter for policy, are likely larger ([Scheierling et al., 2006](http://earthref.org/ERR/92882/)). We rate it 4 out of 5: it measures exactly this quantity, pooled across US regions and decades rather than measured in Utah. Utah's crop mix, dominated by low-value hay, sits at the more responsive end, so 0.4 is a cautious choice. **Verdict:** evidence; range 0.2 to 0.7.

**The cap.** No charge can drive farm water use to zero. A study of the lake's three tributary watersheds found a saturating response: all irrigated alfalfa in the Jordan and Bear watersheds would be fallowed at any payment, but only about half of Weber's, 95,200 acres ([Li & Khan, 2024](https://ageconsearch.umn.edu/record/348176/files/How%20Agricultural%20Water%20Conservation%20Can%20Save%20the%20Great%20Salt%20Lake.pdf)). We rate it 3: the right place and crop, but a fallowing payment rather than a charge. The state's own treatable-acreage bound for fallowing implies about 40% of agricultural depletion is reachable; a charge can reach further through other crops and deficit irrigation, so we set 60%, within a 30% to 80% range. **Verdict:** evidence.

## How cities and industry respond

**What we assume.** Municipal and industrial users respond with a price elasticity of 0.3, and can cut at most 40% of their depletion. Their reference price is $640 an acre-foot.

**The analogue.** A meta-analysis of residential water demand found a mean price elasticity of −0.41 and a median of −0.35, "providing substantial evidence for water demand being price inelastic" ([Dalhuisen et al., 2003](https://research.vu.nl/ws/files/1902894/LE%20Dalhuisen.pdf)); we rate it 3, since it covers households, not industry. A review of industrial water demand concludes that industrial demand is also inelastic, though more responsive than household demand ([Gracia-de-Renteria & Barberan, 2021](https://mdpi-res.com/d_attachment/water/water-13-01684/article_deploy/water-13-01684.pdf)); we rate it 2, as it is mostly European with no pooled figure. Our 0.3 sits slightly below the household median, which suits a mix that includes less responsive industrial users. The state's most aggressive conservation scenario cuts municipal use by 23% to 33% over 50 years ([Utah Division of Water Resources, 2019](https://conservewater.utah.gov/wp-content/uploads/2021/05/Regional-Water-Conservation-Goals-Report-Final.pdf)); because depletion is concentrated outdoors, where cuts concentrate, a 40% cap on depletion is at the upper edge of what is published.

**The reference price.** The largest wholesaler in the basin charges its member cities between $474.11 and $811.41 an acre-foot for 2026/27, with a median of $639.92 ([Jordan Valley Water Conservancy District, 2026](https://jvwcd.gov/file/4c9e4734-97c0-4b46-9567-e5e5451bcff1/2026-2027-Adopted-Water-Rates.pdf)); we rate this 5, the exact quantity in the basin. Lowest-tier municipal rates in the study area run from $456 to $1,385 an acre-foot ([Li & Khan, 2024](https://ageconsearch.umn.edu/record/348176/files/How%20Agricultural%20Water%20Conservation%20Can%20Save%20the%20Great%20Salt%20Lake.pdf)). **Verdict:** corrected from $380, which was below every listed rate.

## The thermostat and escalator

**What we assume.** The charge does not jump. Each year it closes a quarter of the gap between its current rate and its target, standing in for about a four-year review cycle. While the lake stays more than 15% short of the goal, an escalator raises the rate by a step of 0.12 a year, up to four times its starting level.

**Basis.** Utah law requires water providers to update their conservation plans at least every five years ([Utah Legislature, 2026c](https://le.utah.gov/xcode/Title73/Chapter10/C73-10-S32_2026050620260701.html)), which is a speed of about 0.2 a year; our 0.25 is a little faster. Federal drought guidance supports surcharges that rise "as the drought worsens" ([U.S. Environmental Protection Agency, 2017](https://www.epa.gov/sites/production/files/2017-10/documents/drought_guide_final_508compliant_october2017.pdf)), but publishes no rate of escalation or cap. The 15% dead band reflects how uncertain the basin's water accounts are: the state's updated water budget raised total depletion by 13.7% when averaged over 1989–2023 ([Great Salt Lake Strike Team, 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf)). **Verdict:** evidence for the speed and the dead band; the escalator step and cap are design choices.

**What it produces.** In 2027 the rate is $87 and users cut 248.5 KAF a year. As bought water arrives and the lake rises, the thermostat lowers the rate: to $9 by 2035, when the cut is 26.4 KAF, and close to zero by 2055.
