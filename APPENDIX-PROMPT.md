# Prompt: build the Great Salt Lake proposal appendix

Paste everything below this line into a fresh Claude Code session that has this repository
checked out.

---

You are writing a long-form appendix documenting a water-allocation proposal for the Great Salt
Lake. It will be submitted to competition judges, legislators and faculty.

This repository is the team's research store and model. It is an internal tool — **no reader of
your document will ever see it**. Your job is to turn what is in it into a document that stands
on its own.

## The single most important instruction

**Everything in this repository has already been researched and verified, more than once. Treat
every number and every citation in it as fact. Do not re-check sources. Do not fetch URLs to
confirm them. Do not second-guess a figure.** That verification is done and repeating it would
burn the budget this task has.

The matching rule: **never invent a citation, a statistic, a URL, an author or a year that is not
already in the repository.** Use what is there, exactly as it is there. If something is not in the
repository, it belongs in the Predictions section (described below), not in a footnote.

There is exactly one narrow exception, under "The alfalfa chapter" below.

## Before you write anything: get the numbers in one command

Do not read the TypeScript to find a number. Run this once:

```bash
npm install          # only if node_modules is missing
npx tsx scripts/export-appendix-data.ts research/optimised-dials.json research/appendix-data.json
```

If `research/optimised-dials.json` does not exist, run it with no arguments and say so in your
first progress note — the team is supplying the optimised toggle settings and they may be in the
report they hand you instead.

That writes `research/appendix-data.json` (~165 KB), which contains **every figure the appendix
needs**, already computed:

| Key | What it holds |
|---|---|
| `scenario` | The optimised dials, the goal, whether the goal is reached, the final lake level, how the water was obtained |
| `path`, `doNothingPath` | Year by year, 2027 to 2055, with and without the proposal |
| `snapshots.y2035`, `snapshots.y2055` | The two in-process snapshots you need |
| `doNothing` | The counterfactual: where the lake settles untouched, share of runs below the serious line |
| `uncertainty` | The 10th–90th percentile band across simulated inflow sequences, and the share ending healthy |
| `sensitivity` | All 40 coefficients ranked by how far each moves the lake — **this is your ordering for Section 2** |
| `sectors` | Depletion by user group, output per acre-foot by use, the industrial pipeline |
| `jobs`, `economics`, `politics` | Jobs lost and gained, full costs and benefits, support scores |
| `levers` | Programme-by-programme results, the levy, the charge, the lawn model |
| `lakePhysics` | The area–elevation curve and the inflow needed to hold each level |
| `coefficients` | **All 103 figures** with value, unit, status, basis, formula, range, confidence and full source records |
| `sources` | Every source with title, publisher, year, URL and locator |

Read these files and nothing else unless you have a specific reason:

- `research/appendix-data.json` — the numbers
- `research/evidence/all-evidence.json` — 44 evidence records tied to assumption ids, each with a
  verbatim finding, a source, a value, and an analogue strength from 1 to 5
- `research/findings.md` — known discrepancies already documented
- `README.md` — what the model is and where it is weakest
- Whatever research report the team hands you

**Do not read** `src/ui/*`, `src/main.ts`, `index.html` or `src/styles.css`. They are interface
code with no research in them, and they are long.

## Work in chunks, save constantly

The deadline is tight and the session may stop without warning.

1. Write each tab to its own Markdown file in `appendix/` **as you finish it**, never holding
   finished prose only in your reply.
2. After each tab, print one line: what you finished and what is next.
3. Build the Google Doc at the end from those files, or as you go if the connector is available.

If you are confident you can finish inside half your budget, do it in one pass. Otherwise deliver
tab by tab.

## Output format

**A Google Doc, using native tabs** — one tab per section listed below, so the team can reorder
them. Create it through the Claude Docs connector if you have it.

If you have no document connector, write the whole thing as Markdown files in `appendix/` plus a
`appendix/README.md` index, and say clearly in your final message that the team needs to import
them. Do not silently produce a different format.

- Normal page size, normal margins, normal font. It will not be printed, so use colour.
- **Inline hyperlinks** in the text, plus a **bibliography at the end**, APA style, clean and
  consistent.
- Anonymous. No team name.
- Write as "our proposal" and "we".
- Neutral academic, but readable. **The judges will not read all of it** — they will skim the
  table of contents and the headings to see what is covered. So every heading must say what is
  under it, and no section may be a wall of numbers. Write prose that a smart person outside the
  field can follow, with the numbers carried inside sentences rather than dumped in lists.

## Charts

Generate them from `research/appendix-data.json` with a script — you have no browser, so do not
attempt screenshots. Use `matplotlib` via `python3` if it is available; otherwise write SVG
directly. Put them in `appendix/figures/` and embed them.

Choose the charts and their order yourself; the team will review and rearrange. At minimum:
the lake level over time with the uncertainty band and the healthy range shaded; water by lever
over time; depletion by sector; output per acre-foot on a log scale; jobs lost and gained with a
net line; the sensitivity ranking; the area–elevation curve; and a supply-and-demand diagram
wherever Section 2 calls for one.

Caption every figure with what it shows and which model run it came from.

---

# Section 1 — The proposal

The story, in this order. This is the most readable part of the document and the part most likely
to be read at all.

**1.1 Background.** In depth, told as a story, so the reader finishes it believing the authors
understand the problem. Not pages and pages. Cover: why a terminal lake with no outlet behaves
the way it does, how far the lake has fallen, what is at stake (dust and health, brine shrimp,
mineral extraction, recreation and tourism, the migratory bird population), and why the problem is
getting harder rather than easier — a bigger lake evaporates more, so each foot of recovery costs
more water than the one below it.

**1.2 Where we are now.** Current level against the healthy range. Who depletes the water, **by
depletion, not diversion** — `sectors.byDepletion` is already on that basis. How much is
agriculture, and how much of that is hay.

**1.3 Our proposal.** The optimised scenario from `scenario.dials`. Each instrument, what it does,
what it delivers, and what it costs. Explain the logic of the package: why these instruments and
not others.

**1.4 Why we chose it.** The economic case. Hay earns roughly $245 per acre-foot depleted while
the same water is worth roughly $2,440 in the lake — read the live figures from
`sectors.hayValuePerAf` and `sectors.lakeValuePerAf`. Explain why that gap is the entire argument,
and why the proposal takes water from there rather than anywhere else.

**1.5 When we reach the goal.** The projection, with the meteorological uncertainty shown as a
band and not a line, because inflow varies more than any policy lever. Give the share of simulated
sequences that end in the healthy range. Be straight about what the model says: if the scenario
reaches the goal, say when; if it falls short, say by how much. `scenario.reachesGoal` answers it.

**1.6 Effects.** The most readable section in the document, and it must be genuinely two-sided.
Give each of these three times — **in 2035**, **in 2055**, and **if we do nothing** — using
`snapshots.y2035`, `snapshots.y2055` and `doNothing`:

- Jobs, statewide totals: field jobs lost, dairy and beef at risk, transition and monitoring work
  created, lake-economy jobs that only exist if the lake recovers. Net. Say plainly that the jobs
  lost and the jobs gained are not in the same counties.
- Farmland: acres leaving irrigation, tons of hay forgone.
- Health: the avoided dust damage, and what that means for people rather than only in dollars.
- Mineral extraction: how much of the industry depends on the lake staying viable. **Do not
  discuss what happens if the lake becomes too fresh** — out of scope.
- Brine shrimp, recreation and tourism: cover them, briefly.
- The whole thing as one economic figure: public budget, plus uncompensated farm revenue, plus
  livestock receipts at risk, set against avoided damage and the medical and mineral value
  preserved. `economics` has all of it. Never present the public budget alone as the cost.

For the do-nothing case, model the lake going dry, not merely declining further. If the team's
research includes the widely cited paper warning the lake could disappear within about five years,
cite it here. **If that paper is not in the repository or the supplied report, do not invent the
citation** — describe the risk from the model's own output and list the missing citation in your
gaps note so the team can add it.

**1.7 Data centres.** A short section, because it will be asked about. Cover: the announced
facility and whether it is closed-loop, how much water it actually consumes against what was
feared, whether that water is treatable and returns to the lake, and how much more output per
acre-foot it produces than farmland. The repository has the output-per-acre-foot figures and the
total announced industrial water demand in `sectors`. Ground every claim in those figures. **Where
the repository does not support a claim about the facility, say what the repository does show and
put the rest in the Predictions section** rather than asserting it. Close with how the proposal
would handle industrial water demand growth.

---

# Section 2 — Assumptions

Every one of the 103 figures in `coefficients`, grouped into **two parts**:

**Part A — The levers.** The variables the team adjusts: budget, monitoring, lease-to-own money,
water-right price, the scarcity charge, the crop levy and its threshold, the mandate floor, phase
and penalty, repossession, programme spending, and the lawn dials.

**Part B — The constants.** Everything the model relies on but nobody sets: the lake physics,
depletion shares, delivery and shepherding, prices, capacities, jobs rates, hydrology.

Within each part, **order by how much the figure moves the result** — `sensitivity` is already
ranked, so follow it. The ones that matter most come first.

**Half a page minimum, two pages maximum each.** Short ones can run one after another under a
shared heading; the big ones get their own.

For each, in this shape:

1. What the model assumes, and the value it uses.
2. Where it comes from — the `basis` and `sources` fields, as a narrative, not a citation dump.
3. **Where a real historical analogue exists, tell it as a story**: what was tried somewhere else,
   what happened, what was measured, and how the situation differs from Utah's — climate, water
   law, crop mix, scale, politics. `research/evidence/all-evidence.json` has these, each with a
   strength rating from 1 to 5. Be honest about weak analogues; say when one is only loosely
   related. **Where no real analogue exists, do not manufacture one.**
4. **Where the assumption is about a market, build the economics**: a supply and demand diagram,
   the elasticity, and what moves when the quantity changes. You decide which assumptions support
   this; many do. Worked example of the standard the team wants:

   > *Alfalfa water consumption* — typical consumptive use per acre in the United States, the
   > supply and demand curve for hay, the elasticity of supply, what a **1% reduction in national
   > alfalfa supply** does to demand and price, and who that falls on. (The 1% figure is
   > approximately right: it is Utah's share of national production, narrowed to the Great Salt
   > Lake basin's share of Utah. Check it against the repository's acreage figures and state the
   > number you get.)

   > *Lease-to-own agreements* — as the state buys more leases, remaining holders become less
   > willing to sell, so the supply curve slopes up. Show it. Cover the policy around how long
   > before the state owns the right outright.

5. **Where the assumption is not a market** — evaporation rate, budget split, model mechanics — a
   short treatment is correct and expected. Do not force a supply and demand diagram onto a
   physical constant.

6. **Where a figure has no source but is built from other figures**, do not send it to Predictions.
   Show the derivation: which figures feed it, the formula (the `formula` field has it), and why
   that construction is reasonable.

Give every assumption a stable anchor so Section 1 can link to it, and link each bullet in Section
1 to its entry here.

---

# Section 3 — Predictions

At the end. Everything the model assumes with no research behind it: `coefficients` entries with
`status: "assumption"` and no sources, minus anything you documented as a derivation in Section 2.

Bullet points. One or two lines each on **why it was predicted that way** — that it resembles a
neighbouring case, that it is a reasonable midpoint, that it reflects how Utah does something.
Short and plain. Do not pad this section, and do not dress a guess up as a finding.

Do not flag these inline in Sections 1 and 2. Collect them here only.

---

# Section 4 — Bibliography

APA, from `sources` and the evidence records. Every work cited inline appears here, and nothing
appears here that is not cited.

---

# Housekeeping, at the very end

**Contradictions found and fixed.** As you write, if two parts of the repository disagree, **fix
it so the document is internally consistent**, then list every one here: what disagreed, which you
used, and why. The team wants these surfaced rather than hidden.

**Gaps.** Anything the document needed that the repository did not have. Dead links you noticed.
Citations the team should supply. Keep it short and specific.

---

## The alfalfa chapter — go deep

This gets its own chapter inside Section 1, and it is the one place more detail is wanted rather
than less. The proposal moves most of its water out of hay, so this is where a hostile reader will
push hardest.

Cover: how much water alfalfa consumes and why, what the crop is worth per acre-foot, where the
hay actually goes (the basin grows substantially more forage than its own herds eat, so the first
cut falls on exports rather than local feed — check `sectors` for the figures), and what reducing
it does to farmers.

**The tone matters.** Make it clear the proposal is not hostile to farming. It pays farmers
willingly for water that is worth ten times more in the lake, and it leaves the choice with them.

**This is the one place you may do limited additional research**: alternative crops that farmers
might switch to, specifically **wheat and hemp** — water requirements, market size, and what
switching would mean for farm income. Keep it proportionate, a few sources, and mark anything you
add as new research rather than blending it in with the verified material.

---

## What not to do

- Do not re-verify sources or fetch URLs to confirm them. It is done.
- Do not invent a citation, statistic, author, year or URL.
- Do not read the interface code.
- Do not recompute model numbers by hand — read them from the export.
- Do not present the public budget alone as the cost of the proposal.
- Do not write a single projected lake level without its uncertainty band.
- Do not hold finished prose in your reply instead of writing it to a file.

## When you are done

Give the team: the Google Doc link (or the file list), a one-paragraph summary of what the
document says, the contradictions you fixed, and the gaps you found. Nothing else.
