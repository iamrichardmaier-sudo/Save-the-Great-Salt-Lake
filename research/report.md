# Great Salt Lake model: every number re-checked

As of 2026-10-23. Shared version: https://claude.ai/artifact/Nps2hg3JcK3B1Fop79PtkA

## Headline findings

With the corrected numbers, the plan we had before the re-check misses the 4,198.5 ft goal: it ends at 4,198.25 ft in 2055, 0.25 ft short. Re-running the old optimiser misses by 1.04 ft (4,197.46 ft). A new package, found by searching every policy dial within its range, meets the goal by 2047 on the same $100M a year, but only at the edge of what the dials allow.

- **The old plan misses.** Before the re-check, the optimised plan reached 4,198.96 ft in 2055, first met the goal in 2051, and had a net economic value (NEV) of $59.05B. On the corrected numbers, that same plan ends at 4,198.25 ft and never meets the goal. Re-running the old optimiser on the corrected numbers does worse: 4,197.46 ft, with NEV $36.94B.
- **A new package meets it, barely.** A search across every policy dial, within its existing range, found a package that first meets 4,198.5 ft in 2047 and holds it. It ends at 4,198.57 ft in 2055, with NEV $55.00B. It is now the model's default.
- **What that package needs:**
  - the mandate at the top of its range (a 1,200 KAF floor, phased in over one year);
  - the crop levy at its maximum ($400/AF above 1.5 AF an acre);
  - repossession switched on;
  - monitoring ($50M) and phragmites removal ($25M) at their caps.
- **It is fragile.** The margin is under a tenth of a foot. The goal is missed if any of these happens:
  - the mandate is 10% weaker;
  - the levy or repossession is dropped;
  - any one of 33 uncertain numbers sits at its pessimistic end.

  More money barely helps: $200M a year reaches only 4,198.69 ft.
- **Corrections that mattered most.** Each was measured on the old plan:
  - Utah-only hay ground (228,000 acres, not 399,500): −0.36 ft and −$3.8B.
  - The faster lake response fitted to the Strike Team's projection: +0.31 ft.
  - The measured USGS lake-area curve: −0.23 ft.
  - Higher phragmites cost ($610/AF, not $186): −$1.0B.
  - The 800 KAF goal (not 875): −0.08 ft.
- **Coverage.** 102 coefficients, 89 side-table and source rows, and 34 hand-listed sources were checked. Of the coefficients:
  - 19 confirmed and 24 corrected;
  - 9 had their ranges revised and 1 is derived;
  - 33 are assumptions with published evidence;
  - 8 are unsupported and 8 have no evidence.

  No figure rests on a search snippet; every quote comes from a page or PDF that was opened.
- **A model flaw.** The search found that a token watering ask (0.02%) raised full fine revenue and moved the lake 0.6 ft. The optimiser now ignores asks under 5%, but the lawn module itself still needs fixing.

## Every number in the model

All 102 coefficients, in model order. Where a value changed, the verdict shows the old one. Full quotes and arithmetic are on the page's Index tab and in [research/findings.md](https://github.com/iamrichardmaier-sudo/Save-the-Great-Salt-Lake/blob/claude/clever-bardeen-unjgd2/research/findings.md).

| Number | Value | Units | Verdict | Old → new | Locator | Quote or note | Source |
| --- | --: | --- | --- | --- | --- | --- | --- |
| `evap_gross` | 3.77 | ft/yr | confirmed | — | p.12, section on evaporation | “The estimated annual evaporation from the lake for the period 1931-76 ranged from about 2.1…” | [USGS](https://pubs.usgs.gov/of/1978/0912/report.pdf) |
| `precip_lake` | 1.25 | ft/yr | confirmed | — | Climate data table (NOAA 1991-2020 normals) | “Average precipitation inches ... 15.52 (394) \[annual, Salt Lake City Intl Airport\]” | [Wikipedia citing NOAA](https://en.wikipedia.org/wiki/Climate_of_Salt_Lake_City) |
| `inflow_efficiency` | 0.933 | ratio | corrected | 1.03 → 0.933 | Strike Mar 2026, Figure 20 insights, p.30 | “No additional inflows from conservation results in a long-term mean lake level of 4,191.1…” | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| `lake_now` | 4,189.7 | ft | corrected | 4,191.1 → 4,189.7 | USGS 10010000 Saltair, daily mean | “2026-09-30 4189.7 (P); 2026-10-21 4189.7 (P); 2025-09-30 4191.1” | [USGS NWIS](https://waterservices.usgs.gov/nwis/dv/?format=json&sites=10010000&parameterCd=62614&startDT=2025-09-01&endDT=2026-10-23) |
| `healthy_min` | 4,198 | ft | confirmed | — | Strategic Plan p.8, p.24 | “This analysis has determined that the healthy range of the lake ... is between 4,198 and 4,205 feet” | [GSL Strategic Plan](https://greatsaltlake.utah.gov/wp-content/uploads/Great-Salt-Lake-Strategic-Plan.pdf) |
| `healthy_max` | 4,205 | ft | confirmed | — | Strategic Plan p.24, Objective 3 | “a target range for the lake between 4,198-4,205 feet” | [GSL Strategic Plan](https://greatsaltlake.utah.gov/wp-content/uploads/Great-Salt-Lake-Strategic-Plan.pdf) |
| `serious_low` | 4,190 | ft | confirmed | — | Strategic Plan p.26 | “develop a short-term contingency plan to keep the South Arm of the lake from falling below…” | [GSL Strategic Plan](https://greatsaltlake.utah.gov/wp-content/uploads/Great-Salt-Lake-Strategic-Plan.pdf) |
| `baseline_inflow` | 1,665 | KAF/yr | confirmed | — | River Inflow insights, printed p.22 | “Between 2000 and 2025, inflows averaged 1,665 KAF per year.” | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| `goal_added` | 800 | KAF/yr | corrected | 875 → 800 | Long-term planning, p.29 | “Additional 800 KAF/year inflow to the lake from water conservation or other sources…” | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| `response_k` | 0.17 | share of the gap per year | corrected | 0.12 → 0.17 | Figure 19 insights, p.29 | “An additional 800 KAF/year of inflow results in a 2034 mean elevation of 4,196.9 feet…” | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| `budget` | 100 | $M/yr | evidence | — | 2023 session water funding | “During the 2023 General Session, the Legislature funded over $500 million for water…” | [Utah State Senate](https://senate.utah.gov/?p=2865) |
| `monitoring` | 50 | $M/yr | evidence | — | Funding request 'GSL Watershed Measurement' | “Amount Requested 2025 (One-time) $6,265,000.00…” | [Utah Legislature](https://le.utah.gov/interim/2024/pdf/00001081.pdf) |
| `lease_to_own_dollars` | 2 | $M/yr | no evidence | — | — | Allocation dial; no source applies. | [GSL Trust 2025](https://media.audubon.org/2026-04/GSLWET_Impact_Report_2025.pdf) |
| `cloud_cost` | 10 | $/AF | confirmed | — | Utah programme section | “The additional water produced by cloud seeding is estimated to cost $5 to $10 per acre-foot…” | [USU Extension](https://extension.usu.edu/climate/research/cloud-seeding-enhancing-winter-snowpack.php) |
| `cloud_delivery` | 0.35 | share | evidence | — | Strike Mar 2026 p.28 | “Average Inflow - 1,665 KAF/year ... average annual human depletions…” | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| `cloud_cap` | 50 | KAF/yr | evidence | — | Appendix H p.81; Table H-4 | “cloud seeding generated approximately 102,000 ac-ft of additional runoff…” | [Utah DWR M&I report](https://water.utah.gov/wp-content/uploads/2025/09/MI-Water-Conservation-Opportunities-Report-09_02_2025.pdf) |
| `phrag_cost` | 610 | $/AF | corrected | 186 → 610 | DWR M&I report p.81–82 | “estimated cost between $610 and $4,050 per ac-ft” | [Utah Legislature 2026](https://le.utah.gov/interim/2026/pdf/00000790.pdf) |
| `phrag_delivery` | 0.9 | share | unsupported | — | Strike Mar 2026 p.12 | “Additional research is needed to quantify water savings from phragmites treatment…” | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| `phrag_cap` | 50 | KAF/yr | range revised | — | Appendix H, pp.81–82 | “If Phragmites were successfully removed and replaced with native vegetation…” | [Utah DWR M&I report](https://water.utah.gov/wp-content/uploads/2025/09/MI-Water-Conservation-Opportunities-Report-09_02_2025.pdf) |
| `phrag_lag` | 3 | years | range revised | — | article body | “It typically takes us three to five years to remove any given patch of phragmites.” | [Utah Public Radio](https://www.upr.org/environment/2026-04-16/great-salt-lake-phragmites-invasive-reeds) |
| `crop_cost` | 318.4 | $/AF | range revised | — | Table B-10 | “Alfalfa Winter wheat 0.61 $276; Alfalfa Spring wheat 0.50 $493; Alfalfa Corn 0.53 $424” | [Utah DWR Ag Optimization](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf) |
| `crop_delivery` | 0.8 | share | no evidence | — | Section 4, p.4-1 | “reductions in depletion throughout the Basin do not equate directly to additional flow…” | [Utah DWR Ag Optimization](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf) |
| `crop_cap` | 100 | KAF/yr | evidence | — | Executive Summary p.ii | “Crop substitution from alfalfa to winter small grains could reduce depletions by up to 10%.” | [Utah DWR Ag Optimization](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf) |
| `onfarm_cost` | 581 | $/AF | confirmed | — | Executive summary p.iii; Table 5-1 | “Options with the lowest cost per AF included use of low-elevation on existing pivots ($148…” | [Utah DWR Ag Optimization](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf) |
| `onfarm_delivery` | 0.55 | share | evidence | — | Grafton et al. 2018, reported | “previously non-consumed water 'losses' at a farm scale ... are frequently…” | [Australian Water Association](https://watersource.awa.asn.au/technology/research/research-shows-irrigation-efficiency-projects-actually-lead-to-more-water-use/) |
| `onfarm_cap` | 70 | KAF/yr | range revised | — | Table ES-1 (Utah portion) | “Wheel-line to pivot LESA and LEPA 10,000 ... MESA to LESA 6,000 ... Wheel-line to SDI 21,000” | [Utah DWR Ag Optimization](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf) |
| `basin_depletion` | 2,387 | KAF/yr | confirmed | — | Strike Mar 2026 p.25 table | “Total Depletion 2,271 2,155 2,483 2,341 2,270 2,306 2,387” | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| `ag_depletion` | 1,584 | KAF/yr | confirmed | — | Strike Mar 2026 p.25, 2020–24 | “Agriculture ... 1,551” plus incidental losses 33 | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| `mi_depletion` | 354.4 | KAF/yr | corrected | 328 → 354.4 | Strike Mar 2026 p.25 and p.27 | “In 2024, the watering of residential lawns depleted 408.5 KAF…” | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| `charge_base` | 1,938.4 | KAF/yr | corrected | 1,912 → 1,938.4 | Strike Mar 2026 p.25 table | “Reservoir - Represents evaporation from reservoirs ... 27” | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| `irrigation_net_value` | 236 | $/AF | corrected | 133 → 236 | Tables B-7 and B-8 | “Full Season Alfalfa ... 1.50 \[AF per acre\] $236 \[cost per AF\]” | [Utah DWR Ag Optimization](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf) |
| `ag_charge_response` | 0.4 | coefficient | evidence | — | Abstract via EarthRef | “Elasticity estimates are drawn from 24 studies ... The mean price elasticity is 0.48.” | [AGU / Wiley](https://earthref.org/ERR/92882) |
| `ag_charge_cap` | 0.6 | share | evidence | — | Tables 5-1, 5-2 | “Alfalfa Full Season Fallow 1.504 \[AF/acre\]; ... 132,620 \[AF\]” | [Utah DWR Ag Optimization](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf) |
| `mi_elasticity` | 0.3 | price elasticity | evidence | — | p.295, 314 estimates | “sample mean of -.41, a median of -.35” | [Dalhuisen et al.](https://research.vu.nl/ws/files/1902894/LE%20Dalhuisen.pdf) |
| `mi_charge_cap` | 0.4 | share | evidence | — | Table 4-11 | “Total Potential M&I Water Use (gpcd) by Region – With All Aggressive Policy…” | [Utah DWR Regional Goals](https://conservewater.utah.gov/wp-content/uploads/2021/05/Regional-Water-Conservation-Goals-Report-Final.pdf) |
| `mi_reference_price` | 640 | $/AF | corrected | 380 → 640 | 2026/27 rates summary p.1 | “City of West Jordan ... 639.92; Taylorsville-Bennion ... 474.11; Draper ... 811.41” | [Jordan Valley WCD](https://jvwcd.gov/file/4c9e4734-97c0-4b46-9567-e5e5451bcff1/2026-2027-Adopted-Water-Rates.pdf) |
| `thermostat_speed` | 0.25 | per year | evidence | — | Utah Code 73-10-32 | “update the water provider's water conservation plan no less frequently than every five years” | [Utah Legislature](https://le.utah.gov/xcode/Title73/Chapter10/C73-10-S32_2026050620260701.html) |
| `escalator_step` | 0.12 | per year | evidence | — | EPA drought guide p.10 | “Emergency pricing or surcharge…” | [US EPA](https://www.epa.gov/sites/production/files/2017-10/documents/drought_guide_final_508compliant_october2017.pdf) |
| `escalator_cap` | 4 | multiple | evidence | — | EPA drought guide p.7 | “Drought restrictions can be enforced through educational warnings, code enforcement…” | [US EPA](https://www.epa.gov/sites/production/files/2017-10/documents/drought_guide_final_508compliant_october2017.pdf) |
| `escalator_deadband` | 0.15 | share of the goal | evidence | — | Strike Mar 2026 p.25 sidebar | “When depletions by sector are averaged from 1989-2023, the updated model shows…” | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| `hay_acres` | 228,000 | acres | corrected | 399,500 → 228,000 | 2022 Census, Utah Table 24 | “Forage ... Irrigated ... acres” | [USDA NASS](https://nass.usda.gov/Publications/AgCensus/2022/Full_Report/Volume_1,_Chapter_2_County_Level/Utah/st49_2_024_024.pdf) |
| `application_mean` | 2.4 | AF/acre | corrected | 2.64 → 2.4 | IWMS Table 39 | “Utah ... 523,658 ... 2.4 \[average acre-feet applied per acre\]” | [USDA NASS IWMS](https://www.nass.usda.gov/Publications/AgCensus/2022/Online_Resources/Farm_and_Ranch_Irrigation_Survey/iwms.pdf) |
| `application_cv` | 0.3 | coefficient of variation | range revised | — | IWMS Table 10 | “Utah ... 10,401 985,863 2,221,470 / 7,438 125,478 179,062…” | [USDA NASS IWMS](https://nass.usda.gov/Publications/AgCensus/2022/Online_Resources/Farm_and_Ranch_Irrigation_Survey/iwms.txt) |
| `hay_net_return` | 305 | $/acre | corrected | 175 → 305 | Table B-7, B.1.1.7 | “$355 ... A flat $50 per acre was added for full-season leasing” | [Utah DWR Ag Optimization](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf) |
| `levy_cut_cap` | 0.5 | share of application | evidence | — | Table 5-1 | “Split-season leasing Alfalfa Scenario 1 (cease irrigation after June) 0.770…” | [Utah DWR Ag Optimization](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf) |
| `levy_depletion_factor` | 1.3 | AF per AF/acre cut | evidence | — | B.1.1.10, Table B-8 | “Full season leasing yields the largest reduction in depletion per acre—1.5 AF/acre” | [Utah DWR Ag Optimization](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf) |
| `basin_lawns` | 743,000 | households | confirmed | — | Gardner projections, household growth | “household growth, from 1.2 million in 2025 to 2.3 million in 2065” | [Kem C. Gardner Policy Institute](https://www.utahbusiness.com/press-releases/2025/11/19/utah-population-projected-reach-over-5-million-2065-growth-change/) |
| `landscape_sqft` | 5,785 | sq ft | corrected | 6,938 → 5,785 | Table 4-9 | “Salt Lake 8,463 4,239 ... Utah 13,154 6,577 ... Davis 10,652 6,156” | [Utah DWR Regional Goals](https://conservewater.utah.gov/wp-content/uploads/2021/05/Regional-Water-Conservation-Goals-Report-Final.pdf) |
| `lawn_water` | 371 | KAF/yr | corrected | 408.5 → 371 | Section 4, Residential—Outdoors | “Outdoor residential water use ... averaging 108 gpcd” | [Utah DWR Regional Goals](https://conservewater.utah.gov/wp-content/uploads/2021/05/Regional-Water-Conservation-Goals-Report-Final.pdf) |
| `turf_need` | 24 | in/yr | corrected | 30 → 24 | Jackson & Mohadjer 2003 | “confirmed at near 24 inches of water per season” | [Irrigation Association](https://www.irrigation.org/IA/FileUploads/IA/Resources/TechnicalPapers/2003/SavingUtahWaterInTheFifthYearOfDrought.pdf) |
| `compliance_floor` | 0.35 | share | range revised | — | Waterloo news release (Finley & Basu) | “the restrictions, which ranged in stringency from just six to 42 hours of permitted watering…” | [University of Waterloo](https://uwaterloo.ca/news/media/outdoor-watering-restrictions-only-work-hottest-driest) |
| `season_value` | 140 | $/season | evidence | — | pp.61–62 | “$239 is the amount that householders are willing to pay, on average…” | [Hensher, Shore & Train](https://eml.berkeley.edu/~train/papers/HensherShoreTrain.pdf) |
| `urban_to_lake` | 0.25 | share | unsupported | — | Strike Jan 2025 p.22 | “Water conservation from various sectors ...” | [Strike Team Jan 2025](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2025/01/GSL-Jan2025.pdf) |
| `lease_to_own_rotation_multiplier` | 1 | multiple | evidence | — | FAQ, H.B. 410 answer | “farmers can receive compensation for temporarily leasing a portion of their water rights…” | [GSL Commissioner FAQ](https://greatsaltlake.utah.gov/faq/) |
| `lease_capacity` | 130 | KAF/yr | corrected | 200 → 130 | Impact Report letter p.2 | “voluntary water transactions in 2025 were nearly 72,500 acre-feet” | [GSL Watershed Enhancement Trust](https://media.audubon.org/2026-04/GSLWET_Impact_Report_2025.pdf) |
| `retire_capacity` | 150 | KAF/yr | range revised | — | Impact Report chart p.6 | “\~72,000 acre-feet of water transacted in 2025” | [GSL Watershed Enhancement Trust](https://media.audubon.org/2026-04/GSLWET_Impact_Report_2025.pdf) |
| `mandate_pull` | 0.7 | extra share of capacity | confirmed | — | 'SCPP participation doubles in 2024' | “For the 2024 iteration ... officials offered a fixed price per acre-foot…” | [Aspen Journalism / KJZZ](https://kjzz.org/content/1881386/using-less-colorado-river-takes-willing-farmer-and-45-million-federal-funds) |
| `lease_elasticity` | 1 | elasticity | evidence | — | same section | “The program paid about $45 million to participants in 2023 and 2024 combined…” | [Aspen Journalism / KJZZ](https://kjzz.org/content/1881386/using-less-colorado-river-takes-willing-farmer-and-45-million-federal-funds) |
| `lease_base_rate` | 250 | $/AF/yr | corrected | 380 → 250 | Section 5.1; Table B-8 | “full-season leasing were the top-performing leasing options, with an average cost of $236 per AF” | [Utah DWR Ag Optimization](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf) |
| `capital_price` | 6,000 | $/AF | range revised | — | article body | “purchase 942.75 acre-feet ... for just over $12,100 per…” | [Western Water](https://www.western-water.com/2023/10/03/utah-city-buys-historic-water-rights-for-sustainability/) |
| `lease_rate_floor` | 0.3 | multiple of base rate | evidence | — | 2023 and 2024 SCPP rounds | “an initial lowball offer from the UCRC of $150 per acre-foot was insulting” | [Aspen Journalism / KJZZ](https://kjzz.org/content/1881386/using-less-colorado-river-takes-willing-farmer-and-45-million-federal-funds) |
| `lease_rate_ceiling` | 6 | multiple of base rate | evidence | — | article body | “the Bureau of Reclamation initially said it would cap payments at $650 per acre-foot” | [Salt Lake Tribune](https://www.sltrib.com/news/environment/2023/11/30/test-program-price-river-promises/) |
| `state_interest` | 0.03 | share per year | corrected | 0.015 → 0.03 | Debt Affordability Study p.1–3 | “The State pays an average rate of 1.82% on outstanding GO debt” | [Utah State Treasurer](https://treasurer.utah.gov/wp-content/uploads/2025-Debt-Affordability-Study_Released-November-1.pdf) |
| `repossession_discount` | 0.26 | share below mean | evidence | — | B.1.1.5, Tables B-2, B-3 | “A special tabulation of 2012 Census of Agriculture data for more than two thousand Utah farms…” | [Utah DWR Ag Optimization](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf) |
| `mandate_floor` | 1,200 | KAF/yr | evidence (policy setting) | 1,100 → 1,200 (goal search) | Figure 11 sidebar | “To reach the minimum healthy lake elevation (4,198 feet) by 2055, mean annual inflows would…” | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| `mandate_phase` | 1 | years | evidence (policy setting) | 10 → 1 (goal search) | article body | “Utah's governor, Spencer Cox, pledged to refill the Great Salt Lake by 2034” | [New York Review of Books](https://www.nybooks.com/online/2026/06/14/putting-the-lake-to-work-great-salt-lake/) |
| `lake_value_per_af` | 2,440 | $/AF | derived | — | NBER w35270 press release | “For every additional acre-foot of water that reaches Great Salt Lake, the authors estimate…” | [Utah Business / NBER](https://www.utahbusiness.com/press-releases/2026/09/10/study-health-benefits-great-salt-lake-restoration-could-outweigh-costs/) |
| `hay_value_per_af` | 368 | $/AF | corrected | 245 → 368 | NASS bulletin 2024 p.15; USU 2011 App. I | “2019 ... 510 4.30 2,193 182.00 399,126 ... 2023 ... 490 4.00 1,960 222.00 435,120” | [NASS Utah bulletin](https://data.nass.usda.gov/Statistics_by_State/Utah/Publications/Annual_Statistical_Bulletin/2024-Agricultural-Statistics.pdf) |
| `forced_delivery_penalty` | 0.71 | share | no evidence | — | Strike Jan 2025 p.22 | No published delivery penalty for forced water. | [Strike Team Jan 2025](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2025/01/GSL-Jan2025.pdf) |
| `shepherd_start` | 150 | KAF/yr | confirmed | — | Figure 2, p.10 | “Figure 2: Water Dedicated and Delivered to Great Salt Lake, in Acre-feet, 2021-2025” | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| `shepherd_growth` | 25 | KAF/yr each year | evidence | — | Figure 2, p.10 | same figure, 2021–25 trend | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| `shepherd_monitor_max` | 50 | KAF/yr | no evidence | — | report body | “Utah Water Commissioners on 13 separate distribution systems within the basin actively…” | [USU ILWA](https://www.usu.edu/ilwa/reports/2023/water/2a-water-shepherding-salt-lake) |
| `shepherd_monitor_rate` | 2.4 | rate | no evidence | — | Section 3 | “Administrative oversight and cost to monitor depletion reductions will need to be considered” | [Utah DWR Ag Optimization](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf) |
| `measurement_gain_scale` | 60 | $M/yr | no evidence | — | Measurement Funding profile | “The legislature has appropriated $1 million of one-time and $1 million of ongoing funds…” | [Strike Team Jan 2025](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2025/01/GSL-Jan2025.pdf) |
| `ramp_years` | 3 | years | range revised | — | Section 5.3.3 | “Irrigation upgrades are assumed to occur evenly over 10 years.” | [Utah DWR Ag Optimization](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf) |
| `delivery_base` | 0.85 | share | evidence | — | Abstract | “Earlier qualitative interpretation of streamflow data downstream from the reservoir…” | [USGS SIR 2010-5198](https://pubs.usgs.gov/sir/2010/5198) |
| `measurement_gain_max` | 0.1 | share points | no evidence | — | 'Getting More Water to Great Salt Lake' | “The State Engineer must accurately measure water to verify that the conserved water is…” | [Strike Team Jan 2025](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2025/01/GSL-Jan2025.pdf) |
| `growth_draw_2055` | 92 | KAF/yr | unsupported | — | Figure 7 insights, p.13 | “Municipal and industrial depletions have not changed substantially since 1989.” | [Strike Team Jan 2025](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2025/01/GSL-Jan2025.pdf) |
| `streamflow_decline_2055` | 100 | KAF/yr | unsupported | — | Bardsley et al. 2013 | “the stream flow would decline by 1.8 to 6.5 percent for each degree of temperature rise” | [UCAR](https://news.ucar.edu/10534/rising-temperatures-challenge-salt-lake-citys-water-supply) |
| `farm_jobs_per_1000_acres` | 19.2 | jobs per 1,000 acres | confirmed | — | Gardner Institute, reported | “agricultural activity employed over 16,000 people and used nearly one-fifth of Utah's land” | [Deseret News](https://www.deseret.com/utah/2025/12/18/utah-farms-generated-2-billion-in-2022/) |
| `lake_jobs_full` | 7,706 | jobs | corrected | 8,650 → 7,706 | 'Estimated Total Economic Impact' slide | “TOTAL ALL SECTORS 7,706” | [Utah Legislature 2022](https://le.utah.gov/interim/2022/pdf/00004675.pdf) |
| `transition_jobs_per_m` | 7.4 | jobs per $M/yr | evidence | — | 'Estimated Benefits' table | “Pacific Northwest entities are very consistently within the 14-17 jobs per $1 million spent” | [Washington State](https://www.ezview.wa.gov/Portals/_1962/Documents/Restoration%20Economy%20Synthesis%20Memo.pdf) |
| `wage_per_job` | 65,800 | $ per job-year | confirmed | — | Table 19, State Total, 2024 | “2024 1,747,330 114,975,453,440 5,483 134,778” | [Utah DWS](https://jobs.utah.gov/wi/pubs/em/currentreport/table19.pdf) |
| `herd_feed_surplus` | 596,000 | tons/yr | unsupported | — | USU hay pricing factsheet | “The amount of hay exported for Utah has varied between 10% and 20% of production.” | [USU](https://farmanalysis.usu.edu/static/hay_pricing/pdfs/factsheet.pdf) |
| `hay_yield` | 4.3 | tons/acre | confirmed | — | 2025 State Agriculture Overview | “HAY, ALFALFA ... 4.3 TONS / ACRE” | [USDA NASS](https://www.nass.usda.gov/Quick_Stats/Ag_Overview/stateOverview.php?state=UTAH) |
| `livestock_jobs_at_risk` | 1,900 | jobs | unsupported | — | BLS QCEW 2024 | QCEW cattle and dairy wage jobs are about 1,670 statewide, 1,000 in the basin. | [BLS](https://data.bls.gov/cew/data/api/2024/a/area/49000.csv) |
| `wtp_household` | 128 | $/household/yr | confirmed | — | article body | “willing to pay between $113 and $144 per household each year” | [Salt Lake Tribune](https://www.sltrib.com/news/environment/2026/10/16/most-utahns-are-willing-open-their/) |
| `state_households` | 1,200,000 | households | corrected | 1,265,625 → 1,200,000 | 'Household growth' | “from 1.2 million in 2025 to 2.3 million in 2065” | [Kem C. Gardner Policy Institute](https://www.utahbusiness.com/press-releases/2025/11/19/utah-population-projected-reach-over-5-million-2065-growth-change/) |
| `pref_incentives` | 0.58 | share of voters | confirmed | — | Deseret/Hinckley March 2026 | “more than half of state voters (58%) prefer state solutions that incentivize…” | [Deseret/Hinckley via Yahoo](https://www.yahoo.com/news/articles/poll-utahns-willing-unwilling-save-010000750.html) |
| `pref_penalties` | 0.22 | share of voters | confirmed | — | same poll | “22% think the state should impose restrictions with penalties on cosmetic water use” | [Deseret/Hinckley via Yahoo](https://www.yahoo.com/news/articles/poll-utahns-willing-unwilling-save-010000750.html) |
| `industrial_pipeline_water` | 19.078 | KAF/yr | unsupported | — | Stratos coverage | “would divert about 1,215 acre-feet of water annually at full buildout” | [Salt Lake Tribune](https://www.sltrib.com/news/2026/10/20/kevin-olearys-utah-data-center/) |
| `mandate_penalty` | 0 | $/AF | evidence | — | Utah Code 73-2-26(1)(a) | “pay an administrative fine not to exceed: (A) $5,000 for each knowing violation” | [Utah Legislature](https://le.utah.gov/xcode/Title73/Chapter2/C73-2-S26_1800010118000101.html) |
| `repossess_cap` | 140 | KAF/yr | no evidence (policy setting) | 50 → 140 (goal search) | Strategic Plan p.32 | “additional funding will be needed to secure (i) 100,000 acre-feet…” | [GSL Strategic Plan](https://greatsaltlake.utah.gov/wp-content/uploads/Great-Salt-Lake-Strategic-Plan.pdf) |
| `inflow_cv` | 0.5 | coefficient of variation | corrected | 0.35 → 0.5 | USGS flows 2000–25; Strike p.24 | three-gauge water-year inflow, 2000–25, CV 0.49 | [USGS gauges](https://waterservices.usgs.gov/nwis/dv/?format=rdb&sites=10126000,10141000,10170490&parameterCd=00060&statCd=00003) |
| `inflow_ar1` | 0.35 | lag-one autocorrelation | evidence | — | USGS flows, water years | computed lag-1 autocorrelation 1989–2025 r = 0.44 | [USGS gauges](https://waterservices.usgs.gov/nwis/dv/?format=rdb&sites=10126000,10141000,10170490&parameterCd=00060&statCd=00003) |
| `sim_runs` | 120 | runs | evidence | — | Strike Mar 2026 p.31 | “Each scenario results from 1,000 simulations” | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| `fat_tail_factor` | 0.75 | multiplier in a long drought | evidence | — | USGS flows 1950–2025 | lowest 20-year mean against the long-run mean | [USGS gauges](https://waterservices.usgs.gov/nwis/dv/?format=rdb&sites=10126000,10141000,10170490&parameterCd=00060&statCd=00003) |
| `people_per_home` | 2.96 | people | corrected | 2.83 → 2.96 | 'Smaller household sizes' | “nearly 3.0 people in 2025” | [Kem C. Gardner Policy Institute](https://www.utahbusiness.com/press-releases/2025/11/19/utah-population-projected-reach-over-5-million-2065-growth-change/) |
| `share_in_basin` | 0.86 | share | corrected | 0.8 → 0.86 | UPC workbook, 2025 | “State of Utah 3551149.88” with basin counties summed | [Utah Population Committee](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2025/12/UPC-State-and-County-Population-Estimates-with-Components-of-Change-2020-2025.xlsx) |
| `share_with_lawn` | 0.72 | share | evidence | — | ACS 2024 B25024 | “total housing units 1,283,206; 1-unit detached 833,766” | [Census Reporter / ACS](https://api.censusreporter.org/1.0/data/show/latest?table_ids=B25024,B25032&geo_ids=04000US49,05000US49035) |
| `fine_collection` | 0.75 | share | evidence | — | Utica parking audit | “The City's parking violation collection rate is approximately 69 percent.” | [NY State Comptroller](https://www.osc.ny.gov/files/local-government/audits/2017-10/lgsa-audit-city-2015-utica.pdf) |
| `industrial_pipeline_jobs` | 11,900 | jobs | unsupported | — | Energy RFI booklet p.29 | “5 – 10K PERMANENT JOBS Estimated once fully operational” | [Utah Office of Energy Development](https://energy.utah.gov/wp-content/uploads/RFI-High-Level-Booklet.pdf) |

## Side tables, row by row

The biggest side-table change is to the lake itself: the area curve now follows the measured USGS table. Every row has its own record in `TABLE_VERIFICATION` and on the page's Index tab.

### Who depletes the water (now sums to 2,387 KAF)

| Row | Old (KAF/yr) | New (KAF/yr) | Basis | Source |
| --- | --: | --: | --- | --- |
| Alfalfa and other hay | 1,055 | 1,025 | Hay/turf about 857 of 1,324 KAF (65%) in Figure 2-5, applied to 1,584 | [Utah DWR Ag Optimization](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf) |
| Other crops, pasture, incidental losses | 529 | 559 | 1,584 − 1,025 | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| Mineral extraction | 152 | 136 | 2020–24 table, p.25; 186 KAF in 2020, 77 in 2024 | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| Industry, commerce, institutions | 176 | 218.4 | 640 M&I − 421.6 residential | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| Residential outdoor | 409 | 408.5 | “In 2024, the watering of residential lawns depleted 408.5 KAF” | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| Residential indoor | 66 | 13.1 | Outdoor is 96.9% of residential, so indoor is 3.1% of 421.6 | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| Reservoir evaporation | — | 27 | New row; 2020–24 table | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |

### Lake area by elevation

| Elevation (ft, NGVD29) | Model (sq mi) | USGS 2023 table (sq mi) | Verdict |
| --: | --: | --: | --- |
| 4,188.5 | 888 | 894 | confirmed |
| 4,198.5 | 1,594 (straight line) | 1,463 | line overstated by 9% |
| 4,200 | 1,700 | 1,602.3 | corrected |
| 4,211.5 | 2,300 | 2,229.1 | corrected |

The three anchors were replaced with the [USGS elevation-area table](https://www.sciencebase.gov/catalog/item/6467b42fd34ec11ae4a8afb1) (Root 2023) at one-foot steps. The closure factor was re-fitted to the Strike Team's three published long-term means: 0 → 4,191.1, +250 → 4,193.7 (the model had 4,193.8) and +800 → 4,198.0 ft. The fit has an RMS error of 0.23 ft, against 0.30 ft before.

### Inflow baselines

The baselines are ratios of water-year river inflow to the 2000–25 mean, from the [Bear, Weber and Jordan gauges](https://waterservices.usgs.gov/nwis/dv/?format=rdb&sites=10126000,10141000,10170490&parameterCd=00060&statCd=00003) for 1950–2025.

| Option | Old | New | Why |
| --- | --: | --: | --- |
| Recent drought → Driest recent decade (2013–22) | 0.88 | 0.86 | The last 20 years are 1.07, wetter than the base, so the old label was wrong |
| Thirty-year average → 2000–25 average | 1.00 | 1.00 | The base is 26 years, not 30 |
| Long-term → Full gauged record (1950–2025) | 1.09 | 1.37 | Measured on the gauges |
| Warming | 0.82 | 0.82 | About 4.7 °F at 3.8% less flow per °F ([UCAR](https://news.ucar.edu/10534/rising-temperatures-challenge-salt-lake-citys-water-supply)); the dry end of the range |

### Output per acre-foot by use

| Row | Model ($/AF) | Verdict | Check |
| --- | --: | --- | --- |
| Hay | 245 → 368 | corrected | Alfalfa $889/acre (2019–23) ÷ 2.41 ft net irrigation |
| All agriculture | 1,021 | unsupported | Statewide receipts ÷ basin depletion gives $1,303; the ratio mixes scopes |
| Minerals | 8,140 → 8,315 | corrected | $1,130.8M total output (2010 $) ÷ 136 KAF ([2022 slide](https://le.utah.gov/interim/2022/pdf/00004675.pdf)) |
| Nuclear, wet cooling | 27,000 | confirmed | 672 gal/MWh ([Macknick 2012](https://iopscience.iop.org/article/10.1088/1748-9326/7/4/045802)), so about $56/MWh |
| Nuclear, dry cooling | 8,400,000 | unsupported | Macknick has no nuclear dry-cooling factor |
| Institutional | 354,000 | confirmed | $33.1B GDP ÷ 94.6 KAF = $350k ([BEA](https://www.bea.gov/data/gdp/gdp-state)) |
| Manufacturing | 1,300,000 | confirmed | $29.7B ÷ 21.8 KAF = $1.36M |
| Commercial | 2,400,000 | confirmed | $224.9B ÷ 101.9 KAF = $2.2M |
| Data centres, Meta, QTS, Tooele | 46,000 to 3,500,000 | unsupported | No project publishes an annual water volume |

The M&I split uses DWR's 2015 statewide shares: commercial 14%, institutional 13%, industrial 3% ([DWR 2019, Figure 4-1](https://conservewater.utah.gov/wp-content/uploads/2021/05/Regional-Water-Conservation-Goals-Report-Final.pdf)).

### Lawn watering by month

All twelve months are confirmed. USU's turf net-irrigation figures for Salt Lake City airport (April to October: 0.71, 2.40, 4.31, 5.12, 4.52, 2.40 and 0.73 in) match the model's shares of 3, 12, 21, 25, 23, 13 and 3% to within a point. The citation moved to the [USU consumptive-use tables](https://extension.usu.edu/irrigation/files/Appendix_I_ET_NWS_Stations.pdf); the old DWR source has no monthly figures.

### Stakeholders and polling facts

| Fact in the model | Verdict | Source |
| --- | --- | --- |
| 88% of rural residents concerned | confirmed (citation moved from Noble) | [Deseret/Hinckley](https://www.deseret.com/politics/2026/05/27/poll-utahns-concerned-about-water-great-salt-lake/) |
| Democrats 78% / Republicans 36% very concerned | confirmed | [Deseret/Hinckley](https://www.deseret.com/politics/2026/05/27/poll-utahns-concerned-about-water-great-salt-lake/) |
| 81% back the federal package | confirmed for all voters, not Republicans alone | [Noble Predictive](https://www.noblepredictiveinsights.com/post/utah-voters-put-water-ahead-of-data-center-growth) |
| $113–144 per household | confirmed among those fairly sure it helps | [Salt Lake Tribune](https://www.sltrib.com/news/environment/2026/10/16/most-utahns-are-willing-open-their/) |
| Group weights | model judgement; no poll measures them | — |

### Legal assumptions

| Assumption | Verdict | Evidence |
| --- | --- | --- |
| HB 410 two-in-five field rule | confirmed | “no more than two years out of a five-year period on the same agricultural field” ([enrolled bill](https://le.utah.gov/Session/2026/bills/enrolled/HB0410.pdf)) |
| Water right separable from land | confirmed | “water rights can be owned and transferred separately from the land” ([Water Rights](https://www.waterrights.utah.gov/titleInfo/)) |
| No basin-wide curtailment for the lake | evidence | The State Engineer's plan curtails only in-lake rights ([DMP](https://waterrights.utah.gov/GSLDMP/final_GSL_distribution_management_plan_2025101.pdf)) |
| Shepherding protection still to build | evidence | [USU ILWA](https://www.usu.edu/ilwa/reports/2023/water/2a-water-shepherding-salt-lake) |
| Consumed-water charge, insulation, compulsory acquisition, statewide penalties, elevation sunsets | no evidence of current law | No statute found; absence cannot be quoted |

### Source list

All 34 hand-listed sources were opened on 2026-10-23.

- **Seven entries fixed:**
  - three homepage URLs pointed at the documents they name: the Distribution Management Plan, the Strategic Plan and the Farm Bureau update;
  - the USU simulations moved to the 2026 report;
  - the area source now points at the USGS data release;
  - two titles corrected.
- **Three sources block bots:** two Wiley papers and Aspen Journalism. They were read through an abstract or a reprint.

## Assumptions, their evidence, and the caveats

Of the model's assumptions, 33 have published evidence that supports or bounds them. Eight were labelled as sourced but appear in no source and are now marked as assumptions. Eight have no published evidence. The quote behind each one is in the table above.

### Unsupported: labelled as sourced, not found

| Number | Value | What the search found |
| --- | --: | --- |
| `phrag_delivery` | 0.9 share | The Strike Team says phragmites savings still need quantifying |
| `urban_to_lake` | 0.25 share | No basin figure for how much saved city water reaches the lake |
| `growth_draw_2055` | 92 KAF/yr | M&I depletion has been flat since 1989; no 2055 projection published |
| `streamflow_decline_2055` | 100 KAF/yr | Plausible from 1.8–6.5% per °F (Bardsley 2013), but not stated anywhere |
| `herd_feed_surplus` | 596,000 tons/yr | Utah exports 10–20% of its hay; no surplus figure |
| `livestock_jobs_at_risk` | 1,900 jobs | BLS shows about 1,000 cattle and dairy wage jobs in the basin |
| `industrial_pipeline_water` | 19.1 KAF/yr | No project publishes a volume; one data-centre filing shows about 1.2 KAF |
| `industrial_pipeline_jobs` | 11,900 jobs | The state's energy booklet says 5,000–10,000 permanent jobs |

### No published evidence

No published evidence was found for:

- `lease_to_own_dollars`
- `crop_delivery`
- `forced_delivery_penalty`
- `shepherd_monitor_max`
- `shepherd_monitor_rate`
- `measurement_gain_scale`
- `measurement_gain_max`
- `repossess_cap`

Three of these are policy settings the goal search chooses: `lease_to_own_dollars`, `repossess_cap` and the mandate. The other five describe how monitoring and forced water turn into delivered water. That matters, because monitoring is the largest budget line.

### Caveats

- **Evaporation, lake precipitation and the closure factor move together.**
  - `evap_gross` is confirmed: USGS gives about 45 in/yr for 1931–76.
  - But it is collinear with `precip_lake` and `inflow_efficiency`: all three are fitted jointly to the published equilibria.
  - The tornado chart moves each one alone, so it overstates how much `evap_gross` can move the answer by itself.
- **The starting stock of shepherded water includes in-lake water.** `shepherd_start` is confirmed, but much of it is mineral-company water left in the lake. It is not water delivered down the rivers, so it says little about how fast river shepherding can grow.
- **The goal hinges on untested levers.** The default package relies on three of them:
  - a 1,200 KAF mandate phased in over one year;
  - a $400/AF crop levy;
  - repossession.

  All three would need legislation that does not exist today (see Legal assumptions above).
- **Residential depletion mixes years.** It is published only for 2024. The non-residential remainder therefore mixes 2024 with 2020–24 averages; its 320–390 KAF range covers that.
- **The lawn module has a flaw.** It raises full fine revenue from any watering ask, however small: a 0.02% ask moved the lake 0.6 ft. The optimiser now ignores asks under 5%, but the module still needs a fix.

## Effect on the results

The corrections cost the old plan 0.7 ft by 2055 and $9B of NEV. The new default package recovers the goal at a lower NEV than the plan had before.

| Run (all at $100M/yr, year-by-year budget) | Lake in 2055 (ft) | Goal (4,198.5 ft) first met | NEV 2027–55 ($B) |
| --- | --: | --- | --: |
| Old plan, old numbers | 4,198.96 | 2051 | 59.05 |
| Old plan, corrected numbers | 4,198.25 | never | 50.04 |
| Old optimiser re-run, corrected numbers | 4,197.46 | never | 36.94 |
| **New default, corrected numbers** | **4,198.57** | **2047** | **55.00** |

Other figures that changed:

- **Baseline equilibrium.** At the 2000–25 average inflow the lake settles at 4,190.93 ft. Today's level, 4,189.7 ft on 2026-09-30, is below that after a dry year.
- **The 'Short of standing still' tile.** It now reads 'Where today's rivers leave it', because the lake is below its equilibrium.
- **Extra evaporation from refilling.** Raising the lake from today's level to the 4,198 ft floor adds about 853 KAF a year of evaporation.

The yearly budget spends all $100M every year:

- **Totals.** Monitoring $2,063M, phragmites $322M, water rights $290M, on-farm $104M, crop switching $82M, cloud seeding $40M.
- **2027.** All $100M goes to monitoring.
- **2028–36.** Phragmites takes about $30M a year.
- **From 2039.** Rights take $11–19M a year, as charge revenue that paid for contracts winds down.

The full table is in [research/budget-schedule.csv](https://github.com/iamrichardmaier-sudo/Save-the-Great-Salt-Lake/blob/claude/clever-bardeen-unjgd2/research/budget-schedule.csv).

### How fragile the goal is

| Change to the new default | Lake in 2055 (ft) | Meets goal |
| --- | --: | --- |
| Budget $125M / $150M / $200M | 4,198.65 / 4,198.68 / 4,198.69 | yes (2045 / 2044 / 2043) |
| Mandate floor 1,080 KAF (−10%) | 4,198.05 | no |
| No repossession | 4,197.94 | no |
| No crop levy | 4,198.11 | no |
| Lake response at its slow end (0.12) | 4,198.39 | no |
| Streamflow loss by 2055 at 300 KAF | 4,197.42 | no |
| Growth draw at 180 KAF | 4,198.02 | no |
| Inflow baseline: driest decade (0.86) | 4,196.94 | no |
| Inflow baseline: warming (0.82) | 4,196.51 | no |
| Inflow baseline: full gauged record (1.37) | 4,202.03 | yes (2035) |

What would close the gap robustly is not money, which saturates near 4,198.7 ft. It would take more of the levers that are already at their limits:

- shepherding capacity grown faster;
- more willing sellers;
- or a mandate above the 1,200 KAF dial maximum.

Each of those is a policy choice for the owner.

### Every corrected number, and its effect

24 coefficients changed. Each effect is that correction alone, put back to its old value on the old plan and on the new default (ft in 2055 / $B of NEV). The area curve and its fitted closure factor changed together, so they are measured together.

| Number | Old → new | Effect, old plan | Effect, new default | Locator | Quote | Source |
| --- | --- | --: | --: | --- | --- | --- |
| Lake area curve + `inflow_efficiency` | 3 anchors, 1.03 → USGS table, 0.933 | -0.23 / +0.00 | -0.31 / +0.00 | Great\_Salt\_Lake\_2023\_ElevAreaVolume\_total.csv; Strike Mar 2026 p.30 | “An additional 800 KAF/year results in a long-term mean lake level of 4,198.0” | [US Geological Survey data release](https://www.sciencebase.gov/catalog/item/6467b42fd34ec11ae4a8afb1), [Utah State University](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| Hay ground the levy could fall on (`hay_acres`) | 399,500 → 228,000 acres | -0.36 / -3.84 | -0.03 / -2.38 | 2022 Census of Agriculture, Utah Table 24 'Selected Crops Harvested: 2022', forage, 12 basin counties | “Forage - land used for all hay and haylage, grass silage, and greenchop ... Irrigated ... acres” | [USDA NASS](https://nass.usda.gov/Publications/AgCensus/2022/Full_Report/Volume_1,_Chapter_2_County_Level/Utah/st49_2_024_024.pdf) |
| How fast the lake moves toward its equilibrium (`response_k`) | 0.12 → 0.17 share of the remaining gap per year | +0.31 / +0.00 | +0.18 / +0.15 | Figure 19 insights, printed p.29 (PDF p.31) | “An additional 800 KAF/year of inflow results in a 2034 mean elevation of 4,196.9 feet and a long-term mean elevation of 4,198.0 feet.” | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| Net value of irrigation water to a farm (`irrigation_net_value`) | 133 → 236 $/AF | -0.03 / -2.08 | +0.00 / +0.02 | Tables B-7 and B-8 | “Full Season Alfalfa No irrigation during entire season 1.50 \[AF per acre\] $236 \[cost per AF\]” | [Utah DWR Ag Water Optimization](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf) |
| Phragmites removal, cost per acre-foot (`phrag_cost`) | 186 → 610 $/AF | -0.07 / -1.02 | -0.03 / -0.82 | DWR Aug 2025 M&I report p.81–82; 2026 interim slide | “estimated cost between $610 and $4,050 per ac-ft” (DWR); the slide gives $500/acre for 300 KAF/yr | [Utah Legislature](https://le.utah.gov/interim/2026/pdf/00000790.pdf), [Utah DWR M&I report](https://water.utah.gov/wp-content/uploads/2025/09/MI-Water-Conservation-Opportunities-Report-09_02_2025.pdf) |
| Added inflow the plan aims for (`goal_added`) | 875 → 800 KAF/yr | -0.08 / -0.92 | -0.00 / -0.02 | Long-term planning section, p.29 (PDF p.31) | “Additional 800 KAF/year inflow ... the additional inflow needed to fill Great Salt Lake to the minimum healthy lake level (4,198 feet) by 2055.” | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| Water applied per acre of hay (`application_mean`) | 2.64 → 2.4 AF/acre | -0.05 / -0.74 | -0.02 / -0.46 | IWMS 2023 Table 39, alfalfa, PDF p.161 | “Utah ... 523,658 \[irrigated acres harvested\] 2.4 \[average acre-feet applied per acre\]” | [USDA NASS IWMS](https://www.nass.usda.gov/Publications/AgCensus/2022/Online_Resources/Farm_and_Ranch_Irrigation_Survey/iwms.pdf) |
| What an acre-foot earns in hay (`hay_value_per_af`) | 245 → 368 $/AF | +0.00 / +0.00 | +0.02 / -1.56 | NASS bulletin 2024 p.15; USU 2011 Appendix I, Salt Lake City, alfalfa net irrigation | “2019 ... 510 4.30 2,193 182.00 399,126 ... 2023 ... 490 4.00 1,960 222.00 435,120”; net irrigation 28.97 in = 2.41 ft | [NASS Utah bulletin](https://data.nass.usda.gov/Statistics_by_State/Utah/Publications/Annual_Statistical_Bulletin/2024-Agricultural-Statistics.pdf), [USU consumptive use](https://extension.usu.edu/irrigation/files/Appendix_I_ET_NWS_Stations.pdf) |
| Net return on an acre of hay (`hay_net_return`) | 175 → 305 $/acre | -0.02 / -0.23 | +0.00 / +0.00 | Table B-7 and B.1.1.7 | “Full-Season Alfalfa ... $355 ... A flat $50 per acre was added for full-season leasing to account for additional leasing-related costs” | [Utah DWR Ag Water Optimization](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf) |
| Water the basin’s lawns use (`lawn_water`) | 408.5 → 371 KAF/yr | -0.02 / -0.19 | +0.00 / +0.00 | DWR 2019 Section 4, 'Residential—Outdoors' | “Outdoor residential water use is the largest single category of municipal water use, averaging 108 gpcd” | [Utah DWR Regional Goals](https://conservewater.utah.gov/wp-content/uploads/2021/05/Regional-Water-Conservation-Goals-Report-Final.pdf) |
| What cities and industry pay for water (`mi_reference_price`) | 380 → 640 $/AF | -0.00 / -0.22 | +0.00 / -0.01 | 2026/27 Adopted Water Rates Summary, p.1 | “City of West Jordan ... 639.92; Taylorsville-Bennion ... 474.11; Draper Irrigation ... 811.41 (Rate per Acre Foot)” | [Jordan Valley WCD](https://jvwcd.gov/file/4c9e4734-97c0-4b46-9567-e5e5451bcff1/2026-2027-Adopted-Water-Rates.pdf) |
| Water willing sellers will lease (`lease_capacity`) | 200 → 130 KAF/yr | +0.00 / +0.00 | +0.02 / +0.18 | Impact Report 2025, letter p.2; chart p.6 | “The Trust's voluntary water transactions in 2025 were nearly 72,500 acre-feet of water.” | [GSL Watershed Enhancement Trust](https://media.audubon.org/2026-04/GSLWET_Impact_Report_2025.pdf) |
| Lake elevation today (`lake_now`) | 4,191.1 → 4,189.7 ft | -0.01 / +0.00 | -0.01 / +0.00 | USGS 10010000 Saltair, daily mean elevation, ft NGVD29 | “2026-09-30 4189.7 (P); 2025-09-30 4191.1” | [USGS NWIS](https://waterservices.usgs.gov/nwis/dv/?format=json&sites=10010000&parameterCd=62614&startDT=2025-09-01&endDT=2026-10-23) |
| Minerals, commerce and industry (`mi_depletion`) | 328 → 354.4 KAF/yr | +0.00 / +0.02 | +0.00 / +0.00 | Strike 2026 PDF p.25 table (2020–24) and p.27 | “In 2024, the watering of residential lawns depleted 408.5 KAF ... outdoor depletions accounted for 96.9% of all residential depletions.” | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| Lease rate before scarcity or relief (`lease_base_rate`) | 380 → 250 $/AF/yr | +0.00 / +0.00 | -0.03 / +0.01 | Section 5.1; Table B-8 | “Ceasing alfalfa irrigation early and full-season leasing were the top-performing leasing options, with an average cost of $236 per AF.” | [Utah DWR Ag Water Optimization](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf) |
| Water the scarcity charge falls on (`charge_base`) | 1,912 → 1,938.4 KAF/yr | +0.00 / +0.00 | +0.00 / +0.00 | Strike 2026 PDF p.25 table, 2020–24 | “Reservoir - Represents evaporation from reservoirs ... 32 9 37 18 23 20 27” | [Strike Team Mar 2026](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) |
| Landscaped area per home (`landscape_sqft`) | 6,938 → 5,785 sq ft | +0.00 / +0.00 | +0.00 / +0.00 | Table 4-9, 2015 landscaped area per lot | “Salt Lake 8,463 4,239 ... Utah 13,154 6,577 ... Davis 10,652 6,156 ... Weber 11,880 6,828” | [Utah DWR Regional Goals](https://conservewater.utah.gov/wp-content/uploads/2021/05/Regional-Water-Conservation-Goals-Report-Final.pdf) |
| What turf actually needs (`turf_need`) | 30 → 24 inches/yr | +0.00 / +0.00 | +0.00 / +0.00 | Jackson & Mohadjer 2003, abstract | “The turf water requirement ... for the Salt Lake City area was confirmed at near 24 inches of water per season” | [Irrigation Association](https://www.irrigation.org/IA/FileUploads/IA/Resources/TechnicalPapers/2003/SavingUtahWaterInTheFifthYearOfDrought.pdf) |
| Interest on instalment purchases (`state_interest`) | 0.015 → 0.03 per year | +0.00 / +0.00 | -0.00 / +0.00 | 2025 Debt Affordability Study, p.1–3 | “The State pays an average rate of 1.82% on outstanding GO debt ... higher long-term interest rates” | [Utah State Treasurer](https://treasurer.utah.gov/wp-content/uploads/2025-Debt-Affordability-Study_Released-November-1.pdf) |
| Lake-economy jobs when healthy (`lake_jobs_full`) | 8,650 → 7,706 jobs | +0.00 / +0.00 | +0.00 / +0.00 | 'Estimated Total Economic Impact' slide | “TOTAL ALL SECTORS 7,706” | [Utah Legislature 2022](https://le.utah.gov/interim/2022/pdf/00004675.pdf) |
| Households in the state (`state_households`) | 1,265,625 → 1,200,000 | +0.00 / +0.00 | +0.00 / +0.00 | Key findings, 'Household growth' | “household growth, from 1.2 million in 2025 to 2.3 million in 2065.” | [Kem C. Gardner Policy Institute](https://www.utahbusiness.com/press-releases/2025/11/19/utah-population-projected-reach-over-5-million-2065-growth-change/) |
| Year-to-year spread in river inflow (`inflow_cv`) | 0.35 → 0.5 | +0.00 / +0.00 | +0.00 / +0.00 | USGS daily flows, 2000–25; Strike 2026 p.24 | “Total streamflow ... dropped below 1,000 KAF in 2021 and 2022 ... rebounded above 2,000 KAF in 2023 and 2024” | [USGS gauges](https://waterservices.usgs.gov/nwis/dv/?format=rdb&sites=10126000,10141000,10170490&parameterCd=00060&statCd=00003) |
| People per home (`people_per_home`) | 2.83 → 2.96 | +0.00 / +0.00 | +0.00 / +0.00 | Key findings, 'Smaller household sizes' | “a typical Utah household decreasing from nearly 3.0 people in 2025 to 2.3 in 2065.” | [Kem C. Gardner Policy Institute](https://www.utahbusiness.com/press-releases/2025/11/19/utah-population-projected-reach-over-5-million-2065-growth-change/) |
| Share of people inside the basin (`share_in_basin`) | 0.8 → 0.86 | +0.00 / +0.00 | +0.00 / +0.00 | UPC estimates workbook, 2025 column | “Total Population by County: 2020-2025 ... State of Utah 3551149.88” | [Utah Population Committee](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2025/12/UPC-State-and-County-Population-Estimates-with-Components-of-Change-2020-2025.xlsx) |

The goal search also moved policy settings. These are choices, not corrections.

| Setting | Old | New |
| --- | --: | --: |
| Monitoring ($M/yr) | 25 | 50 |
| Lease-to-own ($M/yr) | 30 | 2 |
| Mandate floor (KAF/yr) | 1,100 | 1,200 |
| Mandate phase-in (years) | 10 | 1 |
| Repossession | off | on |
| Repossession cap (KAF/yr) | 50 | 140 |
| Scarcity charge ($/AF) | 0 | 85, with escalator |
| Crop levy ($/AF) | 0 | 400 |
| Crop levy threshold (AF/acre) | 2.0 | 1.5 |
| Phragmites ($M/yr) | 10.5 | 25 |
| Crop switching ($M/yr) | 24 | 2.5 |

## How it connects

```
Programmes ─┐
Scarcity charge ─┤
Crop levy ─┤                                  Baseline and goal (1,665 KAF/yr now, +800 aimed for)
Rights and shepherding ─┼─► Delivery and losses ─┬─► Lake balance (USGS area curve) ─► Lake level by year
Mandate ─┤   (share reaching the lake,         │
Residential lawns ─┘    less growth, drying)    └─► Value, jobs and support (NEV) ─► guides ─► Year-by-year budget ─► funds the levers
```

Every coefficient feeds at least one stage. The map is read from the model's own code, so it cannot drift from what the model does. The page's "How it connects" tab and `npm run trace` (research/dependencies.json) list which number feeds which stage.

## Sources and method

Each cited source was downloaded fresh, and the figure was found and quoted with a locator. Every correction was re-opened by a reviewer before it was applied.

- **Where the records live.** The model holds 41 curated sources plus 73 more opened during the research, all listed in `src/sources.ts` and `src/research-sources.ts`.
- **Reproducing it.** The code is on [the branch](https://github.com/iamrichardmaier-sudo/Save-the-Great-Salt-Lake/tree/claude/clever-bardeen-unjgd2). To rerun:
  - `npm run verification` rebuilds the records;
  - `npm run goal-search` reruns the package search;
  - `npm run effects` reruns the effect of each correction;
  - `npm run schedule` rebuilds the yearly budget.

| Source | Publisher | Year |
| --- | --- | --: |
| [Great Salt Lake Data and Insights Summary](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf) | Great Salt Lake Strike Team and Utah DWR | 2026 |
| [Great Salt Lake 2025: Data and Insights](https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2025/01/GSL-Jan2025.pdf) | Great Salt Lake Strike Team | 2025 |
| [Utah Water Budget handout](https://water.utah.gov/wp-content/uploads/2025/12/Utah-Water-Budget-Handout.pdf) | Utah Division of Water Resources | 2025 |
| [Elevation-area-volume tables for Great Salt Lake, 2002–2016](https://www.sciencebase.gov/catalog/item/6467b42fd34ec11ae4a8afb1) | USGS data release (Root 2023) | 2023 |
| [Daily discharge: Bear (10126000), Weber (10141000), Jordan (10170490)](https://waterservices.usgs.gov/nwis/dv/?format=rdb&sites=10126000,10141000,10170490&parameterCd=00060&statCd=00003) | USGS NWIS | 2025 |
| [Great Salt Lake level at Saltair (10010000)](https://waterservices.usgs.gov/nwis/dv/?format=json&sites=10010000&parameterCd=62614&startDT=2025-09-01&endDT=2026-10-23) | USGS NWIS | 2026 |
| [Opportunities and Costs for Agricultural Water Optimization](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf) | Utah DWR, GSL Basin Integrated Plan | 2026 |
| [M&I Water Conservation Opportunities](https://water.utah.gov/wp-content/uploads/2025/09/MI-Water-Conservation-Opportunities-Report-09_02_2025.pdf) | Utah DWR | 2025 |
| [Utah's Regional M&I Water Conservation Goals](https://conservewater.utah.gov/wp-content/uploads/2021/05/Regional-Water-Conservation-Goals-Report-Final.pdf) | Utah DWR | 2019 |
| [Crop and Wetland Consumptive Use for Utah, Appendix I](https://extension.usu.edu/irrigation/files/Appendix_I_ET_NWS_Stations.pdf) | Utah State University for Utah DWR | 2011 |
| [Utah Annual Bulletin, 2024](https://data.nass.usda.gov/Statistics_by_State/Utah/Publications/Annual_Statistical_Bulletin/2024-Agricultural-Statistics.pdf) | USDA NASS | 2024 |
| [2022 Census of Agriculture, Utah Table 24](https://nass.usda.gov/Publications/AgCensus/2022/Full_Report/Volume_1,_Chapter_2_County_Level/Utah/st49_2_024_024.pdf) | USDA NASS | 2024 |
| [2023 Irrigation and Water Management Survey](https://www.nass.usda.gov/Publications/AgCensus/2022/Online_Resources/Farm_and_Ranch_Irrigation_Survey/iwms.pdf) | USDA NASS | 2024 |
| [GDP by state and industry (SAGDP2)](https://www.bea.gov/data/gdp/gdp-state) | US Bureau of Economic Analysis | 2026 |
| [Utah Employment and Wages, Table 19](https://jobs.utah.gov/wi/pubs/em/currentreport/table19.pdf) | Utah Department of Workforce Services | 2025 |
| [The Great Salt Lake Strategic Plan](https://greatsaltlake.utah.gov/wp-content/uploads/Great-Salt-Lake-Strategic-Plan.pdf) | Office of the Great Salt Lake Commissioner | 2024 |
| [Great Salt Lake Distribution Management Plan](https://waterrights.utah.gov/GSLDMP/final_GSL_distribution_management_plan_2025101.pdf) | Utah Division of Water Rights | 2025 |
| [H.B. 410 Water Leasing Amendments (enrolled)](https://le.utah.gov/Session/2026/bills/enrolled/HB0410.pdf) | Utah Legislature | 2026 |
| [2026 Final Legislative Update](https://www.utahfarmbureau.org/WebsitePageFile/file/6dc2fa3b-95fc-4449-a5b7-293e3c0edb8b/2026%20Final%20Legislative%20Update%20-%20FINAL.pdf) | Utah Farm Bureau Federation | 2026 |
| [Water Right Title Information](https://www.waterrights.utah.gov/titleInfo/) | Utah Division of Water Rights | 2026 |
| [Water shepherding: delivering saved water to Great Salt Lake](https://www.usu.edu/ilwa/reports/2023/water/2a-water-shepherding-salt-lake) | USU Institute for Land, Water and Air | 2023 |
| [Great Salt Lake economic contribution (Bioeconomics 2012)](https://le.utah.gov/interim/2022/pdf/00004675.pdf) | Utah Legislature | 2022 |
| [GSL Watershed Enhancement Trust 2025 Impact Report](https://media.audubon.org/2026-04/GSLWET_Impact_Report_2025.pdf) | GSL Watershed Enhancement Trust | 2026 |
| [2026/27 Adopted Water Rates](https://jvwcd.gov/file/4c9e4734-97c0-4b46-9567-e5e5451bcff1/2026-2027-Adopted-Water-Rates.pdf) | Jordan Valley Water Conservancy District | 2026 |
| [Operational water consumption and withdrawal factors](https://iopscience.iop.org/article/10.1088/1748-9326/7/4/045802) | Environmental Research Letters (Macknick et al.) | 2012 |
| [Rising temperatures challenge Salt Lake City's water supply](https://news.ucar.edu/10534/rising-temperatures-challenge-salt-lake-citys-water-supply) | UCAR | 2013 |
| [Utah voters put water ahead of data-center growth](https://www.noblepredictiveinsights.com/post/utah-voters-put-water-ahead-of-data-center-growth) | Noble Predictive Insights | 2026 |
| [Poll: Utahns are more worried than ever about water](https://www.deseret.com/politics/2026/05/27/poll-utahns-concerned-about-water-great-salt-lake/) | Deseret News and Hinckley Institute | 2026 |
| [Most Utahns are willing to open their wallets to save the Great Salt Lake](https://www.sltrib.com/news/environment/2026/10/16/most-utahns-are-willing-open-their/) | Salt Lake Tribune | 2026 |
| [2025 Debt Affordability Study](https://treasurer.utah.gov/wp-content/uploads/2025-Debt-Affordability-Study_Released-November-1.pdf) | Utah State Treasurer | 2025 |
