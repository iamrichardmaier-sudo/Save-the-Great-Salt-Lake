/**
 * Every source the model cites. Nothing in src/data.ts may carry a URL of its own:
 * it references a source id here, so the Index tab and the link checker have one list.
 */

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
    publisher: 'Utah State University, reported through the Great Salt Lake Strike Team',
    year: 2025,
    url: 'https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2025/01/GSL-Jan2025.pdf',
    use: 'Equilibrium lake elevation for a given sustained addition to inflow; the validation target for the evaporation balance.',
    locator: 'Conservation scenarios: fill to 4,198 ft in 5, 10 and 30 years',
  },
  {
    id: 'dwr_regional_goals',
    title: 'Regional Water Conservation Goals — lot and landscape area by region',
    publisher: 'Utah Division of Water Resources',
    year: 2024,
    url: 'https://water.utah.gov/conservation-goals/',
    use: 'Lot size, landscaped area and gallons per capita by water-conservancy region; the basis for the bottom-up lawn model.',
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
    id: 'usgs_fogsl_area',
    title: 'Great Salt Lake area and elevation relationship',
    publisher: 'US Geological Survey and Friends of Great Salt Lake',
    year: 2024,
    url: 'https://ut.water.usgs.gov/greatsaltlake/',
    use: 'Surface area at given lake elevations — the hypsometric anchors of the evaporation balance.',
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
    url: 'https://jobs.utah.gov/wi/data/library/industry/index.html',
    use: 'Employment base for farm, dairy and beef, and lake-economy job counts.',
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
    title: 'Poll: Utahns concerned about water and the Great Salt Lake',
    publisher: 'Deseret News and the Hinckley Institute of Politics (Morning Consult)',
    year: 2026,
    url: 'https://www.deseret.com/politics/2026/05/27/poll-utahns-concerned-about-water-great-salt-lake/',
    use: 'Partisan intensity of concern, support for a federal package.',
    locator: 'March and May 2026; 800 and 802 voters; margin ±3',
  },
  {
    id: 'weber_wtp',
    title: 'Most Utahns are willing to open their wallets for the Great Salt Lake',
    publisher: 'Salt Lake Tribune, reporting a Weber State University contingent-valuation study (Cavlovic, Gnagey, Frantz)',
    year: 2026,
    url: 'https://www.sltrib.com/news/environment/2026/10/16/most-utahns-are-willing-open-their/',
    use: 'Household willingness to pay per year; the implied statewide total.',
    locator: 'Survey fielded August 2025; 1,050 weighted responses; under peer review',
  },
  {
    id: 'farm_bureau_2026',
    title: 'Utah Farm Bureau 2026 Legislative Update',
    publisher: 'Utah Farm Bureau Federation',
    year: 2026,
    url: 'https://www.utahfarmbureau.org/',
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
    id: 'lower_basin_2023',
    title: 'Lower Colorado Basin states compromise on water conservation',
    publisher: 'Greenberg Traurig',
    year: 2023,
    url: 'https://www.gtlaw.com/en/insights/2023/5/lower-colorado-basin-states-compromise-on-water-conservation',
    use: 'Paid conservation agreed under a credible threat of federal curtailment — the mandate-pull dynamic.',
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
    title: 'Distribution Management Plan',
    publisher: 'Utah Division of Water Rights, Office of the State Engineer',
    year: 2025,
    url: 'https://waterrights.utah.gov/',
    use: 'What the distribution system does and does not do for saved or leased water moving to the lake.',
    locator: 'October 2025 plan',
  },
  {
    id: 'gsl_commissioner',
    title: 'Great Salt Lake Strategic Plan',
    publisher: 'Office of the Great Salt Lake Commissioner, State of Utah',
    year: 2024,
    url: 'https://greatsaltlake.utah.gov/',
    use: 'The 4,198–4,205 ft target range and the additional inflow the state believes it needs.',
  },
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
