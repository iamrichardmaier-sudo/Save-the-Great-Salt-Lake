# Writes research/verification/results/tables.json: one research record per side-table row and per
# hand-listed source. Every quote here was copied from a page or PDF opened on 2026-10-23.
# Usage: python3 -I tables_records.py <sources.tsv from src/sources.ts> <out tables.json> <out overrides.json>
import json, sys
S26="https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2026/03/GSL-Summary-Mar2026.pdf"
AG="https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf"
NASSB="https://data.nass.usda.gov/Statistics_by_State/Utah/Publications/Annual_Statistical_Bulletin/2024-Agricultural-Statistics.pdf"
LE22="https://le.utah.gov/interim/2022/pdf/00004675.pdf"
BEA="https://www.bea.gov/data/gdp/gdp-state"
DWRG="https://conservewater.utah.gov/wp-content/uploads/2021/05/Regional-Water-Conservation-Goals-Report-Final.pdf"
MACK="https://iopscience.iop.org/article/10.1088/1748-9326/7/4/045802"
GAUGE="https://waterservices.usgs.gov/nwis/dv/?format=rdb&sites=10126000,10141000,10170490&parameterCd=00060&statCd=00003"
UCAR="https://news.ucar.edu/10534/rising-temperatures-challenge-salt-lake-citys-water-supply"
USUI="https://extension.usu.edu/irrigation/files/Appendix_I_ET_NWS_Stations.pdf"
EAV="https://www.sciencebase.gov/catalog/item/6467b42fd34ec11ae4a8afb1"
HB410E="https://le.utah.gov/Session/2026/bills/enrolled/HB0410.pdf"
FB26="https://www.utahfarmbureau.org/WebsitePageFile/file/6dc2fa3b-95fc-4449-a5b7-293e3c0edb8b/2026%20Final%20Legislative%20Update%20-%20FINAL.pdf"
DMP="https://waterrights.utah.gov/GSLDMP/final_GSL_distribution_management_plan_2025101.pdf"
ILWA="https://www.usu.edu/ilwa/reports/2023/water/2a-water-shepherding-salt-lake"
PLAN="https://greatsaltlake.utah.gov/wp-content/uploads/Great-Salt-Lake-Strategic-Plan.pdf"
NOBLE="https://www.noblepredictiveinsights.com/post/utah-voters-put-water-ahead-of-data-center-growth"
DES="https://www.deseret.com/politics/2026/05/27/poll-utahns-concerned-about-water-great-salt-lake/"
TRIB="https://www.sltrib.com/news/environment/2026/10/16/most-utahns-are-willing-open-their/"
TITLE="https://www.waterrights.utah.gov/titleInfo/"
FAQ="https://greatsaltlake.utah.gov/faq/"

def R(id, vm, verdict, quote, locator, url, title, pub, year, vn=None, lo=None, hi=None, arith="", notes="", conf="High", extra=None):
    return dict(id=id, value_model=vm, verdict=verdict, value_new=vn, low_new=lo, high_new=hi, quote=quote, locator=locator, url=url,
                source_title=title, publisher=pub, year=year, extra_sources=extra or [], arithmetic=arith, notes=notes, confidence=conf)
def X(title,pub,year,url,quote,locator): return dict(title=title,publisher=pub,year=year,url=url,quote=quote,locator=locator)

ST=("Great Salt Lake Data and Insights Summary","Great Salt Lake Strike Team and Utah Division of Water Resources",2026)
DEPL_Q="Total Depletion 2,271 2,155 2,483 2,341 2,270 2,306 2,387"
DEPL_L="PDF p.25 (printed p.23), Average Depletion (KAF/year) table, column 2020-2024: Agriculture 1,551; Reservoir 27; Agricultural incidental losses 33; M&I 640; GSL mineral extraction 136"
RES_Q="In 2024, the watering of residential lawns depleted 408.5 KAF ... In 2024, outdoor depletions accounted for 96.9% of all residential depletions."
RES_L="PDF p.27 (printed p.25), Figures 14-15 insights"
GAUGE_T=("USGS daily discharge, Bear River near Corinne (10126000), Weber River near Plain City (10141000), Jordan River (10170490)","US Geological Survey",2025)
GQ="USGS 10126000 BEAR RIVER NEAR CORINNE, UT ... 00060 00003 ... Discharge, cubic feet per second (Mean)"
GAUGE_A="Water-year sums of daily mean discharge x 1.98347 AF per cfs-day, three gauges, complete years 1950-2025 (69 common years). Means: 2000-2025 1,373 KAF; driest 10-yr window 2013-2022 1,181 KAF (0.86); last 20 yrs 2006-2025 1,469 (1.07); 1996-2025 1,573 (1.15); 1950-2025 1,879 (1.37). Ratios are taken against 2000-2025 because the model's baseline_inflow (1,665 KAF) is the Strike Team's 2000-2025 average; the three gauges miss ungauged and minor inflow, so only ratios are used."

recs=[]
# ---------- BASELINES
recs += [
 R("BASELINES/recent",0.88,"corrected",GQ,"computed from USGS daily values; see arithmetic",GAUGE,*GAUGE_T,vn=0.86,arith=GAUGE_A,
   notes="The 'last two decades' are not drier than the model's 2000-2025 base: 2006-2025 is 1.07 of it. The driest decade on the gauges is 2013-2022 at 0.86, close to the model's 0.88. Relabel as the driest recent decade (2013-2022) and set 0.86.",conf="Medium",
   extra=[X(*ST,S26,"Total streamflow from the Bear, Weber, and Jordan rivers dropped below 1,000 KAF in 2021 and 2022—the lowest levels since 2004.","PDF p.24, River Inflow insights")]),
 R("BASELINES/thirty",1.0,"corrected","Between 2000 and 2025, inflows averaged 1,665 KAF per year.","PDF p.24 (printed p.22) River Inflow insights; repeated p.30",S26,*ST,vn=1.0,
   notes="Value 1.0 is right by construction, but the label is wrong: baseline_inflow is the 26-year 2000-2025 average, not a thirty-year average. Relabel '2000-2025 average'.",conf="High"),
 R("BASELINES/long",1.09,"corrected",GQ,"computed from USGS daily values; see arithmetic",GAUGE,*GAUGE_T,vn=1.37,arith=GAUGE_A,
   notes="The full common gauge record (1950-2025) averages 1.37 times the 2000-2025 base, not 1.09. Strike 2025: 'Inflows are highly variable, but have generally declined since 1900.'",conf="Medium",
   extra=[X("Great Salt Lake 2025: Data and Insights","Great Salt Lake Strike Team",2025,"https://d36oiwf74r1rap.cloudfront.net/wp-content/uploads/2025/01/GSL-Jan2025.pdf","Inflows are highly variable, but have generally declined since 1900.","PDF p.15 (printed p.12), River Inflow to Great Salt Lake")]),
 R("BASELINES/warming",0.82,"evidence","the stream flow would decline by 1.8 to 6.5 percent for each degree of temperature rise, with an average reduction of 3.8 percent","article body (Bardsley et al. 2013, Salt Lake City watersheds)",UCAR,"Rising temperatures challenge Salt Lake City's water supply","UCAR/NCAR",2013,
   arith="An 18% cut (0.82) equals about 4.7 F of warming at the 3.8%/F average, or 2.8 F at the 6.5%/F high end.",
   notes="An assumption with published bounds: 0.82 sits at the dry end of what the per-degree sensitivity gives for mid-century warming. Strike 2026 adds that headwater streamflow fell below average in 19 of 26 years since 2000. Note it overlaps streamflow_decline_2055; do not use both.",conf="Low",
   extra=[X(*ST,S26,"Since 2000, headwater streamflow fell below average in 19 out of 26 years.","PDF p.23 (printed p.21), Figure 10 insights")]),
]
# ---------- CONSUMERS
recs += [
 R("CONSUMERS/hay",1055,"corrected","Most agricultural irrigated lands (by area and depletion volume) in GSL Basin are in Hay/Turf crop group ... nearly all the depletions in this category are alfalfa and grass hay.","Section 2.5, Figure 2-5 (report p.2-6, PDF p.17); Table 2-3 total",AG,"Opportunities and Costs for Agricultural Water Optimization in the Great Salt Lake Basin","Utah Division of Water Resources (GSL Basin Integrated Plan)",2026,
   vn=1025,arith="Figure 2-5 bars read at about 665, 1,000, 1,015, 885 and 720 KAF for 2019-2023 (mean ~857); Table 2-3 total ag depletion mean 1,324 KAF. Share 857/1,324 = 0.647. Applied to the Strike Team's 1,584 KAF (agriculture 1,551 + incidental 33): 0.647 x 1,584 = 1,025.",
   notes="The hay/other split had no stated source. Bar values are read off a chart (about +/-15 KAF each), so treat 1,025 as +/-2%. Hay/Turf includes a few sod farms.",conf="Medium"),
 R("CONSUMERS/other_crops",529,"corrected","Agriculture - Includes all agricultural water depletions. 1,607 1,425 1,647 1,465 1,395 1,426 1,551",DEPL_L,S26,*ST,vn=559,
   arith="1,584 (agriculture 1,551 + incidental losses 33) - 1,025 hay = 559.",notes="Remainder of agricultural depletion once hay is set from the Ag Optimization report share.",conf="Medium"),
 R("CONSUMERS/minerals",152,"corrected",DEPL_Q,DEPL_L,S26,*ST,vn=136,arith="GSL mineral extraction, 2020-2024 average: 136 KAF.",
   notes="152 was an older-method figure. The current DWR water budget gives 136 for 2020-24; it fell from 186 KAF in 2020 to 77 KAF in 2024.",conf="High",
   extra=[X(*ST,S26,"Since 2020, depletions from the three mineral companies declined from 186 KAF in 2020 to 77 KAF in 2024.","PDF p.27, Figure 16 insights")]),
 R("CONSUMERS/industry",176,"corrected",RES_Q,RES_L+"; M&I 640 from PDF p.25 table",S26,*ST,vn=218.4,
   arith="Residential 2024 = 408.5 / 0.969 = 421.6 KAF. Non-residential M&I = 640 (2020-24 M&I) - 421.6 = 218.4 KAF.",
   notes="Mixes a 2024 residential figure with the 2020-24 M&I average (DWR does not publish a 2020-24 residential average in this report). Cross-check: residential is 61% of M&I in 2024, which would give 640 x 0.39 = 250.",conf="Medium"),
 R("CONSUMERS/residential_out",409,"confirmed",RES_Q,RES_L,S26,*ST,vn=408.5,arith="408.5 KAF residential lawn watering, 2024.",notes="Rounds to the model's 409.",conf="High"),
 R("CONSUMERS/residential_in",66,"corrected",RES_Q,RES_L,S26,*ST,vn=13.1,arith="421.6 x (1 - 0.969) = 13.1 KAF.",
   notes="66 appears in no source. The Strike Team says indoor depletions are small and roughly constant because indoor water returns through treatment plants.",conf="Medium"),
 R("CONSUMERS/reservoir",None,"corrected","Reservoir - Represents evaporation from reservoirs (does not include Bear or Utah Lakes). 32 9 37 18 23 20 27",DEPL_L,S26,*ST,vn=27,
   notes="New row. The old table had no reservoir line, so it reached 2,387 only by over-counting residential indoor. Reservoir evaporation is outside the scarcity charge.",conf="High"),
]
# ---------- deferred coefficients
recs_coef_override = {
 "mi_depletion": dict(value_new=354.4, low_new=320, high_new=390, arithmetic="136 minerals + (640 M&I - 421.6 residential) = 354.4 KAF/yr.", quote=DEPL_Q, locator=DEPL_L+"; residential from "+RES_L),
 "charge_base": dict(value_new=1938.4, low_new=1900, high_new=1975, arithmetic="1,584 agriculture + 354.4 = 1,938.4 = 2,387 - 27 reservoir - 421.6 residential.", quote=DEPL_Q, locator=DEPL_L),
}
# ---------- STAKEHOLDERS
SW="The weights (wBought, wLake, wFarm, wCost, base) are the model's own judgement; no poll measures them. Only the facts in the basis line are checked."
recs += [
 R("STAKEHOLDERS/farmers","weights","evidence","The board is directed to favor senior adjudicated rights and generally limits leased water to no more than two full irrigation seasons in any five-year period on the same field","p.2-3, HB 410 summary",FB26,"2026 Final Legislative Update","Utah Farm Bureau Federation",2026,
   notes=SW+" The Farm Bureau backs voluntary leasing with field limits, consistent with weighting bought water and farm income. Corrected citation: the homepage is replaced by the April 8, 2026 update.",conf="Low"),
 R("STAKEHOLDERS/rural","weights","evidence","Rural (88%) and suburban residents (89%) were more likely to be somewhat or very concerned about the issue than urban residents (81%).","article body",DES,"Poll: Utahns are more worried than ever about water","Deseret News and Hinckley Institute of Politics",2026,
   notes=SW+" The 88% is from Deseret/Hinckley, not Noble: citation should include deseret_2026.",conf="Low"),
 R("STAKEHOLDERS/metro","weights","evidence","Those who were moderately sure their financial contributions would make a difference were willing to pay between $113 and $144 per household each year.","article body",TRIB,"Most Utahns are willing to open their wallets to save the Great Salt Lake","Salt Lake Tribune",2026,
   notes=SW+" $113-144 applies to respondents moderately sure their money would make a difference, not all households. 'Hard no on penalties': Deseret/Hinckley March 2026, 22% favoured restrictions with penalties.",conf="Low"),
 R("STAKEHOLDERS/commerce","weights","no_evidence","","",BEA,"GDP by State","US Bureau of Economic Analysis",2026,
   notes=SW+" No published statement of the Office of Commerce's priorities was found; BEA GDP gives the industrial context only.",conf="Low"),
 R("STAKEHOLDERS/rep","weights","evidence","Democrats (78%) were significantly more likely to be very concerned about the lake's water levels than Republicans (36%).","article body",DES,"Poll: Utahns are more worried than ever about water","Deseret News and Hinckley Institute of Politics",2026,
   notes=SW+" 36% confirmed. The 81% federal-package support is Noble's figure for all voters, not Republicans specifically; a party breakdown was not opened.",conf="Low",
   extra=[X("Utah Voters Put Water Ahead of Data-Center Growth","Noble Predictive Insights",2026,NOBLE,"81% support Congress approving the proposed $1 billion federal funding package to restore and protect the lake.","press release body")]),
 R("STAKEHOLDERS/dem","weights","evidence","Democrats (78%) were significantly more likely to be very concerned about the lake's water levels than Republicans (36%).","article body",DES,"Poll: Utahns are more worried than ever about water","Deseret News and Hinckley Institute of Politics",2026,notes=SW+" 78% confirmed.",conf="Low"),
]
# ---------- VALUE_PER_AF
GDPN="BEA SAGDP2 (GDP in current dollars), Utah, 2025, downloaded from apps.bea.gov/regional/zip/SAGDP.zip"
SPLIT="DWR 2019 Figure 4-1 statewide M&I use by type (2015): commercial 14%, institutional 13%, industrial 3% (30% non-residential). Applied to 218.4 KAF non-residential M&I depletion: commercial 101.9, institutional 94.6, industrial 21.8 KAF."
DWRF=X("Utah's Regional M&I Water Conservation Goals","Utah Division of Water Resources",2019,DWRG,"Commercial 34 gpcd (14%) ... Institutional 32 gpcd (13%) ... Industrial 6 gpcd (3%)","Figure 4-1, p.15")
recs += [
 R("VALUE_PER_AF/hay",245,"corrected","2019 ... 510 4.30 2,193 182.00 399,126 ... 2023 ... 490 4.00 1,960 222.00 435,120","All Hay and Alfalfa Hay tables, Area Harvested, Yield, Production, Price & Value, p.15",NASSB,"Utah Annual Bulletin, 2024","USDA National Agricultural Statistics Service",2024,
   vn=345,lo=325,hi=415,arith="All hay 2019-2023: value $2,699.8M over 3,430k harvested acres = $787/acre. Depletion per acre 2.15-2.41 AF (Ag Optimization report hay/turf ~857 KAF over 355,000 alfalfa acres plus grass hay). $787 / 2.41 = $326; $787 / 2.15 = $366. Alfalfa alone ($895/acre) gives up to $415.",
   notes="245 matches 2016-17 prices. Gross value of output, not net to the farm (the net figure is irrigation_net_value, $236).",conf="Medium"),
 R("VALUE_PER_AF/all_ag",1021,"unsupported","All Commodities ... 1,756,881 1,787,409 1,994,804 2,719,151","Farm Income: Cash Receipts by Commodity, Utah 2017-2022, p.9",NASSB,"Utah Annual Bulletin, 2024","USDA National Agricultural Statistics Service",2024,
   arith="2019-2022 statewide receipts average $2,064.6M / 1,584 KAF basin ag depletion = $1,303/AF; 2017-18 receipts give about $1,100.",
   notes="Not reproduced. The ratio divides statewide receipts by basin-only depletion, which overstates it; statewide agricultural depletion was not opened. Left unchanged and flagged.",conf="Low"),
 R("VALUE_PER_AF/minerals",8140,"corrected","Industrial Sector (Mineral) 685.2 217.7 227.9 1,130.8","'Estimated Total Economic Impact' slide, Total Economic Output (millions of 2010 $)",LE22,"Great Salt Lake economic contribution (Bioeconomics 2012) - Natural Resources Interim Committee presentation","Utah Legislature",2022,
   vn=8315,arith="$1,130.8M total output (2010 $) / 136 KAF (2020-24 mineral depletion) = $8,315/AF. With 2024's 77 KAF it would be $14,700.",notes="Was BEA-cited; BEA has no lake-specific mineral line. Output includes indirect and induced effects; direct output alone is $685.2M ($5,040/AF).",conf="Medium"),
 R("VALUE_PER_AF/nuclear_wet",27000,"confirmed","Nuclear Tower Generic 672 581 845","Table 2, water consumption factors for non-renewable technologies (gal/MWh)",MACK,"Operational water consumption and withdrawal factors for electricity generating technologies","Environmental Research Letters",2012,
   arith="672 gal/MWh / 325,851 gal/AF = 0.00206 AF/MWh. $27,000/AF x 0.00206 = $55.7/MWh implied generation value.",notes="Water factor confirmed; the implied ~$56/MWh price is an assumption (no price source in the model).",conf="Medium"),
 R("VALUE_PER_AF/nuclear_dry",8400000,"unsupported","Dry Combined cycle 2 0 4","Table 2 (natural gas combined-cycle, dry cooling)",MACK,"Operational water consumption and withdrawal factors for electricity generating technologies","Environmental Research Letters",2012,
   arith="$8.4M/AF at ~$52/MWh implies ~2 gal/MWh, the combined-cycle dry-cooling factor.",notes="Macknick has no nuclear dry-cooling factor (no US nuclear plant is dry-cooled); the value borrows the gas figure. Treat as illustrative.",conf="Low"),
 R("VALUE_PER_AF/dc_evap",46000,"unsupported","","",BEA,"GDP by State","US Bureau of Economic Analysis",2026,notes="BEA publishes no per-facility output or water use. No published per-100 MW evaporative data-centre water figure was opened.",conf="Low"),
 R("VALUE_PER_AF/dc_closed",417000,"unsupported","","",BEA,"GDP by State","US Bureau of Economic Analysis",2026,notes="As dc_evap.",conf="Low"),
 R("VALUE_PER_AF/meta",758000,"unsupported","","",BEA,"GDP by State","US Bureau of Economic Analysis",2026,notes="Meta states only that annual water use will be below a typical regional golf course; no acre-foot volume or output figure is published. Searched Meta, Eagle Mountain and news coverage.",conf="Low"),
 R("VALUE_PER_AF/tooele",1200000,"unsupported","","",BEA,"GDP by State","US Bureau of Economic Analysis",2026,notes="No announced output or water volume opened for the Tooele fuel-cycle campus (DOE MOU stage).",conf="Low"),
 R("VALUE_PER_AF/qts",3500000,"unsupported","","",BEA,"GDP by State","US Bureau of Economic Analysis",2026,notes="QTS describes closed-loop cooling with a one-time fill; no annual volume is published.",conf="Low"),
 R("VALUE_PER_AF/institutional",354000,"confirmed","Government and government enterprises ... 33,076.6",GDPN+", line 83",BEA,"GDP by State (SAGDP2, Utah)","US Bureau of Economic Analysis",2026,
   arith=SPLIT+" $33,076.6M / 94.6 KAF = $350k/AF.",notes="Reproduced within 1%. Statewide GDP over basin depletion (basin holds ~86% of residents); use shares stand in for depletion shares.",conf="Medium",extra=[DWRF]),
 R("VALUE_PER_AF/manufacturing",1300000,"confirmed","Manufacturing ... 29,650.4",GDPN+", line 12",BEA,"GDP by State (SAGDP2, Utah)","US Bureau of Economic Analysis",2026,
   arith=SPLIT+" $29,650.4M / 21.8 KAF = $1.36M/AF.",notes="Reproduced within 5%. Same caveats as institutional.",conf="Medium",extra=[DWRF]),
 R("VALUE_PER_AF/commercial",2400000,"confirmed","Private services-providing industries ... 224,941.2",GDPN+", line 92",BEA,"GDP by State (SAGDP2, Utah)","US Bureau of Economic Analysis",2026,
   arith=SPLIT+" $224,941.2M / 101.9 KAF = $2.21M/AF.",notes="Reproduced within 10% (2.2M vs 2.4M); same caveats.",conf="Medium",extra=[DWRF]),
]
# ---------- WATERING_MONTHS
WQ="Turfgrass ... Net Irr 0.71 2.40 4.31 5.12 4.52 2.40 0.73"
WL="Estimated Consumptive Use for NWS Station: SALT LAKE CITY INTL AP, 1971-2008, Turfgrass Net Irr (Apr-Oct), PDF p.254"
WT=("Crop and Wetland Consumptive Use and Open Water Surface Evaporation for Utah, Appendix I (NWS stations)","Utah State University for the Utah Division of Water Resources (Hill, Barker and Lewis)",2011)
net={'Apr':0.71,'May':2.40,'Jun':4.31,'Jul':5.12,'Aug':4.52,'Sep':2.40,'Oct':0.73}; tot=sum(net.values())
model={'Jan':0,'Feb':0,'Mar':0,'Apr':0.03,'May':0.12,'Jun':0.21,'Jul':0.25,'Aug':0.23,'Sep':0.13,'Oct':0.03,'Nov':0,'Dec':0}
for m,v in model.items():
    sh=net.get(m,0)/tot
    recs.append(R(f"WATERING_MONTHS/{m}",v,"confirmed",WQ,WL,USUI,*WT,arith=f"{net.get(m,0)} in / {tot:.2f} in = {sh:.3f}",
      notes="Within 0.01 of the turf net-irrigation share. Corrected citation: dwr_regional_goals holds no monthly breakdown.",conf="High"))
# ---------- AREA_ANCHORS
EQ="elev_ft_NAVD88,elev_ft_NGVD29,...,area_mi2"
ET=("Half-meter topobathymetric elevation model and elevation-area-volume tables for Great Salt Lake, Utah, 2002-2016 (Root, 2023)","US Geological Survey data release, doi:10.5066/P9DGG75W",2023)
recs += [
 R("AREA_ANCHORS/4188.5",888,"confirmed","4188.5 (NGVD29) -> 894 sq mi","Great_Salt_Lake_2023_ElevAreaVolume_total.csv, row elev_ft_NGVD29 = 4188.50",EAV,*ET,vn=894,notes="Within 1%.",conf="High"),
 R("AREA_ANCHORS/4200",1700,"corrected","4200.00 (NGVD29) -> 1,602.3 sq mi","same table, row 4200.00",EAV,*ET,vn=1602.3,
   notes="6% high. With only three anchors the straight line overstates area by 9-15% between 4,195 and 4,199 ft (e.g. 1,594 vs 1,463 sq mi at 4,198.5). Replace the three anchors with the USGS table at one-foot steps.",conf="High"),
 R("AREA_ANCHORS/4211.6",2300,"corrected","4211.52 (NGVD29) -> 2,229.1 sq mi (table maximum, 4,215.00 NAVD88)","same table, last row",EAV,*ET,vn=2229.1,notes="3% high; the table ends at 4,211.5 ft NGVD29.",conf="High"),
 R("USU_VALIDATION/250",4193.8,"corrected","An additional 250 KAF/year results in a long-term mean lake level of 4,193.7 feet","PDF p.32 (printed p.30), Figure 20 insights",S26,*ST,vn=4193.7,notes="0 -> 4,191.1 and 800 -> 4,198.0 confirmed in the same passage.",conf="High"),
]
# ---------- LEGAL
recs += [
 R("LEGAL/hb410_field_rotation","Not applied to lease-to-own","confirmed","(b) if for a full irrigation season, no more than two years out of a five-year period on the same agricultural field.","Utah Code 73-34-302(1)(b), enrolled H.B. 410 lines 421-422",HB410E,"H.B. 410 Water Leasing Amendments (enrolled)","Utah Legislature",2026,
   notes="Applies to leases by the new board; it does not cover purchased rights, as the model assumes.",extra=[X("Frequently Asked Questions","Office of the Great Salt Lake Commissioner",2026,FAQ,"Full-season leasing will be limited to no more than two of every five years.","Water Rights & Leasing")]),
 R("LEGAL/water_right_severance","Change application required","confirmed","In Utah, water rights can be owned and transferred separately from the land upon which they are used.","'What are the methods of water right conveyance?'",TITLE,"Water Right Title Information","Utah Division of Water Rights",2026,
   extra=[X("Water Right Title Information","Utah Division of Water Rights",2026,TITLE,"a change application will need to be filed with and approved by the State Engineer to authorize such alterations.","same page")]),
 R("LEGAL/basin_curtailment_authority","Not current law","evidence","All Great Salt Lake water rights curtailed","Priority schedule table (curtailment of in-lake rights by lake elevation)",DMP,"Great Salt Lake Distribution Management Plan","Utah Division of Water Rights (State Engineer)",2025,
   notes="The plan curtails only rights that divert from the lake itself, by priority and lake level; it has no basin-wide authority over upstream diverters. Supports 'not current law'.",conf="Medium"),
 R("LEGAL/consumed_water_charge","Not current law","no_evidence","","",DMP,"Great Salt Lake Distribution Management Plan","Utah Division of Water Rights (State Engineer)",2025,notes="No Utah statute charging consumed water was found; absence cannot be quoted. Searched Utah Code Title 73 references in the opened sources.",conf="Medium"),
 R("LEGAL/saved_water_shepherding","Not current law","evidence","Water conservation could benefit the Great Salt Lake if the water is carefully measured and tracked through rivers, canals, and other water pathways within the basin—a practice that will require adequate measurement and real-time information sharing.","Takeaway",ILWA,"2A: Water shepherding: delivering saved water to Great Salt Lake","Utah State University, Janet Quinney Lawson Institute for Land, Water and Air",2023,
   notes="Supports shepherding being a capacity still to build. Corrected citation: state_engineer_dmp homepage does not say this.",conf="Medium"),
 R("LEGAL/state_held_water_insulated","Not current law","no_evidence","","",PLAN,"The Great Salt Lake Strategic Plan","Office of the Great Salt Lake Commissioner",2024,notes="No statute insulating state-held lake water from later M&I re-diversion was found in the opened sources.",conf="Low"),
 R("LEGAL/compulsory_acquisition","Not current law","no_evidence","","",FB26,"2026 Final Legislative Update","Utah Farm Bureau Federation",2026,notes="No condemnation power for water rights for the lake was found; the 2026 session bills are voluntary.",conf="Medium"),
 R("LEGAL/residential_penalties","Not current law","no_evidence","","",DWRG,"Utah's Regional M&I Water Conservation Goals","Utah Division of Water Resources",2019,notes="Watering limits are local ordinances; no statewide civil-penalty statute was found.",conf="Low"),
 R("LEGAL/elevation_triggered_sunsets","Not current law","no_evidence","","",PLAN,"The Great Salt Lake Strategic Plan","Office of the Great Salt Lake Commissioner",2024,notes="The only elevation-triggered mechanism found is the State Engineer's curtailment of in-lake rights (DMP), not a charge.",conf="Low"),
]
# ---------- SOURCES
src_fixes = {
 "usu_sims": ("corrected", "Long-term mean levels are in Strike 2026 p.30 (Figure 20, Tarboton 2025), not the 2025 report.", S26),
 "usgs_fogsl_area": ("corrected", "URL was the USGS centre homepage; the area table is the 2023 USGS data release (Root).", EAV),
 "state_engineer_dmp": ("corrected", "URL was the Water Rights homepage; point to the GSL Distribution Management Plan PDF.", DMP),
 "gsl_commissioner": ("corrected", "Title says Strategic Plan but URL was the homepage; point to the January 2024 plan PDF.", PLAN),
 "farm_bureau_2026": ("corrected", "URL was the homepage; point to the April 8, 2026 final legislative update PDF.", FB26),
 "deseret_2026": ("corrected", "Page title is 'Poll: Utahns are more worried than ever about water'.", DES),
 "weber_wtp": ("corrected", "Page title is 'Most Utahns are willing to open their wallets to save the Great Salt Lake'.", TRIB),
 "scpp_aspen": ("unsupported", "Rate-limited (HTTP 429); KJZZ reprint opened instead in batch b3.", None),
 "irrigation_elasticity_meta": ("unsupported", "Publisher blocks bots (HTTP 403); abstract read via EarthRef in batch b2.", None),
 "finley_2020": ("unsupported", "Publisher blocks bots (HTTP 403).", None),
}
for line in open(sys.argv[1]):
    sid,title,pub,year,url=line.rstrip('\n').split('\t')
    v,n,u=src_fixes.get(sid,("confirmed","URL opened 2026-10-23 (HTTP 200); title and publisher match.",None))
    recs.append(R(f"SOURCES/{sid}",title,v,"" ,"page opened",u or url,title,pub,int(year),notes=n,conf="High"))
json.dump(recs, open(sys.argv[2],'w'), indent=1, ensure_ascii=False)
json.dump(recs_coef_override, open(sys.argv[3],'w'), indent=1)
print(len(recs))
