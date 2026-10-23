# 1.5 The models

Our results come from eight linked models. A lake model turns water into a lake level; an inflow model adds the weather; a lever model decides how much water each instrument frees; a delivery model decides how much of it arrives; and economic, jobs and support models score the outcome. A goal search then tunes the levers. Below each model, its assumptions are listed in a line each and linked to the Section 2 tab that explains them; the sub-heading named in italics is the entry in that tab.

## 1. The lake model

**What it does.** It turns a year's inflow into a lake level. **How it works.** The lake has no outlet, so in the long run it settles where the water evaporating off its surface equals the water arriving. The model reads the lake's area at each level from the USGS elevation-area table and multiplies it by net evaporation, gross evaporation less the rain and snow falling on the lake. It finds the level whose evaporation matches the inflow, scaled by a closure factor fitted to the state's published simulations. Each year the lake moves a fixed share of the way from where it is toward that level.

```latex
\text{area}(E^*) \times (e_{\text{gross}} - p_{\text{lake}}) = \text{inflow} \times 0.933, \qquad E_{t+1} = E_t + 0.17\,(E^* - E_t)
```

**What it produces.** The lake level each year, and the equilibrium level for any inflow: 4,190.93 ft with no added water and 4,198.04 ft with 800 KAF a year added. **Why it is built this way.** A one-equation balance is transparent, and once fitted it reproduces the state's long-run simulated levels of 4,191.1, 4,193.7 and 4,198.0 ft to within 0.23 ft.

- We assume the lake loses 3.77 ft of water a year to evaporation. → tab 2B.1 · *Gross evaporation*
- We assume 1.25 ft of rain and snow falls on the lake each year. → tab 2B.1 · *Precipitation on the lake*
- We assume a closure factor of 0.933 between gauged inflow and the open lake. → tab 2B.1 · *The closure factor*
- We assume the lake's area at each level follows the USGS 2023 elevation-area table. → tab 2B.1 · *The area curve*
- We assume the lake closes 17% of the gap to its equilibrium each year. → tab 2B.2 · *How fast the lake responds*
- We assume the lake starts at 4,189.7 ft. → tab 2B.2 · *Where the lake starts*
- We assume a healthy range of 4,198 to 4,205 ft and a serious-harm level of 4,190 ft. → tab 2B.2 · *The targets*

## 2. The inflow model

**What it does.** It supplies the river inflow for each year. **How it works.** The central run uses the 2000–2025 average of 1,665 KAF a year. For uncertainty, the model draws 120 inflow sequences with the observed year-to-year spread and the tendency of dry years to follow dry years. Climate and growth then take water away gradually: by 2055 a warming climate removes 100 KAF a year from the rivers and population growth draws 92 KAF a year. Alternative baselines (the driest recent decade, the full gauged record, a warming trend) and a long-drought option stress the result. **What it produces.** The 10th, 50th and 90th percentile lake path, and the share of sequences that end healthy. **Why it is built this way.** Weather moves the lake more than any lever, so a single path would hide most of the risk.

- We assume today's inflow averages 1,665 KAF a year. → tab 2B.2 · *River inflow now*
- We assume the lake needs 800 KAF a year of added inflow. → tab 2B.2 · *The goal*
- We assume year-to-year inflow varies with a coefficient of variation of 0.5. → tab 2B.11 · *Year-to-year spread*
- We assume a dry year makes the next one dry with a correlation of 0.35. → tab 2B.11 · *Drought persistence*
- We assume a long drought cuts inflow to 0.75 of normal. → tab 2B.11 · *Long droughts*
- We assume 120 simulated sequences are enough. → tab 2B.11 · *Number of simulations*
- We assume a warming climate takes 100 KAF a year from the rivers by 2055. → tab 2B.4 · *Streamflow decline*
- We assume growth draws 92 KAF a year by 2055. → tab 2B.4 · *Growth in demand*

## 3. The lever model

**What it does.** It works out how much water each instrument frees each year. **How it works.** Each instrument has its own rule. The scarcity charge cuts use in proportion to the charge as a share of the water's net value, up to a cap. The crop levy falls on application above a threshold, and the model treats application as spread across fields, so it catches the heaviest irrigators first. Each programme turns money into water at a cost per acre-foot until it reaches a cap. Leases follow a rising supply curve, and the mandate orders whatever is still missing, up to its floor. **What it produces.** Water freed by each lever, prices, revenue and spending. **Why it is built this way.** Each rule is the simplest form that captures the instrument's limit: a price response, a technical cap, or a willing-seller ceiling.

- We assume a 1,200 KAF mandate floor, phased in over one year, with no penalty. → tab 2A.1 · *The mandate floor*
- We assume repossession of up to 140 KAF a year, paid at 3% interest. → tab 2A.1 · *Repossession*
- We assume farms cut use by 0.4 times the charge as a share of the water's net value, up to 60% of use. → tab 2A.2 · *How farms respond*
- We assume cities and industry respond with a price elasticity of 0.3, up to 40% of use. → tab 2A.2 · *How cities and industry respond*
- We assume the charge closes a quarter of the gap to its target each year and escalates by a step of 0.12 a year while the lake is short. → tab 2A.2 · *The thermostat and escalator*
- We assume each programme's cost per acre-foot, delivery share and cap. → tab 2A.3 · *Cloud seeding*, *Phragmites removal*, *Crop switching*, *On-farm efficiency*
- We assume willing sellers lease 130 KAF a year and sell 150 KAF, at a lease price rising with an elasticity of 1. → tab 2A.4 · *The lease supply curve*
- We assume a water right costs $6,000 an acre-foot to buy outright. → tab 2A.4 · *The price of a right*
- We assume the levy falls on 228,000 acres of hay ground applying 2.4 AF an acre on average. → tab 2A.5 · *The hay ground in scope*
- We assume the levy can cut at most half of an acre's application. → tab 2A.5 · *How irrigators respond*
- We assume $100M a year, of which $50M goes to monitoring. → tab 2A.6 · *The budget*
- We assume 743,000 basin homes have a lawn using 371 KAF a year. → tab 2A.7 · *Lawns and their water*

## 4. The delivery model

**What it does.** It decides how much freed water reaches the lake. **How it works.** Water the state holds as a right is shepherded down the rivers, up to a capacity that starts at 150 KAF a year and grows by 25 KAF a year, plus what monitoring adds. Of shepherded water, 85% arrives, rising to 89.8% with monitoring. Ordered water arrives at only 71% of that rate, because it is harder to track. **What it produces.** Gross and net water to the lake. **Why it is built this way.** Freeing water upstream does not put it in the lake: downstream users can divert it unless it is measured and legally protected.

- We assume 85% of dedicated water survives the trip, before monitoring. → tab 2B.3 · *The delivery share*
- We assume shepherding capacity starts at 150 KAF and grows 25 KAF a year. → tab 2B.3 · *Shepherding capacity*
- We assume monitoring adds up to 10 points of delivery share and 50 KAF of capacity. → tab 2B.3 · *What monitoring buys*
- We assume ordered water arrives at 71% of the rate of bought water. → tab 2A.1 · *Delivering ordered water*

## 5. The water-use model

**What it does.** It describes who consumes the basin's water. **How it works.** It splits 2,387 KAF of depletion into hay, other crops, minerals, industry, lawns, indoor use and reservoirs, and defines the 1,938.4 KAF the charge falls on. **What it produces.** The base each lever works on, and the sector figures in tab 1.1. **Why it is built this way.** Depletion, not diversion, is what the lake loses.

- We assume basin depletion of 2,387 KAF a year, 1,025 KAF of it hay. → tab 2B.6 · *Depletion by user*
- We assume alfalfa needs 2.41 ft of irrigation water an acre. → tab 2B.5 · *Water per acre*
- We assume announced industrial projects need 19.078 KAF a year. → tab 2B.10 · *The industrial pipeline*

## 6. The economic model

**What it does.** It sets the cost against the benefit. **How it works.** The benefit is net water to the lake times $2,440 an acre-foot. The cost is the public budget plus farm revenue lost without compensation plus livestock receipts at risk. Net economic value sums the lake value, less farm and livestock losses, plus transition wages, over 2027–2055. **What it produces.** Yearly cost and benefit, cost per acre-foot delivered, and the $55.0B net economic value. **Why it is built this way.** A budget-only cost would hide what farmers and ranchers give up.

- We assume an acre-foot in the lake is worth $2,440 and one in hay $368. → tab 2B.7 · *The value of lake water*, *The value of hay water*
- We assume hay earns a net $305 an acre and irrigation water is worth $236 an acre-foot to a farm. → tab 2B.7 · *Farm net values*
- We assume the basin grows 596,000 tons of forage a year more than its own herds eat. → tab 2B.5 · *Where the hay goes*
- We assume households would pay $128 a year. → tab 2B.9 · *Willingness to pay*

## 7. The jobs model

**What it does.** It counts jobs lost and gained. **How it works.** Field jobs fall at 19.2 per 1,000 acres taken out of irrigation; dairy and beef jobs fall as local feed is cut; transition jobs rise at 7.4 per $1M spent; lake-economy jobs rise toward 7,706 as the lake recovers. **What it produces.** Jobs by type in each year. **Why it is built this way.** The losses and gains are in different places and must be shown separately.

- We assume 19.2 field jobs per 1,000 irrigated acres. → tab 2B.8 · *Farm jobs*
- We assume up to 1,900 dairy and beef jobs are at risk. → tab 2B.8 · *Livestock jobs*
- We assume 7.4 transition jobs per $1M spent. → tab 2B.8 · *Transition jobs*
- We assume 7,706 lake-economy jobs at a healthy lake. → tab 2B.8 · *Lake-economy jobs*

## 8. The support model and the goal search

**What it does.** The support model scores how six groups would view the package, and the goal search finds the package that reaches the goal. **How it works.** Each group weighs bought water, the lake, farm income and cost, with weights set from polling. The goal search tries many packages on $100M a year and keeps those that reach 4,198.5 ft by 2055, preferring higher net economic value. **What it produces.** Support scores between 78.1 and 100, averaging 86, and the package in tab 1.1. **Why it is built this way.** A package that reaches the goal but cannot pass the legislature is no package.

- We assume 58% of voters prefer incentives and 22% penalties. → tab 2B.9 · *Polling*
- We assume each group's weights on bought water, the lake, farm income and cost. → tab 2B.9 · *Support scores*
