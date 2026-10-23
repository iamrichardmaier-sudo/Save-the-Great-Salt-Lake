/**
 * Every source the model cites. Nothing in src/data.ts may carry a URL of its own:
 * it references a source id here, so the Index tab and the link checker have one list.
 * Sources opened while verifying the numbers are generated into research-sources.ts and
 * appended here.
 */

import { RESEARCH_SOURCES } from './research-sources';

export interface Source {
  id: string;
  title: string;
  publisher: string;
  year: number;
  url: string;
  /** What this source is used for, in plain words. */
  use: string;
  /** Where in the document the figure sits, when the source is long. */
  locator?: string;
}

export const SOURCES: Source[] = [
  {
    id: 'dwr_gsl',
    title: 'Great Salt Lake — water budget, basin reports and planning data',
    publisher: 'Utah Division of Water Resources',
    year: 2025,
    url: 'https://water.utah.gov/great-salt-lake/',
    use: 'Basin water budget, depletion by sector, lake planning figures.',
  },
  {
    id: 'strike_2025',
    title: 'Great Salt Lake 2025: Data and Insights',
    publisher: 'Great Salt Lake Strike Team (University of Utah, Utah State University and state agencies)',
    year: 2025,
    url: 'https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2025/01/GSL-Jan2025.pdf',
    use: 'Lake elevation, elevation categories, human depletion by type 1989–2023, conservation scenarios.',
    locator: 'Figures 1–8; depletion table p.13',
  },
  {
    id: 'strike_2026',
    title: 'Great Salt Lake Data and Insights Summary',
    publisher: 'Great Salt Lake Strike Team and Utah Division of Water Resources',
    year: 2026,
    url: 'https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf',
    use: 'Updated water budget, sector depletion shares, M&I basin trends and drought-risk context.',
    locator: 'Figures 13–14; water-budget update discussion',
  },
  {
    id: 'strike_update',
    title: 'Great Salt Lake Strike Team update',
    publisher: 'Wilkes Center for Climate Science and Policy, University of Utah',
    year: 2025,
    url: 'https://science.utah.edu/wilkes-center/gsl-strike-team-update/',
    use: 'End-of-water-year elevation, mineral-company water agreements, dedicated deliveries.',
  },
  {
    id: 'usu_sims',
    title: 'Utah State University Great Salt Lake level simulations',
    publisher: 'Utah State University (Tarboton 2025), reported in the Strike Team’s March 2026 summary',
    year: 2026,
    url: 'https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf',
    use: 'Equilibrium lake elevation for a given sustained addition to inflow; the validation target for the evaporation balance.',
    locator: 'Figure 20 and insights, printed p.30 (Tarboton 2025): long-term mean 4,191.1, 4,193.7 and 4,198.0 ft for 0, 250 and 800 KAF/yr added',
  },
  {
    id: 'dwr_regional_goals',
    title: 'Utah’s Regional M&I Water Conservation Goals',
    publisher: 'Utah Division of Water Resources',
    year: 2019,
    url: 'https://conservewater.utah.gov/wp-content/uploads/2021/05/Regional-Water-Conservation-Goals-Report-Final.pdf',
    use: 'Lot size and landscaped area per lot by county, and regional conservation goals; the basis for the bottom-up lawn model.',
    locator: 'Table 4-9, Reduction in Average Lot Size by County: Salt Lake 8,463 sq ft lot and 4,239 sq ft landscaped, Box Elder 15,264 and 8,759, Cache 12,805 and 7,770 (2015)',
  },
  {
    id: 'gardner_proj',
    title: 'Vintage 2025 state and county population and employment projections',
    publisher: 'Kem C. Gardner Policy Institute, University of Utah',
    year: 2025,
    url: 'https://gardner.utah.edu/demographics/population-projections/',
    use: 'Basin population and household growth, employment base for the jobs model.',
  },
  {
    id: 'nass_utah',
    title: 'Utah Agricultural Statistics and Annual Profile',
    publisher: 'USDA National Agricultural Statistics Service',
    year: 2025,
    url: 'https://www.nass.usda.gov/Statistics_by_State/Utah/',
    use: 'Irrigated acres, hay yield and price, livestock numbers and cash receipts.',
  },
  {
    id: 'nass_iwms_2023',
    title: '2023 Irrigation and Water Management Survey',
    publisher: 'USDA National Agricultural Statistics Service',
    year: 2024,
    url: 'https://data.nass.usda.gov/Publications/AgCensus/2022/Online_Resources/Farm_and_Ranch_Irrigation_Survey/index.php',
    use: 'Irrigation application, source, method and farm-size tables; analogue for field-to-field application spread.',
  },
  {
    id: 'usgs_fogsl_area',
    title: 'Half-meter topobathymetric elevation model and elevation-area-volume tables for Great Salt Lake, Utah, 2002–2016',
    publisher: 'US Geological Survey data release (Root, 2023), doi:10.5066/P9DGG75W',
    year: 2023,
    url: 'https://www.sciencebase.gov/catalog/item/6467b42fd34ec11ae4a8afb1',
    use: 'Surface area at given lake elevations — the hypsometric anchors of the evaporation balance.',
    locator: 'Great_Salt_Lake_2023_ElevAreaVolume_total.csv, area_mi2 by elev_ft_NGVD29',
  },
  {
    id: 'bea_gdp',
    title: 'GDP by industry, Utah',
    publisher: 'US Bureau of Economic Analysis',
    year: 2025,
    url: 'https://www.bea.gov/data/gdp/gdp-state',
    use: 'Industry output per sector, used for output per acre-foot by use.',
  },
  {
    id: 'dws_jobs',
    title: 'Utah employment by industry and county',
    publisher: 'Utah Department of Workforce Services',
    year: 2025,
    url: 'https://jobs.utah.gov/wi/update/index.html',
    use: 'Employment base for farm, dairy and beef, and lake-economy job counts.',
  },
  {
    id: 'dws_wages',
    title: 'Utah Employment and Wages, annual averages by industry (Table 19)',
    publisher: 'Utah Department of Workforce Services',
    year: 2025,
    url: 'https://jobs.utah.gov/wi/pubs/em/currentreport/table19.pdf',
    use: 'Average annual wage, used to value jobs the budget creates.',
  },
  {
    id: 'noble_2026',
    title: 'Utah voters put water ahead of data-center growth (Utah Public Opinion Pulse)',
    publisher: 'Noble Predictive Insights',
    year: 2026,
    url: 'https://www.noblepredictiveinsights.com/post/utah-voters-put-water-ahead-of-data-center-growth',
    use: 'Incentives versus penalties preference, rural and urban concern, data-centre opposition, who should decide.',
    locator: 'Field 8–12 September 2026; 602 registered voters; margin ±3.99',
  },
  {
    id: 'deseret_2026',
    title: 'Poll: Utahns are more worried than ever about water',
    publisher: 'Deseret News and the Hinckley Institute of Politics (Morning Consult)',
    year: 2026,
    url: 'https://www.deseret.com/politics/2026/05/27/poll-utahns-concerned-about-water-great-salt-lake/',
    use: 'Partisan intensity of concern, support for a federal package.',
    locator: 'March and May 2026; 800 and 802 voters; margin ±3',
  },
  {
    id: 'weber_wtp',
    title: 'Most Utahns are willing to open their wallets to save the Great Salt Lake',
    publisher: 'Salt Lake Tribune, reporting a Weber State University contingent-valuation study (Cavlovic, Gnagey, Frantz)',
    year: 2026,
    url: 'https://www.sltrib.com/news/environment/2026/10/16/most-utahns-are-willing-open-their/',
    use: 'Household willingness to pay per year; the implied statewide total.',
    locator: 'Survey fielded August 2025; 1,050 weighted responses; under peer review',
  },
  {
    id: 'gsl_industry_recreation',
    title: 'Industry and Recreation',
    publisher: 'Office of the Great Salt Lake Commissioner',
    year: 2026,
    url: 'https://greatsaltlake.utah.gov/industry-recreation/',
    use: 'Lake-economy sectors including brine shrimp, mineral extraction, recreation and skiing.',
  },
  {
    id: 'gsl_dust_mitigation_2026',
    title: 'Study: Dust Mitigation Options and Costs for Great Salt Lake',
    publisher: 'Wilkes Center for Climate Science and Policy, University of Utah',
    year: 2026,
    url: 'https://wilkescenter.utah.edu/great-salt-lake/study-dust-mitigation-options-and-costs/',
    use: 'Dust-control options, exposed-lakebed mitigation framing and cost context.',
  },
  {
    id: 'farm_bureau_2026',
    title: '2026 Final Legislative Update',
    publisher: 'Utah Farm Bureau Federation',
    year: 2026,
    url: 'https://www.utahfarmbureau.org/WebsitePageFile/file/6dc2fa3b-95fc-4449-a5b7-293e3c0edb8b/2026%20Final%20Legislative%20Update%20-%20FINAL.pdf',
    use: 'HB 60, HB 348, HB 410 and HB 76; the agricultural position on transfers and leasing.',
  },
  {
    id: 'scpp_aspen',
    title: 'Using less of the Colorado River takes a willing farmer and $45 million in federal funds',
    publisher: 'Aspen Journalism, on the Upper Colorado River Commission System Conservation Pilot Program',
    year: 2024,
    url: 'https://aspenjournalism.org/using-less-of-the-colorado-river-takes-a-willing-farmer-and-45-million-in-federal-funds/',
    use: 'Participation response to a fixed price; awareness and trust among water users; the 64-to-109 project jump.',
  },
  {
    id: 'irrigation_elasticity_meta',
    title: 'Price responsiveness of irrigation water demand: A meta-analysis',
    publisher: 'Water Resources Research',
    year: 2006,
    url: 'https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2005WR004009',
    use: 'Empirical analogue for agricultural response to water prices and charges.',
  },
  {
    id: 'epa_conservation_guidelines',
    title: 'Water Conservation Plan Guidelines',
    publisher: 'US Environmental Protection Agency',
    year: 1998,
    url: 'https://www.epa.gov/watersense/water-conservation-plan-guidelines',
    use: 'General conservation planning structure for public water systems and demand-management measures.',
  },
  {
    id: 'epa_drought_response',
    title: 'Drought Response and Recovery: A Basic Guide for Water Utilities',
    publisher: 'US Environmental Protection Agency',
    year: 2016,
    url: 'https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=P100T4ID.TXT',
    use: 'Outdoor restriction enforcement tools, enforcement lag and drought-response implementation.',
  },
  {
    id: 'finley_2020',
    title: 'Curbing the Summer Surge: Permanent Outdoor Water Use Restrictions in Humid and Semiarid Cities',
    publisher: 'Water Resources Research',
    year: 2020,
    url: 'https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2019WR026466',
    use: 'Evidence that restriction stringency, watering days and enforcement details affect outdoor water savings.',
  },
  {
    id: 'slc_rates_2026',
    title: 'Current Rates',
    publisher: 'Salt Lake City Department of Public Utilities',
    year: 2026,
    url: 'https://www.slc.gov/utilities/pay-my-bill/current-rates/',
    use: 'Local water-rate anchor for converting percentage price response to dollars per acre-foot.',
  },
  {
    id: 'dwr_mi_reporting',
    title: 'Water Use Reporting',
    publisher: 'Utah Division of Water Resources',
    year: 2026,
    url: 'https://water.utah.gov/water-data/water-use-reporting/',
    use: 'Municipal and industrial water-use reporting method and open-data access.',
  },
  {
    id: 'lower_basin_2023',
    title: 'Lower Colorado Basin states compromise on water conservation',
    publisher: 'Greenberg Traurig',
    year: 2023,
    url: 'https://www.gtlaw.com/en/insights/2023/5/lower-colorado-basin-states-compromise-on-water-conservation',
    use: 'Paid conservation agreed under a credible threat of federal curtailment — the mandate-pull dynamic.',
  },
  {
    id: 'ag_optimization_2026',
    title: 'Opportunities and Costs for Agricultural Water Optimization in the Great Salt Lake Basin',
    publisher: 'Utah Division of Water Resources, Great Salt Lake Basin Integrated Plan',
    year: 2026,
    url: 'https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf',
    use: 'Agricultural depletion estimates, feasibility limits, programme capacities, costs and implementation caveats.',
  },
  {
    id: 'macknick_2012',
    title: 'Operational water consumption and withdrawal factors for electricity generating technologies',
    publisher: 'Environmental Research Letters (Macknick, Newmark, Heath and Hallett), with NREL',
    year: 2012,
    url: 'https://iopscience.iop.org/article/10.1088/1748-9326/7/4/045802',
    use: 'Water consumed per megawatt-hour by cooling type, for the output per acre-foot comparison.',
  },
  {
    id: 'state_engineer_dmp',
    title: 'Great Salt Lake Distribution Management Plan',
    publisher: 'Utah Division of Water Rights, Office of the State Engineer',
    year: 2025,
    url: 'https://waterrights.utah.gov/GSLDMP/final_GSL_distribution_management_plan_2025101.pdf',
    use: 'What the distribution system does and does not do for saved or leased water moving to the lake.',
    locator: 'October 2025 plan',
  },
  {
    id: 'hb410_2026',
    title: 'H.B. 410 Water Leasing Amendments',
    publisher: 'Utah Legislature',
    year: 2026,
    url: 'https://le.utah.gov/Session/2026/bills/static/HB0410.html',
    use: 'Great Salt Lake Preservation Program and the two-in-five full-season leasing limit for a single field.',
  },
  {
    id: 'gsl_faq',
    title: 'Frequently Asked Questions',
    publisher: 'Office of the Great Salt Lake Commissioner',
    year: 2026,
    url: 'https://greatsaltlake.utah.gov/faq/',
    use: 'Plain-English description of HB 410 water leasing and the two-of-five-years full-season leasing limit.',
  },
  {
    id: 'utah_water_right_title',
    title: 'Water Right Title Information',
    publisher: 'Utah Division of Water Rights',
    year: 2026,
    url: 'https://www.waterrights.utah.gov/titleInfo/',
    use: 'Water rights can be owned or transferred separately from land; change applications are required for changed use.',
  },
  {
    id: 'gsl_commissioner',
    title: 'The Great Salt Lake Strategic Plan',
    publisher: 'Office of the Great Salt Lake Commissioner, State of Utah',
    year: 2024,
    url: 'https://greatsaltlake.utah.gov/wp-content/uploads/Great-Salt-Lake-Strategic-Plan.pdf',
    use: 'The 4,198–4,205 ft target range and the additional inflow the state believes it needs.',
  },
  {
    id: 'usu_consumptive_use',
    title: 'Crop and Wetland Consumptive Use and Open Water Surface Evaporation for Utah, Appendix I: NWS stations',
    publisher: 'Utah State University for the Utah Division of Water Resources (Hill, Barker and Lewis)',
    year: 2011,
    url: 'https://extension.usu.edu/irrigation/files/Appendix_I_ET_NWS_Stations.pdf',
    use: 'Monthly turfgrass net irrigation requirement at Salt Lake City airport; the monthly lawn-watering profile.',
    locator: 'Salt Lake City Intl AP, 1971–2008, Turfgrass Net Irr, PDF p.254',
  },
  {
    id: 'usgs_gauges',
    title: 'Daily discharge: Bear River near Corinne (10126000), Weber River near Plain City (10141000), Jordan River (10170490)',
    publisher: 'US Geological Survey, National Water Information System',
    year: 2025,
    url: 'https://waterservices.usgs.gov/nwis/dv/?format=rdb&sites=10126000,10141000,10170490&parameterCd=00060&statCd=00003',
    use: 'Water-year river inflow, for the ratios behind the inflow baselines.',
  },
  {
    id: 'ucar_2013',
    title: 'Rising temperatures challenge Salt Lake City’s water supply (Bardsley et al. 2013)',
    publisher: 'University Corporation for Atmospheric Research',
    year: 2013,
    url: 'https://news.ucar.edu/10534/rising-temperatures-challenge-salt-lake-citys-water-supply',
    use: 'Streamflow falls 1.8–6.5% per degree Fahrenheit of warming; bounds the warming baseline.',
  },
  {
    id: 'usu_shepherding',
    title: '2A: Water shepherding: delivering saved water to Great Salt Lake',
    publisher: 'Utah State University, Janet Quinney Lawson Institute for Land, Water and Air',
    year: 2023,
    url: 'https://www.usu.edu/ilwa/reports/2023/water/2a-water-shepherding-salt-lake',
    use: 'Shepherding saved water to the lake needs measurement and tracking still to be built.',
  },
  {
    id: 'hb410_enrolled',
    title: 'H.B. 410 Water Leasing Amendments (enrolled)',
    publisher: 'Utah Legislature',
    year: 2026,
    url: 'https://le.utah.gov/Session/2026/bills/enrolled/HB0410.pdf',
    use: 'Utah Code 73-34-302(1)(b): two full-season leases in five years on the same field.',
  },
  {
    id: 'le_interim_2022',
    title: 'Great Salt Lake economic contribution (Bioeconomics 2012), Natural Resources Interim Committee presentation',
    publisher: 'Utah Legislature',
    year: 2022,
    url: 'https://le.utah.gov/interim/2022/pdf/00004675.pdf',
    use: 'Lake-economy output and employment by sector, including mineral extraction.',
    locator: 'Estimated Total Economic Impact slide',
  },
  {
    id: 'nass_bulletin_2024',
    title: 'Utah Annual Bulletin, 2024',
    publisher: 'USDA National Agricultural Statistics Service',
    year: 2024,
    url: 'https://data.nass.usda.gov/Statistics_by_State/Utah/Publications/Annual_Statistical_Bulletin/2024-Agricultural-Statistics.pdf',
    use: 'Hay acres, yield, price and value of production; farm cash receipts.',
    locator: 'p.9 cash receipts; p.15 hay tables',
  },
  ...RESEARCH_SOURCES,
];

const BY_ID = new Map(SOURCES.map((s) => [s.id, s]));

export function source(id: string): Source {
  const s = BY_ID.get(id);
  if (!s) throw new Error(`Unknown source id: ${id}`);
  return s;
}

export function sourcesFor(ids: readonly string[]): Source[] {
  return ids.map(source);
}
