# Hand-off: the technical appendix

Last updated 2026-10-23. Branch `claude/clever-bardeen-unjgd2`. The brief is `APPENDIX-PROMPT.md`.

## Status: written

- The appendix is a Claude Doc with 32 tabs, all filled: https://claude.ai/artifact/4Eb8aFdgegEy98VF4YkkfF (doc id 1a311e63-5efb-4c66-90dd-982873fa04be).
  - The earlier doc (7846ef9d-…) was not shared with the account that wrote the text, so the doc was recreated with the same tabs. `appendix/work/doc-ids.json` maps the new tab, body and figure blob ids.
- Every tab is saved as Markdown in `appendix/NN-*.md`; `appendix/index.md` lists them.
- The twelve figures are uploaded to the doc and embedded.
- One doc comment on tab 1.1 asks the owner whether the edge-of-range package should stay the default.
- `python3 scripts/check_appendix_citations.py` checks that the bibliography (tab 4) and the inline citations match.

## Open items

- The hemp figures in tab 1.6 are new research read from search summaries; the container could not open web pages. Check them at source.
- Gaps and contradictions are listed in tab 5 (`appendix/32-contradictions-gaps.md`).
