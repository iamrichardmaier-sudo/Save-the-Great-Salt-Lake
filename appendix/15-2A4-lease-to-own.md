# 2A.4 Our assumptions regarding lease-to-own agreements

Leasing water from willing sellers is the backbone of our proposal: by 2055 it, together with repossessed rights, carries 694 KAF a year to the lake. We assume the lease market behaves like any market in a scarce asset. The more the state buys, the less willing the remaining holders are to sell, so the price rises; and there is a limit to how much anyone will sell at any price. In our run that limit, not money, decides how much water the state holds.

## The lease supply curve

**The economics.** Each irrigator has a reservation price: the lowest payment at which leasing the water beats farming with it. Farmers with poor ground, high costs or plans to retire have low reservation prices and lease first. As the state leases more, it has to reach farmers who value their water more highly, so the price it must pay rises. That is an upward-sloping supply curve. The elasticity of supply says how steeply: an elasticity of 1 means a 1% rise in the price brings forth 1% more water. Beyond some volume, no plausible price brings more water forward, and the curve turns vertical.

**What we assume.** The lease rate starts from a base of $250 an acre-foot a year and rises with the volume the state already holds, with a supply elasticity of 1. The rate cannot fall below 0.3 times the base or rise above 6 times it. Willing sellers will lease up to 130 KAF a year and sell up to 150 KAF outright.

```latex
\text{lease rate} = \$250 \times \left(1 + \frac{\text{held}}{q_{\text{ref}}}\right)^{1/\varepsilon}, \qquad \varepsilon = 1,\quad 0.3 \le \frac{\text{rate}}{\$250} \le 6
```

![The lease supply curve as the model draws it: the annual lease rate against rights already held, before any scarcity charge.](blob/c9e59785-8847)

**Who it falls on.** The cost falls on the state, which pays a rising price for each additional acre-foot. Farmers who lease are better off than they were, by construction: they lease only if the payment beats their own use of the water.

### The base rate

The state's agricultural optimisation report found that "ceasing alfalfa irrigation early and full-season leasing were the top-performing leasing options, with an average cost of $236 per AF" ([Utah Division of Water Resources, 2026a](https://water.utah.gov/wp-content/uploads/2026/05/GSL-BIP_AgWaterOptimizationReport_FINAL_2026-04-21.pdf)). A policy brief for the Strike Team put the cost per acre-foot of water banking at between $150 and $300 ([Kem C. Gardner Policy Institute, 2023](https://gardner.utah.edu/wp-content/uploads/GSL-Options-Banking.pdf?x71849)). Our $250 sits in that range. **Verdict:** corrected from $380, which matched Colorado River programmes rather than this basin.

### The elasticity

**The analogue.** The only observed price and quantity pair comes from the Upper Colorado River's conservation pilot. In 2023 it paid about $16M for 38,000 acre-feet, about $421 an acre-foot; in 2024 it paid nearly $29M for about 64,000 acre-feet, about $453 ([Aspen Journalism, 2025](https://kjzz.org/content/1881386/using-less-colorado-river-takes-willing-farmer-and-45-million-federal-funds)). Taken at face value, a 68% rise in quantity for a 7% rise in price implies an elasticity of about 3 to 7. But the programme was redesigned between the two years, with a fixed take-it-or-leave-it price and better outreach, so the pair does not isolate the supply curve. We rate it 3. Our elasticity of 1 is deliberately steeper than that: it assumes the state, as the only large buyer, will drive up the price as it buys. Because the price moves but the willing-seller caps decide the quantity, the result is not sensitive to it; it moves the 2055 lake by 0.13 ft. **Verdict:** evidence.

### The floor and ceiling

The floor of 0.3 times the base, $75 an acre-foot, stops the scarcity charge from driving the price to nothing. Evidence suggests farmers do not respond below about $150: an early offer of $150 an acre-foot in the Upper Colorado was called "insulting", and Colorado, Utah and Wyoming later paid about $500 ([Aspen Journalism, 2025](https://kjzz.org/content/1881386/using-less-colorado-river-takes-willing-farmer-and-45-million-federal-funds)). That points to a floor nearer 0.4 or 0.6. We keep 0.3 because the charge lowers what water is worth to the farmer. The ceiling of 6 times the base is permissive: the highest observed agricultural lease payment, $650 an acre-foot, is 2.6 times our base ([Salt Lake Tribune, 2023b](https://www.sltrib.com/news/environment/2023/11/30/test-program-price-river-promises/)). It rarely binds. **Verdict:** evidence for both.

## How much willing sellers will offer

**Leases.** We assume 130 KAF a year. **The analogues.** The lake's own Watershed Enhancement Trust transacted "nearly 72,500 acre-feet of water" in 2025, up from about 64,000 in 2023 and 69,190 in 2024, against an objective of 100,000 acre-feet a year ([Great Salt Lake Watershed Enhancement Trust, 2026](https://media.audubon.org/2026-04/GSLWET_Impact_Report_2025.pdf)). We rate it 5: the same lake, basin and mechanism. In the Upper Colorado, four states at full federal funding enrolled about 64,000 acre-feet in 2024, 2% to 3% of eligible irrigation water ([Smith, 2024](https://insideclimatenews.org/news/02062024/colorado-river-upper-basin-conservation-program/)); we rate it 4. The state's own leasing scenario of 10%, 132 KAF basin-wide, is described as "herculean". Our 130 KAF is that ceiling: nearly twice what the Trust achieves today. **Verdict:** corrected from 200 KAF.

**Outright sales.** We assume 150 KAF a year. The Trust's permanent transactions run at roughly 13 to 21 KAF a year ([Great Salt Lake Watershed Enhancement Trust, 2026](https://media.audubon.org/2026-04/GSLWET_Impact_Report_2025.pdf)); we rate this 4, as the categories in the published chart could not be matched to the numbers with certainty. Australia's Murray–Darling Basin, the only long-running basin-scale programme of voluntary permanent purchases for the environment, recovered 2,075 GL a year of entitlement, about 1,683 KAF, over roughly 15 years ([Parliament of Australia, 2025](https://www.aph.gov.au/About_Parliament/Parliamentary_departments/Parliamentary_Library/Research/Policy_Briefs/2025-26/WaterrecoveryintheMurray-Darling)): about 110 KAF a year in a basin ten times larger. We rate it 3: the mechanism matches, but Australia has unbundled, tradable water entitlements and a mature market. Our 150 KAF is about seven times the Trust's realised pace, a deliberate stretch for a funded state programme. **Verdict:** range revised to 20 to 600 KAF.

**What happens in our run.** The state holds 280 KAF of rights, 130 leased and 150 bought, from the first year to the last: the willing-seller limit binds throughout. As the lake recovers and the charge falls, the lease rate rises from $75 to $135 an acre-foot. Leasing costs $21M a year, $30.25 for every acre-foot shepherded to the lake in 2055, and $289.1M over 2027–2055.

## The price of a right

**What we assume.** Buying a right outright costs $6,000 an acre-foot. **Basis.** Utah figures disagree widely. Cedar City paid just over $12,100 an acre-foot for 942.75 acre-feet of mostly 1860-priority water in 2023 ([Western Water, 2023](https://www.western-water.com/2023/10/03/utah-city-buys-historic-water-rights-for-sustainability/)). The state's $30M purchase of the US Magnesium facility and its water rights works out at about $207 an acre-foot, but that was a bankruptcy sale of mineral brine rights and a plant ([KJZZ-TV, 2026](https://kjzz.com/news/local/utah-wins-30m-bid-to-secure-us-magnesium-facility-water-rights-for-great-salt-lake)). Capitalising a $250 lease at 3% to 4% gives $6,250 to $8,300 an acre-foot. Our $6,000 is a capitalised lease price, at the low end of that band. **Verdict:** range revised to $3,000 to $12,100; the low Utah figures are unresolved.

## How long until the state owns the right

A lease-to-own agreement credits part of each payment toward buying the right, so that over time the state stops renting and owns. The policy question is how fast. At our setting of $2M a year set aside for ownership, the model reports that paying off the rights would take 43.1 years, beyond 2055, so the state owns no right outright within the horizon. The $2M is a setting with no source behind it (Section 3). The goal search left it low because ownership does not change how much water reaches the lake before 2055: a leased acre-foot and an owned one are shepherded alike. A legislature that wants permanent protection after 2055 would raise this line, and shorten the payoff, at the cost of money for monitoring or programmes now.

**HB 410.** Utah's 2026 water leasing law limits full-season leasing off a field to no more than two years in every five ([Office of the Great Salt Lake Commissioner, 2026](https://greatsaltlake.utah.gov/faq/)). We read that rule as applying to temporary leases, not to the acquisition of rights, so we apply no two-in-five multiplier to lease-to-own rights. If the rule did apply, holding a constant volume would need 2.5 times the enrolled acres. This legal reading should be checked against the enrolled bill.
