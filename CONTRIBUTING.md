# Contributing to Under The Hood

Thanks for your interest in contributing! This project is a fully static
documentation site — most contributions are **new topic content**.

## Development setup

- **Node.js ≥ 20** and **pnpm ≥ 9** (pinned via `packageManager`).

```bash
pnpm install        # install dependencies (lockfile is authoritative)
pnpm dev            # local dev server
pnpm check          # svelte-check (strict TypeScript)
pnpm lint           # ESLint
pnpm build          # production SSG build (fails on invalid content)
```

All three of `pnpm check`, `pnpm lint`, and `pnpm build` must pass before a PR
is merged (CI runs the same commands — see `.github/workflows/ci.yml`).

## Adding a topic

Create `content/<category>/<subcategory>/<id>.json`. The build validates every
file and fails with the offending path if the shape is wrong (see
`src/lib/content/validate.ts` for the authoritative rules):

- `id`, `title`, `category` (`frontend`|`backend`), `subcategory`,
  `lastUpdated` (`YYYY-MM-DD`) — required non-empty strings.
- `tags`: **at least 3** non-empty strings.
- `prerequisites`: **at least 1** non-empty string.
- `progressiveExplaining`: all four depths (`eli5`, `junior`, `senior`,
  `underTheHood`) non-empty.
- `codeComparison`: `title`, `summary`, and both `legacyOrBad`/`modernOrGood`
  sides with `label`, `snippet`, and `fullFile` (`filename`, `language`,
  `code`).
- `interviewGotchas`: **exactly two** entries with `question`, `contextIntro`,
  `detailedAnswer`, `trapWarning`.
- `rosettaStone` (optional): framework → code snippet. Unknown frameworks fall
  back to plain-text highlighting; prefer keys already used in `content/`
  (see `ROSETTA_LANG` in the topic `+page.server.ts`).

The "How to Add a New Topic" section in `README.md` shows a complete example.

## Style & scope notes

- Keep titles free of unescaped HTML intent; titles are rendered as text
  everywhere (search palette escapes them too).
- Prefer concrete, mechanical explanations over marketing language; the four
  depth tiers are the product.
- Code snippets should show the legacy/modern contrast the topic claims.

## Reporting bugs

Use GitHub issues for content errors and UI bugs. For security issues, see
`SECURITY.md` (private reporting only).
