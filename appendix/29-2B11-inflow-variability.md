# 2B.11 Our assumptions regarding inflow variability

Weather moves the lake more than any lever. To show that, we simulate 120 sequences of river inflow from 2027 to 2055, each with the year-to-year spread and drought persistence of the real record. These figures do not move the average-inflow lake level at all, which is why they sit at the bottom of the sensitivity ranking. What they set is the uncertainty band around every projection in this document: in 2055, 4,194.55 to 4,204.29 ft from the 10th to the 90th percentile, with 51.7% of sequences ending healthy.

![The lake with our proposal: average-inflow path, median sequence and the 10th–90th percentile band of 120 simulated inflow sequences.](blob/e2d04087-6b14)

## Year-to-year spread

**What we assume.** Annual inflow varies with a coefficient of variation of 0.5: in a typical year, inflow is about half the mean away from it. **Basis.** Summing the US Geological Survey's water-year flows on the Bear, Weber and Jordan rivers gives a coefficient of variation of 0.50 for 2000–2025, 0.55 for 1989–2025 and 0.60 for 1950–2025 ([U.S. Geological Survey, 2025](https://waterservices.usgs.gov/nwis/dv/?format=rdb&sites=10126000,10141000,10170490&parameterCd=00060&statCd=00003)). The state's own account of recent years shows the swings: flow from the three rivers "dropped below 1,000 KAF in 2021 and 2022", rebounded "above 2,000 KAF in 2023 and 2024", then "declined to 1,281 KAF in 2025" ([Great Salt Lake Strike Team, 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf)). **The record itself.** Over 1950–2025, the combined annual flow of the three long-record gauges averaged 1,875,736 acre-feet with a standard deviation of 1,189,548, a coefficient of variation of 0.634 ([U.S. Geological Survey, 2026b](https://waterservices.usgs.gov/nwis/stat/?format=rdb&sites=10126000&statReportType=annual&statTypeCd=mean&parameterCd=00060)). We rate it 5: the lake's own gauged record. Our 0.5 matches the 2000–2025 period that sets our baseline; the full record is more variable. **Verdict:** corrected from 0.35, which understated the swings; range 0.4 to 0.65.

## Drought persistence

**What we assume.** A dry year makes the next one dry: the lag-one correlation of annual inflow is 0.35. **Basis.** The same gauge sums give a correlation of 0.44 for 1989–2025, 0.15 for 2000–2025 and 0.63 for 1950–2025. Over 1950–2025, the combined series gives 0.526 ([U.S. Geological Survey, 2026b](https://waterservices.usgs.gov/nwis/stat/?format=rdb&sites=10126000&statReportType=annual&statTypeCd=mean&parameterCd=00060)); we rate it 5. Our 0.35 sits inside the observed spread but below the long-record figure, so the model may understate how much droughts cluster. The state's own simulations resample years independently, a correlation of zero, which understates clustering further. **Verdict:** evidence; range 0 to 0.7.

## Long droughts

**What we assume.** In the long-drought scenario, inflow over the whole period is cut to 0.75 of normal. The option is off in our central run and used only to stress the result (tab 1.10). **The analogues.** Both are strong. In the gauged record, the driest 20-year run, 2003–2022, averaged 1,372,061 acre-feet a year, 0.731 of the 1950–2025 mean ([U.S. Geological Survey, 2026b](https://waterservices.usgs.gov/nwis/stat/?format=rdb&sites=10126000&statReportType=annual&statTypeCd=mean&parameterCd=00060)); we rate it 5. A tree-ring reconstruction of the Bear River, the lake's largest tributary, over 1,200 years finds that "the most severe period of reduced stream flow occurred during the Medieval Warm Period (ca. mid-1200s CE) and persisted for ~70 years", and that the second half of the twentieth century was the second-wettest 40-year period in that record ([DeRose et al., 2015](https://www.ncei.noaa.gov/pub/data/paleo/treering/reconstructions/northamerica/usa/utah/bear2015flow.txt)). Its driest 30-year window averaged 0.752 of the long-run mean, almost exactly our 0.75. We rate it 5. The warning in that record is that our baseline, drawn from a wet century, may itself be generous. **Verdict:** evidence; range 0.5 to 0.95.

## Number of simulations

**What we assume.** 120 inflow sequences. **Basis.** A modelling choice: enough for a stable 10th and 90th percentile without slowing the interactive model. With 120 runs, a 10th-percentile estimate is accurate to about ±2.7 percentile points; with the 1,000 runs the state uses for its own simulations, about ±1 point ([Great Salt Lake Strike Team, 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf)). No source sets this number, so we list it in Section 3. For published comparisons, 1,000 runs would be better.

```latex
\text{sampling error of the 10th percentile} \approx \sqrt{\frac{0.1 \times 0.9}{n}}, \qquad n = 120 \Rightarrow \pm 2.7 \text{ points}
```
