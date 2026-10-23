# Hand-off: the technical appendix

Last updated 2026-10-23. Branch `claude/clever-bardeen-unjgd2`. The brief is `APPENDIX-PROMPT.md`.

## Done
- Data: `research/appendix-data.json`, from `npx tsx scripts/export-appendix-data.ts research/optimised-dials.json research/appendix-data.json`. It uses the corrected model and the goal-search package, which is `DEFAULT_DIALS`.
- Facts quoted from cited sources: `research/appendix-facts.json`. Evidence: `research/evidence/all-evidence.json` (44 records).
- Figures: `appendix/figures/fig01`–`fig12` (.png and .svg), from `python3 scripts/appendix_figures.py`. Needs matplotlib: `pip install matplotlib`.
- The Claude Doc is created, with all 32 tabs in the right order and nesting. Each tab holds one empty "pending" block.
  - Link: https://claude.ai/artifact/FrSEUqpyCirTUVNnSbBNME
  - Doc id: 7846ef9d-8b44-4558-842f-4278ab058699
  - `appendix/work/doc-ids.json` maps each tab key to `[tab id, body node id, pending block id]`. To fill a tab, `replace` that pending block id on that body node.
  - `appendix/work/tabs.json` is the tab plan.

## Not done
1. Upload the figures to the doc. Use the Artifact publish action with `url` = the doc link, `asset: true` and `file_paths` = the PNGs. Then `create` a blob for each asset id and embed it with `![caption](blob/<id>)`. The owner rejected this upload once, so ask before trying again, or skip it and describe the figures with links to the repo files.
2. Write every tab: 1.1–1.10, 2 (intro), 2A.1–2A.7, 2B.1–2B.11, 3, 4, 5. Use one call per tab. Save each tab to `appendix/NN-<slug>.md` as it is finished, plus `appendix/index.md`.
3. Leave one doc comment asking the owner to confirm an assumption.
4. Run the checks:
    - `npx tsc --noEmit`;
    - `npx vitest run` (only the header-summary test is expected to fail);
    - every bibliography entry is cited, and every citation appears in the bibliography.
5. Commit and push.
6. Write the final reply: the doc link, one paragraph on what the document says, the contradictions fixed, and the gaps found.

## Contradictions to log in Section 5
- The brief gives hay as $245/AF; the live figure is $368/AF.
- The brief says 103 coefficients; there are 102.
- The goal was 875 KAF and is now 800.
- Some evidence records quote values from before the corrections.
- The farmer compensation coefficients were removed.
- Hay forgone in the model (1.78M tons, 415k acres) exceeds the basin's alfalfa (about 0.91M tons, 228k acres). The model counts all agricultural water removed as hay, at 2.4 AF/acre.
- The yearly split figures in the old report are stale.
- The do-nothing run still shows lake jobs, because of the dry-year rebound.

## Gaps to log in Section 5
- The "five-year disappearance" paper is not in the repo.
- There are no illness counts; health is given in dollars only.
- There is no hay elasticity in the repo.
- Data-centre water volumes are not published.
- The lawn-fine flaw.
- Two Wiley sources block bots; earthref and wateronline links failed.
- The hosted model artifact could not be found.
