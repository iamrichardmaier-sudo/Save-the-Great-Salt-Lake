# Who owns what

Four accounts build in parallel. Ownership is by **directory**, not by feature — that is what
decides whether the merge is clean.

| Stream | Branch | Owns | Builds |
|---|---|---|---|
| **A — Solver** | `stream-a-solver` | `src/solver/*`, and alone may edit `src/model.ts`, `src/simulate.ts`, `src/lake.ts`, `src/data.ts` | Objectives, constraints, the search, shadow prices, county allocation |
| **B — Input** | `stream-b-input` | `src/ui/controls/*`, `src/ui/wizard/*` | Expert mode, guided walkthrough, bottleneck tips |
| **C — Analysis** | `stream-c-analysis` | `src/ui/charts/*`, `src/ui/map/*` | Charts, playback bar, county map |
| **D — Experience** | `stream-d-experience` | `src/ui/lake3d/*`, `src/personas/*` | 3D lake, synthetic population |

## The six rules

1. **Stay in your directories.** If you need something outside them, ask the owner.
2. **Nobody edits `package.json`.** Every dependency went in with the foundation commit. If you
   genuinely need another, say so rather than adding it.
3. **Only Stream A edits the model.** `data.ts`, `model.ts`, `lake.ts`, `simulate.ts`.
4. **No view owns a clock, and no view runs the model.** Read the year from `src/app-state.ts`.
   There is one year, so every view moves together.
5. **No coefficient is hard-coded in a view.** Read it from `src/data.ts`, where it carries its
   source.
6. **No literal colours.** Style from the tokens in `src/ui/theme.css`, or the four streams will
   not look like one app.

## Shared files

Changing any of these is a coordination event — tell the other streams first.

- `src/app-state.ts` — the store
- `src/contracts.ts` — the interfaces every stream builds against
- `src/ui/theme.css` — design tokens
- `package.json`, `tsconfig.json`, `index.html`, `src/main.ts`

## Branching

Branch from `integration`. Merge back to `integration`, never into another stream's branch.

```bash
git fetch origin && git checkout -b stream-X-name origin/integration
```

Run `npm test` and `npx tsc --noEmit` before every push. The existing 179 tests must keep passing;
if one of them breaks, you have changed something that belongs to someone else.

## Dependencies available

`d3` · `three` · `topojson-client`, with types for each. Plus `vitest`, `jsdom`, `tsx`, `vite`,
`typescript`.
