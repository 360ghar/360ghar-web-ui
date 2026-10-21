# Shared brief for parity agents (wave 2)

Project (edit here): /Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-web-ui-2 (Astro 7 + React islands + Tailwind 4, Netlify SSR). Not a git repo: no undo. Read a file fully before you change it; use small Edit calls.
Reference (read-only): /Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-web-ui (old v1 SPA).
Per-area notes from wave 1: docs/parity/{home,chat,seo-ops,data,client}.md. Read the ones for your area.

Read first: docs/conventions.md, docs/design-system.md, docs/design-law-check.md, and the section "The anti-slop design law" in /Users/sakshammittal/.claude/CLAUDE.md (binding for UI work; v2 design docs win on conflict).

## Hard rules
- No git commit/push, no `gh`. No POST/PUT/DELETE to api.360ghar.com, no real Formspree/IndexNow/Supabase writes. GET to public endpoints is fine.
- Another Claude session works in this repo and runs an `astro dev` server on http://127.0.0.1:4321 plus Playwright. NEVER start, stop or restart `astro dev`/build/preview and never kill processes. Playwright has no webServer block; it uses BASE_URL (default http://localhost:4321), which is that running server. Do not run `pnpm build`.
- Playwright: always `--workers=1 --output <your-own-folder-name>` (for example `--output test-results-<agent>`), one spec file at a time, single project first (`--project=phone`, then tablet, desktop). Never delete another folder's test-results. Call `hydrated(page)` before island clicks (see tests/e2e/helpers.ts). If the page shows `_jsxDEV is not a function` or islands never hydrate, STOP and report it (dev server cache issue); do not restart anything.
- Never invent data, reviews, stats or endpoints. Copy: en + hi, no em dashes, plain short sentences.
- UI rules: no kickers, pill chips, gradients, glows, icon tiles, filled+outlined button pairs, hover lift; tokens only; 44 px targets; WCAG 2.2 AA; content visible without animation; mobile first from 360 px.
- Other agents edit other files in parallel. Stay inside your ownership list; if you must touch another file, make the smallest edit and say so.
- Shared: package.json only for the lines your task needs (re-read first). Write notes to docs/parity/<area>.md (append).

## Verify with (no server needed): `npx vitest run <paths>`, `npx tsc --noEmit`, `npx eslint <files>`, `npx astro check` (transient errors in others' files: re-run once).

## Final report (mandatory, in depth)
1. Task table (DONE/PARTIAL/BLOCKED + reason). 2. Files created/changed. 3. Decisions. 4. Evidence: exact commands and output tails. 5. Design-law self-check. 6. Risks/unverified. 7. Follow-ups. Be honest; do not claim what you did not run.
