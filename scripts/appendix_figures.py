"""Draw the appendix figures from research/appendix-data.json into appendix/figures/ (PNG and SVG).

Run: python3 scripts/appendix_figures.py
Every number plotted is read from the export; nothing is typed in by hand.
"""
import json
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter

D = json.load(open("research/appendix-data.json"))
OUT = "appendix/figures/"
GREY, DARK, ACCENT, LIGHT = "#9aa0a6", "#3c4043", "#1a73e8", "#dadce0"
GOOD, BAD = "#5f9e6e", "#c5675a"
RUN = f"Run: goal-search package (research/optimised-dials.json), corrected model, {D['uncertainty']['runs']} inflow sequences"

plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 10, "axes.spines.top": False, "axes.spines.right": False,
                     "axes.edgecolor": GREY, "axes.labelcolor": DARK, "xtick.color": DARK, "ytick.color": DARK, "figure.dpi": 150, "text.parse_math": False})

def save(fig, name):
    fig.tight_layout(rect=(0, 0, 1, 0.985 if "\n" not in (fig._suptitle.get_text() if fig._suptitle else "") else 0.955))
    fig.savefig(OUT + name + ".png", dpi=170)
    fig.savefig(OUT + name + ".svg")
    plt.close(fig)

import textwrap

def title(ax, t, sub=None):
    fig = ax.figure
    t = textwrap.fill(t, 78)
    fig.suptitle(t, x=0.02, ha="left", fontsize=11.5, fontweight="bold", color=DARK)
    if sub:
        ax.set_title(textwrap.fill(sub, 95), loc="left", fontsize=9, color=GREY, pad=6)

S = D["scenario"]; U = D["uncertainty"]
years = [r["year"] for r in D["path"]]

# 1. Lake path with the inflow band, the do-nothing path and the target
fig, ax = plt.subplots(figsize=(8, 4.6))
ax.fill_between(U["years"], U["p10"], U["p90"], color=ACCENT, alpha=0.13, lw=0, label="10th to 90th percentile of inflow sequences")
ax.plot(U["years"], U["p50"], color=ACCENT, lw=1.2, ls="--", label="Median of sequences")
ax.plot(years, [r["elevationFt"] for r in D["path"]], color=ACCENT, lw=2.4, label="Our proposal, average inflow")
ax.plot(years, [r["elevationFt"] for r in D["doNothingPath"]], color=GREY, lw=2, label="Doing nothing, average inflow")
ax.axhline(S["healthyMinFt"], color=DARK, lw=0.8, ls=":")
ax.axhline(S["targetFt"], color=DARK, lw=0.8)
ax.text(years[0], S["targetFt"] + 0.15, f"Goal {S['targetFt']:,.1f} ft (healthy floor + 0.5 ft)", fontsize=8.5, color=DARK)
ax.axhline(D["doNothing"]["seriousLowFt"], color=BAD, lw=0.8, ls=":")
ax.text(years[0], D["doNothing"]["seriousLowFt"] - 0.6, f"Serious adverse effects below {D['doNothing']['seriousLowFt']:,.0f} ft", fontsize=8.5, color=BAD)
fy = S["firstYearAtTarget"]
if fy:
    ax.annotate(f"Goal first reached {fy}", xy=(fy, S["targetFt"]), xytext=(fy - 9, S["targetFt"] + 2.4), fontsize=8.5, color=DARK,
                arrowprops=dict(arrowstyle="-", color=GREY, lw=0.8))
ax.set_ylabel("Lake elevation (ft, south arm)"); ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _: f"{v:,.0f}"))
ax.legend(frameon=False, fontsize=8, loc="lower right")
title(ax, f"Our proposal reaches {S['targetFt']:,.1f} ft by {fy}; doing nothing leaves the lake near {D['doNothing']['finalElevationFt']:,.0f} ft",
      f"{U['shareHealthy']*100:.0f}% of simulated inflow sequences end 2055 in the healthy range")
save(fig, "fig01-lake-path")

# 2. Water reaching the lake by lever, 2055
y55 = D["snapshots"]["y2055"]["withPackage"]
deliv = y55["deliveryShare"]
parts = [("Rights held and repossessed, shepherded", y55["shepherdedKaf"]), ("Conservation programmes", y55["programKaf"]),
         ("Crop levy", y55["levyKaf"]), ("Mandate (forced)", y55["forcedKaf"]), ("Scarcity charge", y55["chargeBehaviourKaf"]),
         ("Lawns", y55["lawnKaf"]), ("Less: growth in demand", -y55["growthDrawKaf"]), ("Less: shrinking rivers", -y55["streamflowDeclineKaf"])]
fig, ax = plt.subplots(figsize=(8, 4))
labels = [p[0] for p in parts]; vals = [p[1] for p in parts]
cols = [ACCENT if i == 0 else (BAD if v < 0 else GREY) for i, v in enumerate(vals)]
ax.barh(labels[::-1], vals[::-1], color=cols[::-1])
for i, v in enumerate(vals[::-1]):
    ax.text(v + 8 if v >= 0 else 8, i, f"{v:,.0f}", va="center", ha="left", fontsize=8.5, color=DARK)
ax.set_xlabel("KAF per year (gross, before the delivery share)")
title(ax, f"Shepherded rights carry most of the water; {y55['netToLakeKaf']:,.0f} KAF a year reaches the lake in 2055",
      f"Gross water by lever, 2055; about {deliv*100:.0f}% of delivered water survives the trip")
save(fig, "fig02-water-by-lever")

# 3. Who depletes the water
cons = sorted(D["sectors"]["byDepletion"], key=lambda c: c["kaf"])
fig, ax = plt.subplots(figsize=(8, 3.8))
ax.barh([c["label"] for c in cons], [c["kaf"] for c in cons], color=[ACCENT if c["id"] == "hay" else GREY for c in cons])
for i, c in enumerate(cons):
    ax.text(c["kaf"] + 10, i, f"{c['kaf']:,.0f}", va="center", fontsize=8.5, color=DARK)
ax.set_xlabel("Depletion, KAF per year (water consumed, not diverted)")
title(ax, f"Alfalfa and other hay deplete {cons[-1]['kaf']:,.0f} of {D['sectors']['basinDepletionKaf']:,.0f} KAF a year",
      "Human depletion in the Great Salt Lake basin by user, 2020-24 averages (residential split 2024)")
save(fig, "fig03-sector-depletion")

# 4. Output per acre-foot
v = sorted(D["sectors"]["outputPerAcreFoot"], key=lambda x: x["dollarsPerAf"])
fig, ax = plt.subplots(figsize=(8, 4.6))
colmap = {"taken": ACCENT, "untouched": GREY, "proposed": LIGHT}
ax.barh([x["label"] for x in v], [x["dollarsPerAf"] for x in v], color=[colmap[x["category"]] for x in v])
ax.axvline(D["sectors"]["lakeValuePerAf"], color=DARK, lw=1)
ax.text(D["sectors"]["lakeValuePerAf"] * 1.1, 0.2, f"Lake: ${D['sectors']['lakeValuePerAf']:,.0f}/AF", fontsize=8.5, color=DARK)
ax.set_xscale("log"); ax.xaxis.set_major_formatter(FuncFormatter(lambda x, _: f"${x/1e6:,.0f}M" if x >= 1e6 else (f"${x/1e3:,.0f}k" if x >= 1e3 else f"${x:,.0f}")))
for i, x in enumerate(v):
    ax.text(x["dollarsPerAf"] * 1.15, i, f"${x['dollarsPerAf']:,.0f}", va="center", fontsize=7.5, color=DARK)
ax.set_xlabel("Output per acre-foot consumed (log scale)")
title(ax, f"Hay earns ${D['sectors']['hayValuePerAf']:,.0f} per acre-foot; the same water is worth ${D['sectors']['lakeValuePerAf']:,.0f} in the lake",
      "Blue: uses the proposal takes water from; dark grey: uses left alone; light grey: proposed industry")
save(fig, "fig04-value-per-af")

# 5. Jobs lost and gained
fig, ax = plt.subplots(figsize=(8, 3.8))
cats = ["Field work lost", "Dairy and beef lost", "Transition work gained", "Lake economy gained", "Net"]
for k, (yr, key) in enumerate([("2035", "y2035"), ("2055", "final")]):
    j = D["jobs"][key]
    vals = [-j["fieldLost"], -j["livestockLost"], j["transitionGained"], j["lakeEconomyGained"], j["net"]]
    xs = [i + (k - 0.5) * 0.38 for i in range(len(cats))]
    ax.bar(xs, vals, width=0.36, color=[BAD, BAD, GOOD, GOOD, DARK], alpha=0.5 if k == 0 else 1)
    for x in xs:
        ax.text(x, -9300, yr, ha="center", fontsize=7.5, color=GREY)
    for x, val in zip(xs, vals):
        ax.text(x, val + (150 if val >= 0 else -150), f"{val:,.0f}", ha="center", va="bottom" if val >= 0 else "top", fontsize=7.5)
ax.set_xticks(range(len(cats))); ax.set_xticklabels(cats, fontsize=8.5); ax.axhline(0, color=GREY, lw=0.8)
ax.set_ylabel("Jobs, statewide"); ax.set_ylim(-9800, 9000)
title(ax, f"Jobs: {D['jobs']['final']['net']:,.0f} net in 2055, but losses fall on farm counties and gains on the lake",
      "Red: lost; green: gained; statewide totals; left bar of each pair 2035, right bar 2055")
save(fig, "fig05-jobs")

# 6. Yearly budget
rows = D["schedule"]["rows"]; lev = D["schedule"]["levers"]
fig, ax = plt.subplots(figsize=(8, 4))
bottom = [0] * len(rows)
shade = [ACCENT, "#7baaf7", "#aecbfa", GREY, "#bdc1c6", LIGHT]
for i, l in enumerate(lev):
    vals = [(r["spend"][l["id"]] + (r["committedM"] if l["id"] == "leaseM" else 0)) for r in rows]
    ax.bar([r["year"] for r in rows], vals, bottom=bottom, color=shade[i], label=l["label"], width=0.8)
    bottom = [b + x for b, x in zip(bottom, vals)]
ax.set_ylabel("$M per year"); ax.legend(frameon=False, fontsize=7.5, ncol=3, loc="upper center", bbox_to_anchor=(0.5, -0.12))
title(ax, f"Every year spends the whole ${D['scenario']['dials']['budgetM']:,.0f}M; monitoring is the largest line",
      "Year-by-year split chosen for the most net economic value while meeting the goal")
save(fig, "fig06-yearly-budget")

# 7. Lake physics
c = D["lakePhysics"]["curve"]
fig, ax = plt.subplots(figsize=(8, 3.8))
ax.plot([x["elevationFt"] for x in c], [x["inflowToHoldKaf"] for x in c], color=ACCENT, lw=2.2)
ax.axhline(D["lakePhysics"]["baselineInflowKaf"], color=GREY, lw=1)
ax.text(c[0]["elevationFt"], D["lakePhysics"]["baselineInflowKaf"] + 30, f"River inflow now: {D['lakePhysics']['baselineInflowKaf']:,.0f} KAF/yr", fontsize=8.5, color=DARK)
ax.axvline(S["healthyMinFt"], color=DARK, lw=0.8, ls=":")
ax.set_xlabel("Lake elevation (ft)"); ax.set_ylabel("Inflow needed to hold it (KAF/yr)")
ax.xaxis.set_major_formatter(FuncFormatter(lambda v, _: f"{v:,.0f}"))
title(ax, "Each foot of recovery costs more water than the one below it", "Inflow that holds the lake at each level: area x net evaporation (USGS area table)")
save(fig, "fig07-lake-physics")

# 8. Sensitivity tornado (top 15)
sens = D["sensitivity"][:15]
base = S["finalElevationFt"]
fig, ax = plt.subplots(figsize=(8, 5.2))
for i, r in enumerate(sens[::-1]):
    lo, hi = r["lowElevation"] - base, r["highElevation"] - base
    ax.barh(i, lo, color=GREY); ax.barh(i, hi, color=ACCENT)
ax.set_yticks(range(len(sens))); ax.set_yticklabels([r["label"][:48] for r in sens[::-1]], fontsize=8)
ax.axvline(0, color=DARK, lw=0.8); ax.set_xlabel("Change in 2055 lake level (ft) at each end of the plausible range")
title(ax, "The lake's own water balance moves the answer more than any lever", "Grey: low end of range; blue: high end; one number changed at a time")
save(fig, "fig08-sensitivity")

# 9. Doing nothing, under drier climates
fig, ax = plt.subplots(figsize=(8, 4.2))
for s, col in zip(D["dryScenarios"], [GREY, "#bdc1c6", "#e8a29a", BAD, "#8c3b30"]):
    ax.plot(U["years"], s["p10Path"], color=col, lw=1.8, label=f"{s['label']}: {s['p10FinalFt']:,.1f} ft")
ax.axhline(D["doNothing"]["seriousLowFt"], color=BAD, lw=0.8, ls=":")
ax.set_ylabel("Lake elevation (ft), 10th percentile"); ax.legend(frameon=False, fontsize=7.5, loc="lower left")
ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _: f"{v:,.0f}"))
worst = D["dryScenarios"][-1]
title(ax, f"With no package, one dry sequence in ten ends near {worst['p10FinalFt']:,.0f} ft under warming and drought",
      f"10th percentile of {U['runs']} sequences per climate; lake area falls from {worst['areaTodaySqMi']:,.0f} to {worst['areaAtP10SqMi']:,.0f} sq mi")
save(fig, "fig09-do-nothing")

# 10. Lease supply curve (the model's own form)
coef = {x["id"]: x["value"] for x in D["coefficients"]}
qref = coef["lease_capacity"] + coef["retire_capacity"]
qs = list(range(0, int(qref * 1.6) + 1, 5))
price = [min(coef["lease_base_rate"] * coef["lease_rate_ceiling"], max(coef["lease_base_rate"] * coef["lease_rate_floor"], coef["lease_base_rate"] * (1 + q / qref) ** (1 / coef["lease_elasticity"]))) for q in qs]
fig, ax = plt.subplots(figsize=(8, 3.8))
ax.plot(qs, price, color=ACCENT, lw=2.2)
ax.axvline(qref, color=GREY, lw=0.8, ls=":"); ax.text(qref + 4, price[0], f"Willing-seller capacity {qref:,.0f} KAF", fontsize=8.5, color=DARK)
ax.set_xlabel("Rights already held (KAF/yr)"); ax.set_ylabel("Annual lease rate ($/AF), before any charge")
title(ax, "Each acre-foot bought makes the next one dearer", f"Lease supply as the model draws it: base ${coef['lease_base_rate']:,.0f}/AF, elasticity {coef['lease_elasticity']:g}")
save(fig, "fig10-lease-supply")

# 11. Costs and benefits
fig, ax = plt.subplots(figsize=(8, 4.2))
for k, key in enumerate(["y2035", "y2055"]):
    r = D["snapshots"][key]["withPackage"]
    costs = [r["publicSpendM"], r["farmRevenueLostM"], r["livestockReceiptsAtRiskM"]]
    left = 0
    for v, col, lab in zip(costs, [DARK, GREY, LIGHT], ["Public budget", "Farm revenue lost", "Livestock receipts at risk"]):
        ax.barh(k * 2 + 0.4, v, left=left, color=col, height=0.6, label=lab if k == 0 else None); left += v
    ax.barh(k * 2 - 0.4, r["benefitM"], color=ACCENT, height=0.6, label="Value of water reaching the lake" if k == 0 else None)
    ax.text(left + 20, k * 2 + 0.4, f"${left:,.0f}M", va="center", fontsize=8.5)
    ax.text(r["benefitM"] + 20, k * 2 - 0.4, f"${r['benefitM']:,.0f}M", va="center", fontsize=8.5)
ax.set_yticks([0, 2]); ax.set_yticklabels(["2035", "2055"]); ax.set_xlabel("$M per year")
ax.legend(frameon=False, fontsize=8, ncol=2, loc="upper center", bbox_to_anchor=(0.5, -0.2))
title(ax, "The full cost is about three times the budget, and still a fraction of the value", "Cost = public budget + uncompensated farm revenue + livestock receipts at risk")
save(fig, "fig11-cost-benefit")

# 12. Alfalfa in national context
F = {f["id"]: f["value"] for f in D["appendixFacts"]["facts"]}
us, ut = F["us_alfalfa_tons_2023"], F["utah_alfalfa_tons_2023"]
basin_share = coef["hay_acres"] / F["utah_alfalfa_acres_2023"]
fig, ax = plt.subplots(figsize=(8, 2.8))
vals = [("United States", us), ("Utah", ut), ("Utah, Great Salt Lake basin (by acreage)", ut * basin_share), ("Hay forgone under our proposal, 2055", S["hayTonsLost"])]
ax.barh([x[0] for x in vals][::-1], [x[1] / 1e6 for x in vals][::-1], color=[ACCENT, GREY, GREY, GREY])
for i, (_, x) in enumerate(vals[::-1]):
    ax.text(x / 1e6 + 0.5, i, f"{x/1e6:,.2f}M tons ({x/us*100:.1f}% of US)", va="center", fontsize=8)
ax.set_xscale("log"); ax.set_xlabel("Alfalfa hay, million tons a year (log scale)")
title(ax, f"Utah grows {ut/us*100:.1f}% of US alfalfa; the basin about {ut*basin_share/us*100:.1f}%",
      "NASS 2023 production; basin share by irrigated forage acreage. The model's hay forgone counts all agricultural water removed as hay (see Section 5)")
save(fig, "fig12-alfalfa-national")
print("figures written")
