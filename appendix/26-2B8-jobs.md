# 2B.8 Our assumptions regarding jobs

We count four kinds of jobs: field jobs lost as land leaves irrigation, dairy and beef jobs lost as local feed is cut, transition and monitoring jobs created by spending, and lake-economy jobs that return as the lake recovers. In 2055 that gives 9,226 jobs lost and 8,372 gained, a net of −854. None of these figures changes the lake level, so none moves the 2055 lake in our sensitivity tests; but the losses and gains fall in different places, which is why we report them separately.

| Jobs | 2035 | 2055 |
| --- | --- | --- |
| Field workers | −7,949 | −7,961 |
| Dairy and beef | −1,264 | −1,265 |
| Transition and monitoring | +666 | +666 |
| Lake economy | +6,804 | +7,706 |
| **Net** | **−1,743** | **−854** |

![Jobs lost and gained, statewide, in 2035 and 2055.](blob/e9ad4bdb-f312)

## Farm jobs

**What we assume.** 19.2 field jobs for every 1,000 irrigated acres. **Basis.** Derived: state farm employment divided by state irrigated acres. Utah agriculture "employed over 16,000 people" ([Deseret News, 2025](https://www.deseret.com/utah/2025/12/18/utah-farms-generated-2-billion-in-2022/)), and the 2022 Census of Agriculture counts 853,471 irrigated acres in the state ([USDA National Agricultural Statistics Service, 2024e](https://www.nass.usda.gov/Publications/AgCensus/2022/Full_Report/Volume_1,_Chapter_1_State_Level/Utah/st49_1_009_010.pdf)).

```latex
\frac{16{,}000 \text{ jobs}}{853{,}471 \text{ acres}} \times 1{,}000 = 18.7 \text{ jobs per 1,000 acres}
```

The model's 19.2 is within 3%. **Verdict:** confirmed. **Caution.** The 16,000 is a headcount that includes part-time workers, nearly half of whom worked under 150 days a year, and it includes range livestock. Hay needs less labour than most crops. Applied to hay, a farm-wide average therefore overstates the field jobs lost.

## Livestock jobs

**What we assume.** Up to 1,900 dairy and beef jobs are at risk if the cut reaches local feed; in our run, 1,265 are lost. **Basis.** No source gives 1,900. Federal employment data for 2024 count 1,670 wage jobs in Utah cattle ranching and dairy, 594 in beef and 1,076 in dairy, of which about 850 to 1,000 are in the basin counties ([U.S. Bureau of Labor Statistics, 2025](https://data.bls.gov/cew/data/api/2024/a/area/49000.csv)). Those figures exclude the self-employed, who are many in ranching. **Verdict:** unsupported; an assumption with a range of 800 to 3,500.

## Transition jobs

**What we assume.** 7.4 jobs for every $1M a year spent on crop transition, measurement and verification, giving 666 jobs a year. **The analogue.** A national study of the ecological restoration economy found that restoration directly generates 126,111 jobs on $9.47B of output, about 13.3 jobs per $1M, and cites a range in earlier work of 6.8 to 39.7 jobs per $1M depending on place and type ([BenDor et al., 2015](https://pmc.ncbi.nlm.nih.gov/articles/PMC4470920)). We rate it 4: the same mechanism, but national and not specific to Utah. The state's own input-output analysis of irrigation investment gives about 11 jobs per $1M a year ([Utah Division of Water Resources, 2026a](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf)). Payments to farmers to change crops create far fewer jobs than construction or monitoring, so our 7.4 sits at the low end. **Verdict:** evidence; range 3 to 14.

**Wages.** We value a job-year at $65,800, Utah's 2024 average: total covered wages of $114,975M across 1,747,330 jobs ([Utah Department of Workforce Services, 2025](https://jobs.utah.gov/wi/pubs/em/currentreport/table19.pdf)). **Verdict:** confirmed.

## Lake-economy jobs

**What we assume.** 7,706 jobs when the lake is healthy, and fewer while it is still recovering. **Basis.** The lake's economic contribution study, presented to the Legislature, counts total employment of 7,706, direct, indirect and induced: 5,368 in the industrial (mineral) sector, 1,764 in recreation and 574 in brine shrimp ([Utah Legislature, 2022](https://le.utah.gov/interim/2022/pdf/00004675.pdf)). Direct jobs alone are 3,557. The figures are for 2010.

**Verdict:** corrected from 8,650, a figure found in no source. With no package, the model still shows 927 lake jobs in 2035 and 1,135 in 2055, because the lake partly rebounds after dry years (tab 5).

## Where the jobs are

The field, dairy and beef jobs lost are in the farm counties of the basin; the lake-economy jobs are around the lake's mineral works, its brine shrimp harvest and the recreation on its shores. A statewide net of −854 hides a shift of work between places and people. Transition jobs, 666 a year, are the part of the package aimed at the farm counties themselves.
