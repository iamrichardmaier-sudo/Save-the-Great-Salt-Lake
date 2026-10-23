# Prompt: write the Great Salt Lake proposal appendix

Paste everything below the divider into a fresh Claude Code session with this repository checked
out.

---

You are writing a long-form appendix documenting a water-allocation proposal for the Great Salt
Lake, for competition judges, legislators and faculty.

**The research is finished.** Every number, source and model in this repository has been
researched and verified already, more than once. You are not auditing it and not adding to it.
Your job is to take what is here and turn it into one well-organised, readable, properly formatted
document.

This repository is the team's internal research store. **No reader of your document will ever see
it.** The document has to stand on its own.

## Two rules

**1. Treat everything here as fact.** Do not re-check sources, do not fetch URLs to confirm them,
do not second-guess a figure. That work is done and repeating it would burn the budget.

**2. Never invent anything.** No citation, statistic, URL, author or year that is not already in
the repository. Anything unsupported goes in the Predictions section, never into a footnote. One
narrow exception, under Tab 1.6.

## First: get every number with one command

Do not read TypeScript to find a number.

```bash
npm install     # only if node_modules is missing
npx tsx scripts/export-appendix-data.ts research/optimised-dials.json research/appendix-data.json
```

If `research/optimised-dials.json` does not exist, run it with no arguments and say so in your
first progress note — the team is supplying the optimised toggle settings and they may be in the
report handed to you instead.

That writes `research/appendix-data.json` (~165 KB) holding **every figure the appendix needs**,
already computed: the scenario and its dials, the year-by-year path with and without the proposal,
2035 and 2055 snapshots, the do-nothing counterfactual, the uncertainty band, all coefficients
ranked by how much they move the result, sector tables, jobs, economics, support scores,
programme-by-programme results, the lake physics curves, and all 103 coefficients with basis,
formula, range, confidence and full source records.

Read only these: `research/appendix-data.json`, `research/evidence/all-evidence.json` (44 evidence
records keyed to assumption ids, each with a verbatim finding, source, value and a strength rating
of 1–5), `research/findings.md`, `README.md`, and whatever report the team hands you.

**Do not read** `src/ui/*`, `src/main.ts`, `index.html`, `src/styles.css`. Interface code, no
research in it, and long.

## Output

**A Google Doc using native tabs — one tab per numbered item below.** Create it through the Claude
Docs connector. If you have no document connector, write Markdown files to `appendix/` named in tab
order plus an index, and say clearly that the team must import them.

Normal page size, margins and font. Colour is fine; it will not be printed. **Inline hyperlinks**
in the text plus an **APA bibliography** at the end. Anonymous — no team name. Write as "our
proposal" and "we". Neutral academic but genuinely readable: the judges will skim headings, so
every heading must say what is under it, and no section may be a wall of numbers.

## Charts

No browser, so generate them from `research/appendix-data.json` with a script — `matplotlib` via
`python3` if available, otherwise write SVG directly. Put them in `appendix/figures/`, embed them,
caption each with what it shows and which run it came from. You choose which charts go where; the
team will rearrange.

## Work in chunks, save constantly

Write each tab to its own file **as you finish it**. Never hold finished prose only in your reply.
After each tab, print one line: what is done, what is next. If you are confident you can finish
inside half your budget, do it in one pass; otherwise deliver tab by tab.

---

# SECTION 1 — THE PROPOSAL

## Tab 1.1 — Overview: our proposal

The summary a judge reads if they read nothing else.

- **State the optimised toggles.** What every lever is set to in the scenario this document
  describes, from `scenario.dials`. The reader should finish this tab knowing exactly what
  configuration everything after it refers to.
- **The main models at those settings**, with the headline results.
- **The charts.** The main figures live here — lake trajectory, water by lever, sectors, jobs,
  value per acre-foot — enough that a reader gets the whole argument visually.
- **When we reach the goal**, shown with the **meteorological uncertainty** as a band, not a line,
  because inflow varies more than any policy lever. Give the share of simulated sequences ending
  in the healthy range. `scenario.reachesGoal` says whether the scenario gets there; if it falls
  short, say so and by how much.
- **The sectors**, three separate cuts, all from `sectors`:
  1. which deplete the most water (**by depletion, not diversion**);
  2. which lose the most water under our proposal;
  3. which are most profitable per acre-foot.
- **Alfalfa in brief** — how much water it consumes and the shape of our solution. Deep treatment
  is Tab 1.6; this is the headline.

## Tab 1.2 — Where we are now

Detailed background, told as a story, so the reader finishes believing we understand the problem.
In depth but not pages and pages. Why a terminal lake with no outlet behaves as it does, how far
the lake has fallen, what is at stake (dust and health, brine shrimp, mineral extraction,
recreation and tourism, migratory birds), and why the problem gets harder as you fix it — a bigger
lake evaporates more, so each foot of recovery costs more water than the one below it.

## Tab 1.3 — Our proposal

The package in detail: each instrument, what it does, what it delivers, what it costs, and how
they work together.

## Tab 1.4 — Why we came up with this solution

The reasoning. The economic case is the spine: hay earns roughly $245 per acre-foot depleted while
the same water is worth roughly $2,440 in the lake — use the live figures from
`sectors.hayValuePerAf` and `sectors.lakeValuePerAf`. Why that gap is the entire argument, why the
proposal takes water from there and not elsewhere, and what we considered and rejected.

## Tab 1.5 — The models

**A series of models, one deep explanation each**: what it does, how it works, what it produces,
why it is built that way.

**Then under each model, its assumptions as a short bullet list** — small and plain, "we assume
X." **Every bullet hyperlinks to that assumption's entry in Section 2.** Keep the bullets brief;
the depth lives in Section 2 and this is the index into it.

## Tab 1.6 — Alfalfa

Its own chapter, and go deep — the proposal moves most of its water out of hay, so this is where a
hostile reader pushes hardest.

How much water alfalfa consumes and why. What it earns per acre-foot. Where the hay actually goes:
the basin grows substantially more forage than its own herds eat, so the first cut falls on exports
rather than local feed — check `sectors`. What reducing it does to farmers.

**Tone matters.** Make clear the proposal is not hostile to farming. It pays farmers willingly for
water worth ten times more in the lake, and leaves the choice with them.

**The one place you may do limited additional research:** alternative crops farmers could switch
to, specifically **wheat and hemp** — water requirements, market size, what switching means for
farm income. Keep it proportionate and mark anything new as new research rather than blending it
with the verified material.

## Tab 1.7 — Data centres

Short, because it will be asked about. The announced facility and whether it is closed-loop, how
much water it actually consumes against what was feared, whether that water is treatable and
returns to the lake, and how much more output per acre-foot it produces than farmland. The
repository has output per acre-foot and total announced industrial demand in `sectors`.

**Ground every claim in those figures. Where the repository does not support a claim about the
facility, state what the repository does show and put the rest in Predictions** rather than
asserting it. Close with how the proposal handles industrial demand growth.

## Tabs 1.8, 1.9, 1.10 — The effects

Three tabs, same shape each time so they read side by side. **This is the most readable part of the
document** and must be genuinely two-sided: positive and negative, plainly.

- **Tab 1.8 — During the process (2035)**, from `snapshots.y2035`
- **Tab 1.9 — At the end (2055)**, from `snapshots.y2055`
- **Tab 1.10 — If we do nothing**, from `doNothing`

In each:

- **Jobs**, statewide totals: who loses them, field, dairy and beef; who gains them, transition
  work, monitoring, and the lake economy that only exists if the lake recovers; and the net. Say
  plainly that the jobs lost and gained are not in the same counties, so a net figure hides a real
  dislocation.
- **Farmland**: acres leaving irrigation, tons of hay forgone, how many people need new work.
- **Medical**: avoided dust damage, and **how many fewer people get sick**, not only dollars.
- **Mining**: how much more valuable mineral extraction stays as the lake comes up. Do not discuss
  what happens if the lake becomes too fresh — out of scope.
- **Brine shrimp, recreation and tourism**, briefly.
- **The whole thing as one economic figure**: public budget, plus uncompensated farm revenue, plus
  livestock receipts at risk, against avoided damage plus the medical and mineral value preserved.
  `economics` has it all. Never present the public budget alone as the cost.

For Tab 1.10, model the lake **going dry**, not merely declining. If the team's research includes
the widely cited paper warning the lake could disappear within about five years, cite it. **If it
is not in the repository or the supplied report, do not invent the citation** — describe the risk
from the model's own output and list the missing citation in your gaps note.

Keep each of these tight enough to actually be read.

---

# SECTION 2 — OUR ASSUMPTIONS

One tab per assumption or tight group, each titled **"Our assumptions regarding ___"** — *Our
assumptions regarding alfalfa water consumption*, *Our assumptions regarding lease-to-own
agreements*, and so on.

Cover **all 103 figures** in `coefficients`, in **two parts**:

- **Part A — The levers.** What we adjust: budget, monitoring, lease-to-own money, water-right
  price, scarcity charge, crop levy and threshold, mandate floor, phase and penalty, repossession,
  programme spending, lawn dials.
- **Part B — The constants.** What the model relies on but nobody sets: lake physics, depletion
  shares, delivery and shepherding, prices, capacities, jobs rates, hydrology.

**Within each part, order by how much the figure moves the result** — `sensitivity` is already
ranked, so follow it. **Half a page minimum, two pages maximum.** Short ones can run one after
another under a shared tab; big ones get their own.

**Write each as a story, not raw data:**

1. What we assume, and the value used.
2. Where it comes from — `basis` and `sources`, as narrative.
3. **The economics, where it is a market.** Build the model: supply and demand curve, the
   elasticity, what moves when quantity changes, who it falls on. Include the graph.
4. **The historical analogue, where a real one exists**, told as a story: *in Colorado this was
   tried, this is what happened, this is what was measured — and from that we can assume this,
   because Utah differs in these ways* (climate, water law, crop mix, scale, politics).
   `research/evidence/all-evidence.json` has these with strength ratings. Be honest about weak
   analogues. **Where no real analogue exists, do not manufacture one.**

**The two worked examples that set the standard:**

> **Our assumptions regarding alfalfa water consumption** — typical consumptive use per acre in
> the United States; the supply and demand curve for hay; the elasticity of supply; then what a
> **1% reduction in national alfalfa supply** does to demand, to price, and to people. (That 1% is
> approximately right: Utah's share of national production, narrowed to the basin's share of Utah.
> Check it against the repository's acreage figures and state the number you get.)

> **Our assumptions regarding lease-to-own agreements** — as we buy more leases, remaining holders
> become less willing to sell, so the supply curve slopes up. Show it. Then the policy around how
> long before the state owns the right outright.

Two more rules:

- **Not every assumption is a market.** Evaporation rate, budget split, model mechanics — a short
  treatment is correct. Do not force a supply and demand diagram onto a physical constant.
- **A figure with no source but built from other figures does not go to Predictions.** Show the
  derivation: which figures feed it, the formula (the `formula` field has it), and why that
  construction is reasonable.

Give every assumption a stable anchor so the Tab 1.5 bullets can link to it.

---

# SECTION 3 — OUR PREDICTIONS

At the very end. Everything we had to assume with no research behind it: `coefficients` entries
with `status: "assumption"` and no sources, minus anything documented as a derivation above.

**A bullet list.** One or two lines each on **why we predicted it that way** — that it resembles a
neighbouring case, that it is a reasonable midpoint, that it reflects how Utah does something.
Short and plain. Do not pad, and do not dress a guess as a finding.

Do not flag these inline in Sections 1 and 2. Collect them here only.

---

# SECTION 4 — BIBLIOGRAPHY

APA, from `sources` and the evidence records. Everything cited inline appears here; nothing appears
here that is not cited.

---

# SECTION 5 — CONTRADICTIONS AND GAPS

**Contradictions found and fixed.** If two parts of the repository disagree, **fix it so the
document is internally consistent**, then list every one: what disagreed, which you used, why.

**Gaps.** Anything the document needed that the repository did not have, dead links you noticed,
citations the team should supply. Short and specific.

---

## What not to do

- Do not re-verify sources or fetch URLs. It is done.
- Do not invent a citation, statistic, author, year or URL.
- Do not read the interface code.
- Do not recompute model numbers by hand — read them from the export.
- Do not present the public budget alone as the cost.
- Do not give a projected lake level without its uncertainty band.
- Do not hold finished prose in your reply instead of writing it to a file.

## When you are done

Give the team: the Google Doc link (or the file list), one paragraph on what the document says,
the contradictions you fixed, and the gaps you found. Nothing else.
